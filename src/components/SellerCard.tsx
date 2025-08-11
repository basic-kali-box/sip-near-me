import { Phone, ShieldCheck, Clock, MapPin, Heart, Share2, Coffee, Leaf, MessageCircle, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { sendWhatsAppMessage, createQuickContactMessage, trackContactAttempt } from "@/utils/whatsapp";
import { useToast } from "@/hooks/use-toast";

type CardDrink = { name: string; price: number; image?: string };

export interface SellerCardSeller {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  photo_url?: string | null;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  drinks?: CardDrink[];
}

interface SellerCardProps {
  seller: SellerCardSeller;
  onStartOrder: (seller: SellerCardSeller) => void;
  className?: string;
}

export const SellerCard = ({ seller, onStartOrder, className = "" }: SellerCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${seller.phone}`;
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: seller.name,
        text: `Check out ${seller.name} - ${seller.specialty}`,
        url: window.location.origin + `/seller/${seller.id}`,
      });
    }
  };

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = createQuickContactMessage(seller);
    sendWhatsAppMessage(seller.phone, message);
    trackContactAttempt(seller.id, 'whatsapp');
    toast({
      title: "Opening WhatsApp",
      description: `Contacting ${seller.name} via WhatsApp`,
    });
  };

  const getSpecialtyIcon = (specialty: string) => {
    if (specialty.toLowerCase().includes('matcha')) return <Leaf className="w-3 h-3" />;
    return <Coffee className="w-3 h-3" />;
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-500 hover:shadow-floating hover:scale-[1.02] hover:border-primary/30 glass-strong backdrop-blur-xl border-border/20 relative overflow-hidden ${className}`}
      onClick={() => navigate(`/seller/${seller.id}`)}
    >
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>

      {/* Favorite and Share buttons */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className={`w-8 h-8 p-0 rounded-full glass-card backdrop-blur-md hover:scale-110 transition-all duration-200 ${
            isFavorited ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="w-8 h-8 p-0 rounded-full glass-card backdrop-blur-md text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-5 space-y-4 relative z-10">
        {/* Header with image and basic info */}
        <div className="flex gap-4">
          <div className="relative">
            {/* Loading skeleton */}
            {!isImageLoaded && (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted/50 to-muted animate-pulse"></div>
            )}
            {seller.photo_url && (
              <img
                src={seller.photo_url}
                alt={seller.name}
                className={`w-24 h-24 rounded-2xl object-cover shadow-elegant transition-all duration-700 group-hover:scale-105 group-hover:shadow-glow ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
                onLoad={() => setIsImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f3f4f6' rx='16'/%3E%3Ctext x='48' y='48' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='14' fill='%23666'%3E%F0%9F%8D%B5%3C/text%3E%3C/svg%3E";
                  setIsImageLoaded(true);
                }}
              />
            )}

            {/* Enhanced badges */}
            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
              {seller.isVerified && (
                <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-elegant border-0 hover:shadow-glow transition-all duration-300">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background shadow-soft flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-xl text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                  {seller.name}
                </h3>
                {seller.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                )}
              </div>

              <div className="flex items-center gap-2">
                {getSpecialtyIcon(seller.specialty)}
                <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">
                  {seller.specialty}
                </p>
              </div>

              {/* Enhanced rating with more info */}
              <div className="flex items-center justify-between">
                <StarRating
                  rating={seller.rating || 0}
                  reviewCount={seller.reviewCount || 0}
                  size="sm"
                />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>15-25 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Enhanced drinks showcase (optional) */}
        {Array.isArray(seller.drinks) && seller.drinks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Coffee className="w-4 h-4 text-primary" />
                Popular Drinks
              </h4>
              <Badge variant="outline" className="text-xs px-2 py-1 border-primary/30 text-primary">
                {seller.drinks.length} items
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {seller.drinks.slice(0, 2).map((drink, index) => (
                <div
                  key={index}
                  className="group/drink relative overflow-hidden glass-card rounded-2xl p-3 cursor-pointer hover:glass-strong hover:border-primary/50 hover:shadow-soft hover:scale-[1.02] transition-all duration-300 border border-border/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartOrder(seller);
                  }}
                >
                  {/* Drink image */}
                  {drink.image && (
                    <div className="w-full h-24 mb-3 rounded-xl overflow-hidden shadow-soft border border-border/20 bg-gradient-to-br from-background/50 to-muted/30 relative">
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover/drink:scale-110 group-hover/drink:brightness-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/drink:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}

                  {/* Drink info */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-foreground truncate leading-tight group-hover/drink:text-primary transition-colors duration-300">
                      {drink.name}
                    </h5>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-base">{drink.price} Dh</span>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">
                        Popular
                      </Badge>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover/drink:opacity-5 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                </div>
              ))}
            </div>


          </div>
        )}

        {/* Enhanced action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            className="flex items-center gap-2 px-3 py-2 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 group/btn"
          >
            <Phone className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
            <span className="font-medium hidden sm:inline">Call</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppContact}
            className="flex items-center gap-2 px-3 py-2 glass-card border-green-500/50 text-green-600 hover:border-green-500 hover:bg-green-500/10 hover:scale-105 transition-all duration-300 group/whatsapp"
          >
            <MessageCircle className="w-4 h-4 group-hover/whatsapp:scale-110 transition-transform duration-200" />
            <span className="font-medium hidden sm:inline">WhatsApp</span>
          </Button>
          <Button
            size="sm"
            className="flex-1 px-3 py-2 bg-gradient-matcha hover:shadow-glow hover:scale-105 transition-all duration-300 font-semibold relative overflow-hidden group/order"
            onClick={(e) => {
              e.stopPropagation();
              onStartOrder(seller);
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/order:translate-x-full transition-transform duration-700"></div>
            <Coffee className="w-4 h-4 mr-2 group-hover/order:scale-110 transition-transform duration-200" />
            <span>Order</span>
          </Button>
        </div>

        {/* Premium indicator bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-matcha opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </Card>
  );
};