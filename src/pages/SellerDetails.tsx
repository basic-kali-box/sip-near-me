import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, MessageCircle, ShoppingCart, Star, Heart, Share2, Coffee, Leaf, ShieldCheck, User } from "lucide-react";
import { ReviewSystem } from "@/components/ReviewSystem";
import { sendWhatsAppMessage, createQuickContactMessage, trackContactAttempt } from "@/utils/whatsapp";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { SellerService } from "@/services/sellerService";

const SellerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [seller, setSeller] = useState<any | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const s = await SellerService.getSellerById(id);
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

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? `${seller?.name} removed from your favorites` : `${seller?.name} added to your favorites`,
    });
  };

  const handleShare = () => {
    if (navigator.share && seller) {
      navigator.share({
        title: seller.name,
        text: `Check out ${seller.name} on BrewNear!`,
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

  const handleStartOrder = () => {
    navigate(`/order/${seller.id}`);
  };

  return (
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

        {/* Menu */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-4">
            {(seller.drinks || []).map((drink: any) => (
              <div key={drink.id} className="flex justify-between items-start p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{drink.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{drink.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-primary">${Number(drink.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhanced Action buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={handleStartOrder}
            className="bg-gradient-matcha hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Order Now
          </Button>
          <Button
            onClick={handleWhatsAppContact}
            className="bg-green-600 hover:bg-green-700 hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={handleCall}
            variant="outline"
            size="lg"
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button
            onClick={handleFavorite}
            variant="outline"
            size="lg"
            className={`hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 ${
              isFavorited ? 'text-red-500 border-red-500' : ''
            }`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-red-500' : ''}`} />
            {isFavorited ? 'Favorited' : 'Favorite'}
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
  );
};

export default SellerDetails;
