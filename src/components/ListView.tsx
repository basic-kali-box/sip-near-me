import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ItemCard, ItemCardItem } from "./ItemCard";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VALID_CATEGORIES, formatCategoryDisplay } from "@/utils/categories";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface ListViewProps {
  className?: string;
}

interface FilterState {
  categories: string[];
  specialties: string[];
  priceRange: [number, number];
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating';
}

export const ListView = ({ className }: ListViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ItemCardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    specialties: [],
    priceRange: [0, 100],
    sortBy: 'newest'
  });

  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use scroll direction hook to detect when to hide/show search bar
  const { shouldHideHeader } = useScrollDirection(
    scrollContainerRef.current,
    { threshold: 30, debounceMs: 30 }
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get all available drinks with seller information
        const { data: drinksData, error: drinksError } = await supabase
          .from('drinks')
          .select(`
            *,
            seller:sellers(
              id,
              business_name,
              address,
              phone,
              specialty,
              rating_average,
              rating_count,
              is_available,
              latitude,
              longitude
            )
          `)
          .eq('is_available', true)
          .eq('seller.is_available', true)
          .order('created_at', { ascending: false });

        if (drinksError) throw drinksError;
        if (!mounted) return;

        // Debug: Check if we're getting GPS data
        console.log('🔍 ListView: Sample seller data:', drinksData?.[0]?.seller);

        // Map to ItemCardItem format with defensive programming
        const mapped: ItemCardItem[] = (drinksData || []).map((drink: any) => {
          try {
            return {
              id: drink?.id || '',
              name: drink?.name || 'Unknown Item',
              description: drink?.description || null,
              price: typeof drink?.price === 'number' ? drink.price : 0,
              photo_url: drink?.photo_url || null,
              category: drink?.category || null,
              is_available: drink?.is_available !== false, // Default to true if undefined
              seller_id: drink?.seller_id || '',
              seller: drink?.seller ? {
                id: drink.seller.id || '',
                business_name: drink.seller.business_name || 'Unknown Business',
                address: drink.seller.address || '',
                phone: drink.seller.phone || '',
                specialty: drink.seller.specialty || 'both',
                rating_average: typeof drink.seller.rating_average === 'number' ? drink.seller.rating_average : 0,
                rating_count: typeof drink.seller.rating_count === 'number' ? drink.seller.rating_count : 0,
                latitude: typeof drink.seller.latitude === 'number' ? drink.seller.latitude : undefined,
                longitude: typeof drink.seller.longitude === 'number' ? drink.seller.longitude : undefined,
              } : undefined,
            };
          } catch (error) {
            console.error('Error mapping drink data:', error, drink);
            // Return a safe fallback object
            return {
              id: drink?.id || `error-${Math.random()}`,
              name: 'Error loading item',
              description: null,
              price: 0,
              photo_url: null,
              category: null,
              is_available: false,
              seller_id: '',
              seller: undefined,
            };
          }
        }).filter(item => item.id); // Remove any items without valid IDs

        setItems(mapped);
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Failed to load items');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredItems = useMemo(() => {
    try {
      const q = searchQuery.toLowerCase();
      let filtered = items.filter(item => {
        // Add defensive checks to prevent runtime errors
        if (!item || typeof item !== 'object') return false;

        // Search filter
        const name = item.name || '';
        const description = item.description || '';
        const category = item.category || '';
        const businessName = item.seller?.business_name || '';
        const specialty = item.seller?.specialty || '';

        const matchesSearch = !q || (
          name.toLowerCase().includes(q) ||
          description.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q) ||
          businessName.toLowerCase().includes(q) ||
          specialty.toLowerCase().includes(q)
        );

        // Category filter
        const matchesCategory = filters.categories.length === 0 ||
          filters.categories.includes(category);

        // Specialty filter
        const matchesSpecialty = filters.specialties.length === 0 ||
          filters.specialties.includes(specialty);

        // Price filter
        const price = typeof item.price === 'number' ? item.price : 0;
        const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

        return matchesSearch && matchesCategory && matchesSpecialty && matchesPrice;
      });

      // Sort filtered results
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.seller?.rating_average || 0) - (a.seller?.rating_average || 0));
          break;
        case 'newest':
        default:
          // Already sorted by created_at desc from the query
          break;
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering items:', error);
      return items; // Return unfiltered items as fallback
    }
  }, [items, searchQuery, filters]);
  // Real-time: refresh on availability changes and new drinks
  useEffect(() => {
    const drinksChannel = supabase
      .channel('drinks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drinks'
      }, () => {
        // Refresh items when drinks change
        window.location.reload(); // Simple refresh for now
      })
      .subscribe();

    return () => {
      supabase.removeChannel(drinksChannel);
    };
  }, []);

  // Filter helper functions
  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFilters(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      specialties: [],
      priceRange: [0, 100],
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.categories.length > 0 ||
    filters.specialties.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100 ||
    filters.sortBy !== 'newest';

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Clean Search Interface */}
      <div className={`sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 z-10 ${
        shouldHideHeader ? 'header-hidden' : 'header-visible'
      }`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/30 focus:border-primary/50 transition-colors duration-200"
            />
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`px-3 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 ${hasActiveFilters ? 'bg-primary/10 border-primary/50' : ''}`}
              >
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>{t('filter.title')}</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {t('filter.clearAll')}
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('filter.sortBy')}</h3>
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t('filter.sort.newest')}</SelectItem>
                      <SelectItem value="price-low">{t('filter.sort.priceLow')}</SelectItem>
                      <SelectItem value="price-high">{t('filter.sort.priceHigh')}</SelectItem>
                      <SelectItem value="rating">{t('filter.sort.rating')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('filter.categories')}</h3>
                  <div className="space-y-2">
                    {VALID_CATEGORIES.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.value}
                          checked={filters.categories.includes(category.value)}
                          onCheckedChange={() => handleCategoryToggle(category.value)}
                        />
                        <label
                          htmlFor={category.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {formatCategoryDisplay(category.value)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Seller Specialties */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('filter.specialties')}</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'coffee', label: t('filter.specialty.coffee') },
                      { value: 'matcha', label: t('filter.specialty.matcha') },
                      { value: 'both', label: t('filter.specialty.both') }
                    ].map((specialty) => (
                      <div key={specialty.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty.value}
                          checked={filters.specialties.includes(specialty.value)}
                          onCheckedChange={() => handleSpecialtyToggle(specialty.value)}
                        />
                        <label
                          htmlFor={specialty.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {specialty.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {t('filter.priceRange')}: {filters.priceRange[0]} Dh - {filters.priceRange[1]} Dh
                  </h3>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 Dh</span>
                    <span>100+ Dh</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Items list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="p-4">
          {loading && (
              <div className="text-center text-sm text-muted-foreground">Loading available items...</div>
            )}
            {error && (
              <div className="text-center text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && (filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onViewSeller={(sellerId) => navigate(`/seller/${sellerId}`)}
                    className="w-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('search.noResults')}
                </h3>
                <p className="text-muted-foreground">
                  {t('search.noResultsDesc')}
                </p>
              </div>
            ))}
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-20 md:h-4" />
      </div>

    </div>
  );
};