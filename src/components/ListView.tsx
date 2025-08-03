import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SellerCard } from "./SellerCard";
import { SellerProfile } from "./SellerProfile";
import { mockSellers, Seller } from "@/data/mockSellers";

interface ListViewProps {
  className?: string;
}

export const ListView = ({ className }: ListViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellers] = useState(mockSellers);

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.drinks.some(drink => 
      drink.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Search and filters */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 p-4 space-y-3 z-10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search drinks, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50"
            />
          </div>
          <Button variant="outline" size="sm" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{filteredSellers.length} sellers nearby</span>
        </div>
      </div>

      {/* Sellers list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {filteredSellers.length > 0 ? (
            filteredSellers.map((seller) => (
              <SellerCard
                key={seller.id}
                seller={seller}
                onViewProfile={setSelectedSeller}
                className="w-full"
              />
            ))
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
          )}
        </div>
        
        {/* Bottom padding for mobile navigation */}
        <div className="h-20 md:h-4" />
      </div>

      {/* Seller profile modal */}
      <SellerProfile
        seller={selectedSeller}
        isOpen={!!selectedSeller}
        onClose={() => setSelectedSeller(null)}
      />
    </div>
  );
};