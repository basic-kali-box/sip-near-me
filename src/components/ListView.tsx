import { useState, useEffect, useMemo } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemCard, ItemCardItem } from "./ItemCard";
import { DrinkService } from "@/services/drinkService";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ListViewProps {
  onStartOrder?: (item: ItemCardItem) => void;
  className?: string;
}

export const ListView = ({ onStartOrder, className }: ListViewProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ItemCardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              is_available
            )
          `)
          .eq('is_available', true)
          .eq('seller.is_available', true)
          .order('created_at', { ascending: false });

        if (drinksError) throw drinksError;
        if (!mounted) return;

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
      return items.filter(item => {
        // Add defensive checks to prevent runtime errors
        if (!item || typeof item !== 'object') return false;

        const name = item.name || '';
        const description = item.description || '';
        const category = item.category || '';
        const businessName = item.seller?.business_name || '';
        const specialty = item.seller?.specialty || '';

        return name.toLowerCase().includes(q) ||
               description.toLowerCase().includes(q) ||
               category.toLowerCase().includes(q) ||
               businessName.toLowerCase().includes(q) ||
               specialty.toLowerCase().includes(q);
      });
    } catch (error) {
      console.error('Error filtering items:', error);
      return items; // Return unfiltered items as fallback
    }
  }, [items, searchQuery]);
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

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Clean Search Interface */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 p-4 z-10">
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
          <Button variant="outline" size="sm" className="px-3 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
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
                    onAddToCart={(item) => onStartOrder?.(item)}
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