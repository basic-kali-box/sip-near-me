import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Clock, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { mockSellers, Seller } from "@/data/mockSellers";

const SellerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    if (id) {
      const foundSeller = mockSellers.find(s => s.id === id);
      setSeller(foundSeller || null);
    }
  }, [id]);

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
          <Badge className="bg-primary text-primary-foreground mb-2">
            {seller.distance} away
          </Badge>
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
            rating={seller.rating} 
            reviewCount={seller.reviewCount}
            size="lg"
          />
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{seller.location.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span>{seller.hours}</span>
            </div>
          </div>
        </Card>

        {/* Menu */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <div className="space-y-4">
            {seller.drinks.map((drink) => (
              <div key={drink.id} className="flex justify-between items-start p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{drink.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{drink.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-primary">${drink.price}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleStartOrder}
            className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Start Order
          </Button>
          <Button
            onClick={handleCall}
            variant="outline"
            size="lg"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button
            onClick={handleMessage}
            variant="outline"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;
