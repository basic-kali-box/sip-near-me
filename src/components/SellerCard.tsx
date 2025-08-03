import { Phone, MapPin, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { Seller } from "@/data/mockSellers";

interface SellerCardProps {
  seller: Seller;
  onViewProfile: (seller: Seller) => void;
  className?: string;
}

export const SellerCard = ({ seller, onViewProfile, className = "" }: SellerCardProps) => {
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
              className="w-16 h-16 rounded-lg object-cover bg-gradient-fresh"
            />
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground">
                {seller.distance}
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {seller.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {seller.specialty}
            </p>
            <StarRating 
              rating={seller.rating} 
              reviewCount={seller.reviewCount}
              size="sm"
              className="mt-1"
            />
          </div>
        </div>

        {/* Location and hours */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{seller.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{seller.hours}</span>
          </div>
        </div>

        {/* Sample drinks */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Popular drinks:</p>
          <div className="flex flex-wrap gap-1">
            {seller.drinks.slice(0, 2).map((drink, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {drink.name} {drink.price}
              </Badge>
            ))}
            {seller.drinks.length > 2 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{seller.drinks.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCall}
            className="flex items-center gap-2 flex-1"
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
            onClick={() => onViewProfile(seller)}
          >
            View Menu
          </Button>
        </div>
      </div>
    </Card>
  );
};