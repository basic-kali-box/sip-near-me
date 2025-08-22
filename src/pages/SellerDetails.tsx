import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, MessageCircle, ShoppingCart, Star, Share2, Coffee, Leaf, ShieldCheck, User, Plus } from "lucide-react";
import { ReviewSystem } from "@/components/ReviewSystem";
import { sendWhatsAppMessage, createQuickContactMessage, trackContactAttempt } from "@/utils/whatsapp";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { SellerService } from "@/services/sellerService";
import { SEO, SEO_CONFIGS } from "@/components/SEO";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/utils/structuredData";

const SellerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useTranslation();
  const [seller, setSeller] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const s = await SellerService.getSellerById(id, user?.id);
        setSeller(s);
      } catch (e: any) {
        setError(e.message || 'Failed to load seller details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWhatsAppContact = () => {
    if (!seller) return;
    const message = createQuickContactMessage({
      id: seller.id,
      name: seller.business_name,
      phone: seller.phone,
      drinks: [],
      location: { lat: seller.latitude, lng: seller.longitude, address: seller.address },
      hours: seller.hours || '',
      photo_url: seller.photo_url || '',
      rating: Number(seller.rating_average || 0),
      reviewCount: Number(seller.rating_count || 0),
      specialty: seller.specialty,
    } as any, user?.name);
    sendWhatsAppMessage(seller.phone, message);
    trackContactAttempt(String(seller.id), 'whatsapp');
    toast({
      title: "Opening WhatsApp",
      description: `Contacting ${seller.name} via WhatsApp`,
    });
  };



  const handleShare = () => {
    if (navigator.share && seller) {
      navigator.share({
        title: seller.name,
        text: `Check out ${seller.name} on Machroub!`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")} className="mt-4">Go back home</Button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Seller not found</h2>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${seller.phone}`;
  };

  const handleMessage = () => {
    window.location.href = `sms:${seller.phone}`;
  };

  const handleViewLocation = () => {
    if (!seller) return;

    // Use exact coordinates if available, otherwise fall back to address
    if (seller.latitude && seller.longitude) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${seller.latitude},${seller.longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (seller.address) {
      const encodedAddress = encodeURIComponent(seller.address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Removed handleStartOrder - now using WhatsApp contact instead

  // Generate SEO data for this seller
  const sellerSEO = SEO_CONFIGS.seller(seller.business_name, seller.address);
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', url: 'https://machroub.ma/' },
    { name: 'Sellers', url: 'https://machroub.ma/app' },
    { name: seller.business_name, url: `https://machroub.ma/seller/${seller.id}` }
  ]);

  return (
    <>
      <SEO
        {...sellerSEO}
        structuredData={[getLocalBusinessSchema(seller), breadcrumbData]}
      />
      <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold truncate">{seller.name}</h1>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative">
        <img
          src={seller.photo_url}
          alt={seller.name}
          className="w-full h-64 object-cover bg-gradient-fresh"
        />
        <div className="absolute bottom-4 left-4 right-4">
          {/* Distance not available directly; could compute from userLocation if needed */}
          {/* <Badge className="bg-primary text-primary-foreground mb-2">{distance} away</Badge> */}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {seller.name}
          </h1>
          <p className="text-white/90 drop-shadow-md text-lg">
            {seller.specialty}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Rating and basic info */}
        <Card className="p-6 space-y-4">
          <StarRating
            rating={Number(seller.rating_average || 0)}
            reviewCount={Number(seller.rating_count || 0)}
            size="lg"
          />
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{seller.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span>{seller.hours || 'Hours not provided'}</span>
            </div>
          </div>
        </Card>

        {/* Enhanced Interactive Menu */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t('seller.menu')}</h2>
            <Badge variant="secondary" className="text-xs">
              {t('seller.items', { count: (seller.drinks || []).length.toString() })}
            </Badge>
          </div>

          {(seller.drinks || []).length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('seller.noMenu')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(seller.drinks || []).map((drink: any) => (
                <Card
                  key={drink.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 border-border/30 hover:border-primary/50 bg-card/50 hover:bg-card/80 overflow-hidden"
                  onClick={() => {
                    // Navigate to individual item page
                    navigate(`/item/${drink.id}`);
                  }}
                >
                  {/* Item Image */}
                  <div className="relative w-full h-48 bg-muted/30 overflow-hidden">
                    {drink.photo_url ? (
                      <img
                        src={drink.photo_url}
                        alt={drink.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
                        <Coffee className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      {drink.is_available ? (
                        <Badge className="bg-green-500/90 text-white text-xs">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500/90 text-white text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>

                    {/* Category Badge */}
                    {drink.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                          {drink.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {drink.name}
                      </h3>
                      {drink.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {drink.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {Number(drink.price).toFixed(2)} Dh
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/item/${drink.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Enhanced Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleWhatsAppContact}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
            </svg>
{t('seller.contactWhatsApp')}
          </Button>
          <Button
            onClick={handleCall}
            variant="outline"
            size="lg"
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Phone className="w-4 h-4 mr-2" />
{t('item.call')}
          </Button>
          <Button
            onClick={handleViewLocation}
            variant="outline"
            size="lg"
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <MapPin className="w-4 h-4 mr-2" />
{t('item.viewLocation')}
          </Button>

        </div>

        {/* Reviews Section */}
        <ReviewSystem
          sellerId={String(seller.id)}
          sellerName={seller.business_name}
          averageRating={Number(seller.rating_average || 0)}
          totalReviews={Number(seller.rating_count || 0)}
        />
      </div>
      </div>
    </>
  );
};

export default SellerDetails;
