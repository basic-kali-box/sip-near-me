import { Phone, ShieldCheck, Clock, MapPin, Share2, Coffee, Leaf, MessageCircle, Star } from "lucide-react";
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${seller.phone}`;
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

      {/* Share button */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
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
            size="sm"
            className="flex-1 px-3 py-2 bg-gradient-matcha hover:shadow-glow hover:scale-105 transition-all duration-300 font-semibold relative overflow-hidden group/whatsapp"
            onClick={handleWhatsAppContact}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/whatsapp:translate-x-full transition-transform duration-700"></div>
            <svg className="w-4 h-4 mr-2 group-hover/whatsapp:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
            </svg>
            <span>WhatsApp</span>
          </Button>
        </div>

        {/* Premium indicator bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-matcha opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </Card>
  );
};