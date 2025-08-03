import { useState } from "react";
import { MapPin, Navigation, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SellerCard } from "./SellerCard";
import { SellerProfile } from "./SellerProfile";
import { mockSellers, Seller } from "@/data/mockSellers";

interface MapViewProps {
  className?: string;
}

export const MapView = ({ className }: MapViewProps) => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [hoveredSeller, setHoveredSeller] = useState<Seller | null>(null);

  // Mock map implementation - in a real app, this would use OpenRouteService
  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-fresh rounded-lg border border-border/50 overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
      
      {/* Street grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-muted-foreground/10" />
          ))}
        </div>
      </div>

      {/* Seller pins */}
      {mockSellers.map((seller, index) => (
        <div
          key={seller.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index % 3) * 20}%`,
          }}
          onMouseEnter={() => setHoveredSeller(seller)}
          onMouseLeave={() => setHoveredSeller(null)}
          onClick={() => setSelectedSeller(seller)}
        >
          <div className={`relative transition-all duration-200 ${
            hoveredSeller?.id === seller.id ? 'scale-110' : ''
          }`}>
            <div className="w-8 h-8 bg-primary rounded-full border-2 border-background shadow-floating flex items-center justify-center animate-pulse-glow">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            {/* Pin label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-card border border-border/50">
                {seller.name}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* User location */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-background shadow-lg animate-pulse" />
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Locate className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Mock street labels */}
      <div className="absolute top-12 left-8 text-xs text-muted-foreground font-medium bg-background/60 px-2 py-1 rounded">
        Main Street
      </div>
      <div className="absolute bottom-20 right-12 text-xs text-muted-foreground font-medium bg-background/60 px-2 py-1 rounded rotate-90">
        Broadway
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Map area */}
      <div className="flex-1 p-4">
        <MapPlaceholder />
      </div>

      {/* Hovered seller preview */}
      {hoveredSeller && (
        <div className="absolute bottom-24 md:bottom-8 left-4 right-4 z-20">
          <Card className="p-4 bg-background/95 backdrop-blur-md border-border/50 shadow-floating">
            <div className="flex gap-3 items-center">
              <img
                src={hoveredSeller.photo_url}
                alt={hoveredSeller.name}
                className="w-12 h-12 rounded-lg object-cover bg-gradient-fresh"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {hoveredSeller.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {hoveredSeller.specialty} • {hoveredSeller.distance}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedSeller(hoveredSeller)}
                className="bg-gradient-sunrise"
              >
                View
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-4" />

      {/* Seller profile modal */}
      <SellerProfile
        seller={selectedSeller}
        isOpen={!!selectedSeller}
        onClose={() => setSelectedSeller(null)}
      />
    </div>
  );
};