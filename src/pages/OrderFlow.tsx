import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, MapPin, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { mockSellers, Seller, Drink } from "@/data/mockSellers";

interface CartItem extends Drink {
  quantity: number;
}

const OrderFlow = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [step, setStep] = useState<"menu" | "cart" | "confirmed">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (sellerId) {
      const foundSeller = mockSellers.find(s => s.id === sellerId);
      setSeller(foundSeller || null);
    }
  }, [sellerId]);

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

  const addToCart = (drink: Drink) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === drink.id);
      if (existing) {
        return prev.map(item =>
          item.id === drink.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...drink, quantity: 1 }];
    });
  };

  const updateQuantity = (drinkId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== drinkId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === drinkId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    setStep("confirmed");
  };

  const getStepTitle = () => {
    switch (step) {
      case "menu": return "Menu";
      case "cart": return "Your Order";
      case "confirmed": return "Order Confirmed";
      default: return "Order";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === "menu" ? navigate(-1) : setStep("menu")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">{getStepTitle()}</h1>
          {step === "menu" && cart.length > 0 && (
            <div className="ml-auto">
              <Button
                onClick={() => setStep("cart")}
                className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {getTotalItems()} items
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {step === "menu" && (
          <div className="space-y-6">
            {/* Seller info */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={seller.photo_url}
                  alt={seller.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{seller.name}</h2>
                  <p className="text-muted-foreground">{seller.specialty}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>15-25 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{seller.distance}</span>
                    </div>
                  </div>
                </div>
                <StarRating rating={seller.rating} reviewCount={seller.reviewCount} />
              </div>
            </Card>

            {/* Menu items */}
            <div className="space-y-4">
              {seller.drinks.map((drink) => (
                <Card key={drink.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{drink.name}</h3>
                      <p className="text-muted-foreground mt-1">{drink.description}</p>
                      <p className="text-xl font-bold text-primary mt-2">${drink.price}</p>
                    </div>
                    <div className="ml-4">
                      {cart.find(item => item.id === drink.id) ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const item = cart.find(item => item.id === drink.id);
                              if (item) updateQuantity(drink.id, item.quantity - 1);
                            }}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {cart.find(item => item.id === drink.id)?.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const item = cart.find(item => item.id === drink.id);
                              if (item) updateQuantity(drink.id, item.quantity + 1);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(drink)}
                          className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "cart" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="w-20 text-right font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </Card>

            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              Place Order - ${getTotalPrice().toFixed(2)}
            </Button>
          </div>
        )}

        {step === "confirmed" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-sunrise rounded-full flex items-center justify-center mx-auto">
              <Truck className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground">
                Your order has been placed and {seller.name} is preparing it.
              </p>
            </div>
            <Card className="p-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">#ORD-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated time</span>
                  <span>15-25 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </Card>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/orders")} 
                className="w-full bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
              >
                Track Order
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFlow;
