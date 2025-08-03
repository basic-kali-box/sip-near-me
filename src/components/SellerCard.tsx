import { Phone, MapPin, Clock, Star, Truck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { Seller } from "@/data/mockSellers";

interface SellerCardProps {
  seller: Seller;
  onViewProfile: (seller: Seller) => void;
  onStartOrder: (seller: Seller) => void;
  className?: string;
}

export const SellerCard = ({ seller, onViewProfile, onStartOrder, className = "" }: SellerCardProps) => {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${seller.phone}`;
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-floating hover:-translate-y-1 border-border/50 bg-card/95 backdrop-blur-sm ${className}`}
      onClick={() => onViewProfile(seller)}
    >
      <div className="p-4 space-y-3">
        {/* Header with image and basic info */}
        <div className="flex gap-3">
          <div className="relative">
            <img
              src={seller.photo_url}
              alt={seller.name}
              className="w-20 h-20 rounded-xl object-cover bg-gradient-warm shadow-soft"
            />
            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary text-primary-foreground font-medium">
                {seller.distance}
              </Badge>
              {seller.isVerified && (
                <Badge className="text-xs px-1.5 py-0.5 bg-green-500 text-white">
                  <ShieldCheck className="w-3 h-3" />
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-bold text-lg text-foreground truncate flex items-center gap-2">
                {seller.name}
                {seller.isVerified && <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />}
              </h3>
              <p className="text-sm text-muted-foreground truncate font-medium">
                {seller.specialty}
              </p>
            </div>
            <StarRating 
              rating={seller.rating} 
              reviewCount={seller.reviewCount}
              size="sm"
            />
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-primary" />
                <span className="font-medium">{seller.deliveryTime}</span>
              </div>
              <span>•</span>
              <span className="font-medium">Min {seller.minimumOrder}</span>
            </div>
          </div>
        </div>

        {/* Location and hours */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{seller.location.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium">{seller.hours}</span>
          </div>
        </div>

        {/* Sample drinks */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Popular drinks:</p>
          <div className="grid grid-cols-2 gap-2">
            {seller.drinks.slice(0, 4).map((drink, index) => (
              <div key={index} className="text-xs bg-accent/20 rounded-lg px-2 py-1.5 border border-accent/30">
                <div className="font-medium text-foreground truncate">{drink.name}</div>
                <div className="text-primary font-semibold">{drink.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCall}
            className="flex items-center gap-2 flex-1 border-border/70 hover:border-primary/50"
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-matcha hover:shadow-glow transition-all duration-300 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onStartOrder(seller);
            }}
          >
            Order Now
          </Button>
        </div>
      </div>
    </Card>
  );
};