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

        // Map to ItemCardItem format
        const mapped: ItemCardItem[] = (drinksData || []).map((drink: any) => ({
          id: drink.id,
          name: drink.name,
          description: drink.description,
          price: drink.price,
          photo_url: drink.photo_url,
          category: drink.category,
          is_available: drink.is_available,
          seller_id: drink.seller_id,
          seller: drink.seller ? {
            id: drink.seller.id,
            business_name: drink.seller.business_name,
            address: drink.seller.address,
            phone: drink.seller.phone,
            specialty: drink.seller.specialty,
            rating_average: drink.seller.rating_average,
            rating_count: drink.seller.rating_count,
          } : undefined,
        }));

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
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase() || '').includes(q) ||
      (item.category?.toLowerCase() || '').includes(q) ||
      (item.seller?.business_name.toLowerCase() || '').includes(q) ||
      (item.seller?.specialty?.toLowerCase() || '').includes(q)
    );
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