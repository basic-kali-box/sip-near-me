import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, Star, Share2, Coffee, Leaf, Store, ExternalLink, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { sendWhatsAppMessage, createProductInterestMessage, trackContactAttempt } from "@/utils/whatsapp";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";

interface ItemDetailData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  category: string | null;
  is_available: boolean;
  seller_id: string;
  seller: {
    id: string;
    business_name: string;
    address: string;
    phone: string;
    specialty: 'coffee' | 'matcha' | 'both';
    rating_average: number;
    rating_count: number;
    latitude: number;
    longitude: number;
    hours: string | null;
    photo_url: string | null;
  };
}

const ItemDetail = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [item, setItem] = useState<ItemDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [otherItems, setOtherItems] = useState<any[]>([]);

  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
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
              latitude,
              longitude,
              hours,
              photo_url
            )
          `)
          .eq('id', itemId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Item not found');

        setItem(data as ItemDetailData);

        // Load other items from the same seller
        const { data: otherItemsData } = await supabase
          .from('drinks')
          .select('id, name, price, photo_url, category, is_available')
          .eq('seller_id', data.seller_id)
          .neq('id', itemId)
          .eq('is_available', true)
          .limit(6);

        setOtherItems(otherItemsData || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const handleWhatsAppOrder = () => {
    if (!item?.seller?.phone || !user) return;

    const message = createProductInterestMessage(
      item.name,
      item.price,
      item.seller.specialty,
      user?.name
    );
    sendWhatsAppMessage(item.seller.phone, message);
    trackContactAttempt(item.seller.id, 'whatsapp');

    toast({
      title: t('message.openingWhatsApp'),
      description: t('message.contactingSeller', {
        sellerName: item.seller.business_name,
        itemName: item.name
      }),
    });
  };

  const handleCall = () => {
    if (!item?.seller?.phone) return;
    window.location.href = `tel:${item.seller.phone}`;
  };

  const handleViewLocation = () => {
    if (!item?.seller) return;

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

  const handleViewSeller = () => {
    if (!item?.seller?.id) return;
    navigate(`/seller/${item.seller.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.name,
          text: `Check out ${item?.name} from ${item?.seller?.business_name} - ${item?.price.toFixed(2)} Dh`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('message.linkCopied'),
        description: t('message.linkCopiedDesc'),
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? t('message.removedFromFavorites') : t('message.addedToFavorites'),
      description: isFavorite ? t('message.itemRemovedFromFavorites') : t('message.itemAddedToFavorites'),
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading item details...</p>
        </Card>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Item Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The item you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/app')}>Back to Browse</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-elegant">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 text-gray-700 hover:bg-coffee-50 hover:text-coffee-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground truncate">{item.name}</h1>
              <p className="text-sm text-muted-foreground">{item.seller.business_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`${isFavorite ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Item Image */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-background/50 to-muted/30 border border-border/20">
              {item.photo_url && !imageError ? (
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}
              
              {/* Availability overlay */}
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Currently Unavailable
                  </Badge>
                </div>
              )}

              {/* Category badge */}
              {item.category && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
                >
                  {item.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{item.name}</h1>
                <div className="text-4xl font-bold text-primary mb-4">
                  {item.price.toFixed(2)} Dh
                </div>
              </div>

              {item.description && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('common.description')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Seller Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{t('item.sellerInfo')}</h3>
              <Card
                className="p-4 glass-card cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
                onClick={handleViewSeller}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    {getSpecialtyIcon(item.seller.specialty)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{item.seller.business_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={item.seller.rating_average} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        ({item.seller.rating_count} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{item.seller.address}</span>
                    </div>
                    {item.seller.hours && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{item.seller.hours}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{t('item.orderNow')}</h3>
              
              {/* Primary WhatsApp Button */}
              <Button
                onClick={handleWhatsAppOrder}
                disabled={!item.is_available}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
{t('item.orderViaWhatsApp')}
              </Button>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={handleCall}
                  variant="outline"
                  className="flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
{t('item.call')}
                </Button>
                
                <Button
                  onClick={handleViewLocation}
                  variant="outline"
                  className="flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
{t('item.viewLocation')}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Button>
                
                <Button
                  onClick={handleViewSeller}
                  variant="outline"
                  className="flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <Store className="w-4 h-4" />
{t('item.viewShop')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Shop Display Section */}
        {otherItems.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('item.moreFrom', { sellerName: item.seller.business_name })}</h2>
              <p className="text-muted-foreground">{t('item.moreFromDesc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherItems.map((otherItem) => (
                <Card
                  key={otherItem.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] glass-card"
                  onClick={() => navigate(`/item/${otherItem.id}`)}
                >
                  <div className="p-4 space-y-3">
                    {/* Item Image */}
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-background/50 to-muted/30">
                      {otherItem.photo_url ? (
                        <img
                          src={otherItem.photo_url}
                          alt={otherItem.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <Coffee className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}

                      {otherItem.category && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs"
                        >
                          {otherItem.category}
                        </Badge>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {otherItem.name}
                      </h3>
                      <div className="text-lg font-bold text-primary">
                        {otherItem.price.toFixed(2)} Dh
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${otherItem.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                    >
{t('item.viewDetails')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>


          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
