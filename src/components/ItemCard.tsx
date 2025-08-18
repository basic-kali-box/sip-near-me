import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, ShoppingCart, Coffee, Leaf, Store, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendWhatsAppMessage, createProductInterestMessage, trackContactAttempt } from "@/utils/whatsapp";

export interface ItemCardItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  category: string | null;
  is_available: boolean;
  seller_id: string;
  // Seller info (from join)
  seller?: {
    id: string;
    business_name: string;
    address: string;
    phone: string;
    specialty: 'coffee' | 'matcha' | 'both';
    rating_average: number;
    rating_count: number;
    distance_km?: number;
  };
}

interface ItemCardProps {
  item: ItemCardItem;
  onAddToCart?: (item: ItemCardItem) => void;
  onViewSeller?: (sellerId: string) => void;
  className?: string;
}

export const ItemCard = ({ item, onAddToCart, onViewSeller, className }: ItemCardProps) => {
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'matcha':
        return <Leaf className="w-4 h-4 text-green-600" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <Coffee className="w-3 h-3 text-amber-600" />
            <Leaf className="w-3 h-3 text-green-600" />
          </div>
        );
      default:
        return <Coffee className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(item);
  };

  const handleViewSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.seller?.id) {
      onViewSeller?.(item.seller.id);
    }
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.seller?.phone) {
      const message = createProductInterestMessage(
        item.name,
        item.price,
        item.seller.specialty
      );
      sendWhatsAppMessage(item.seller.phone, message);
      trackContactAttempt(item.seller.id, 'whatsapp');
    }
  };

  const handleViewLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.seller) return;

    // Use exact coordinates if available, otherwise fall back to address
    if (item.seller.latitude && item.seller.longitude) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${item.seller.latitude},${item.seller.longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (item.seller.address) {
      const encodedAddress = encodeURIComponent(item.seller.address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleCardClick = () => {
    // Navigate to item detail page
    navigate(`/item/${item.id}`);
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-500 hover:shadow-floating hover:scale-[1.02] hover:border-primary/30 glass-strong backdrop-blur-xl border-border/20 relative overflow-hidden ${className}`}
      onClick={handleCardClick}
    >
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>

      <div className="p-4 space-y-4">
        {/* Item Image */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-background/50 to-muted/30 border border-border/20">
          {item.photo_url && !imageError ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No image</p>
              </div>
            </div>
          )}
          
          {/* Availability badge */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Unavailable
              </Badge>
            </div>
          )}

          {/* Category badge */}
          {item.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs"
            >
              {item.category}
            </Badge>
          )}
        </div>

        {/* Item Info */}
        <div className="space-y-3">
          {/* Item name and price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors duration-300 truncate">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                  {item.description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary">
                {item.price.toFixed(2)} Dh
              </p>
            </div>
          </div>

          {/* Seller Info */}
          {item.seller && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getSpecialtyIcon(item.seller.specialty)}
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {item.seller.business_name}
                  </span>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-foreground">
                    {item.seller.rating_average.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.seller.rating_count})
                  </span>
                </div>
              </div>

              {/* Distance and delivery time */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.seller.distance_km && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.seller.distance_km.toFixed(1)} km</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>15-25 min</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Action - WhatsApp Order */}
            <Button
              onClick={handleWhatsAppOrder}
              disabled={!item.is_available || !item.seller?.phone}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
              Order via WhatsApp
            </Button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              {item.seller && (
                <Button
                  onClick={handleViewSeller}
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">View Shop</span>
                  <span className="sm:hidden">Shop</span>
                </Button>
              )}

              {item.seller?.address && (
                <Button
                  onClick={handleViewLocation}
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Location</span>
                  <span className="sm:hidden">Map</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
