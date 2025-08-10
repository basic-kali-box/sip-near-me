import { useState, useEffect, useMemo } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SellerCard, SellerCardSeller } from "./SellerCard";
import { SellerService } from "@/services/sellerService";
import { subscribeToSellerAvailability, subscribeToNewSellers } from "@/lib/supabase";

interface ListViewProps {
  onStartOrder: (seller: SellerCardSeller) => void;
  className?: string;
}

export const ListView = ({ onStartOrder, className }: ListViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState<SellerCardSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Try to get geolocation for better results; if not available, fallback to a default
        const getLocation = () => new Promise<{lat: number; lng: number}>(resolve => {
          if (!navigator.geolocation) return resolve({ lat: 40.7128, lng: -74.0060 });
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: 40.7128, lng: -74.0060 })
          );
        });
        const { lat, lng } = await getLocation();
        const results = await SellerService.getNearbySellers(lat, lng, { radiusKm: 25, isAvailable: true });
        if (!mounted) return;
        // Map RPC shape to SellerCardSeller
        const mapped: SellerCardSeller[] = (results || []).map((s: any) => ({
          id: s.id,
          name: s.business_name,
          phone: s.phone,
          specialty: s.specialty,
          photo_url: s.photo_url,
          rating: Number(s.rating_average || 0),
          reviewCount: Number(s.rating_count || 0),
          isVerified: true,
          drinks: [],
        }));
        setSellers(mapped);
      } catch (e: any) {
        setError(e.message || 'Failed to load sellers');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredSellers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sellers.filter(seller =>
      seller.name.toLowerCase().includes(q) ||
      (seller.specialty?.toLowerCase() || '').includes(q)
    );
  }, [sellers, searchQuery]);
  // Real-time: refresh on availability changes and new seller inserts
  useEffect(() => {
    const availability = subscribeToSellerAvailability(() => {
      // Simple refresh
      (async () => {
        try {
          const lat = 40.7128, lng = -74.0060; // could reuse geoloc state if lifted
          const results = await SellerService.getNearbySellers(lat, lng, { radiusKm: 25, isAvailable: true });
          const mapped: SellerCardSeller[] = (results || []).map((s: any) => ({
            id: s.id,
            name: s.business_name,
            phone: s.phone,
            specialty: s.specialty,
            photo_url: s.photo_url,
            rating: Number(s.rating_average || 0),
            reviewCount: Number(s.rating_count || 0),
            isVerified: true,
            drinks: [],
          }));
          setSellers(mapped);
        } catch (e) {
          // ignore
        }
      })();
    });
    const newSellers = subscribeToNewSellers(() => {
      // Refresh similarly
      (async () => {
        try {
          const lat = 40.7128, lng = -74.0060;
          const results = await SellerService.getNearbySellers(lat, lng, { radiusKm: 25, isAvailable: true });
          const mapped: SellerCardSeller[] = (results || []).map((s: any) => ({
            id: s.id,
            name: s.business_name,
            phone: s.phone,
            specialty: s.specialty,
            photo_url: s.photo_url,
            rating: Number(s.rating_average || 0),
            reviewCount: Number(s.rating_count || 0),
            isVerified: true,
            drinks: [],
          }));
          setSellers(mapped);
        } catch (e) {}
      })();
    });
    return () => {
      try { availability.unsubscribe?.(); } catch {}
      try { newSellers.unsubscribe?.(); } catch {}
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
              placeholder="Search drinks, sellers..."
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

      {/* Sellers list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {loading && (
              <div className="text-center text-sm text-muted-foreground">Loading nearby sellers...</div>
            )}
            {error && (
              <div className="text-center text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && (filteredSellers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    onStartOrder={onStartOrder}
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
                  No sellers found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or check back later for new listings.
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