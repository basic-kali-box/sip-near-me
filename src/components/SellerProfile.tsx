import { X, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { Seller } from "@/data/mockSellers";

interface SellerProfileProps {
  seller: Seller | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SellerProfile = ({ seller, isOpen, onClose }: SellerProfileProps) => {
  if (!seller) return null;

  const handleCall = () => {
    window.location.href = `tel:${seller.phone}`;
  };

  const handleMessage = () => {
    window.location.href = `sms:${seller.phone}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-background border-border/50">
        {/* Header with close button */}
        <DialogHeader className="relative p-0">
          <div className="relative">
            <img
              src={seller.photo_url}
              alt={seller.name}
              className="w-full h-48 object-cover bg-gradient-fresh"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-4 left-4 right-4">
              <Badge className="bg-primary text-primary-foreground mb-2">
                {seller.distance} away
              </Badge>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {seller.name}
              </h1>
              <p className="text-white/90 drop-shadow-md">
                {seller.specialty}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Rating and basic info */}
          <div className="space-y-3">
            <StarRating 
              rating={seller.rating} 
              reviewCount={seller.reviewCount}
              size="lg"
            />
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{seller.location.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{seller.hours}</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Menu</h2>
            <div className="space-y-3">
              {seller.drinks.map((drink, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-card/50 transition-colors hover:bg-accent/50"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{drink.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {drink.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 font-semibold">
                      {drink.price}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCall}
              className="flex-1 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button 
              variant="outline"
              onClick={handleMessage}
              className="flex-1 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};