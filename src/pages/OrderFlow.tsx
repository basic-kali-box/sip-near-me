import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, MapPin, Star, Truck, Phone, MessageCircle, User } from "lucide-react";
import { sendWhatsAppMessage, formatOrderMessage, trackContactAttempt, OrderItem, OrderDetails } from "@/utils/whatsapp";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { SellerService } from "@/services/sellerService";
import { Database } from "@/lib/database.types";

type Seller = Database['public']['Tables']['sellers']['Row'] & { drinks?: Drink[] };
type Drink = Database['public']['Tables']['drinks']['Row'];

interface CartItem extends Drink {
  quantity: number;
}

const OrderFlow = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [step, setStep] = useState<"menu" | "cart" | "confirmed">("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pickupTime: '',
    specialInstructions: ''
  });

  useEffect(() => {
    const fetchSeller = async () => {
      if (sellerId) {
        try {
          const foundSeller = await SellerService.getSellerById(sellerId, user?.id);
          setSeller(foundSeller);

          // Check if seller is trying to order from themselves
          if (user?.userType === 'seller' && user?.id === sellerId) {
            toast({
              title: "Cannot Order from Yourself",
              description: "Sellers cannot place orders from their own business.",
              variant: "destructive",
            });
            navigate('/seller-dashboard');
            return;
          }
        } catch (error) {
          console.error('Error fetching seller:', error);
          toast({
            title: "Error",
            description: "Failed to load seller information.",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };

    fetchSeller();
  }, [sellerId, user, navigate, toast]);

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
    // Generate ID if not present
    const drinkWithId = { ...drink, id: drink.id || `${drink.name}-${Date.now()}` };

    setCart(prev => {
      const existing = prev.find(item => item.id === drinkWithId.id);
      if (existing) {
        return prev.map(item =>
          item.id === drinkWithId.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...drinkWithId, quantity: 1 }];
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
    return cart.reduce((total, item) => {
      // Price is already a number in the database
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(' Dh', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleWhatsAppOrder = () => {
    if (!seller) return;

    const orderItems: OrderItem[] = cart.map(item => ({
      name: item.name,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(' Dh', '')),
      quantity: item.quantity,
      notes: item.description
    }));

    const orderDetails: OrderDetails = {
      items: orderItems,
      total: getTotalPrice(),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      pickupTime: customerInfo.pickupTime,
      specialInstructions: customerInfo.specialInstructions
    };

    const message = formatOrderMessage(seller, orderDetails);
    sendWhatsAppMessage(seller.phone, message);
    trackContactAttempt(seller.id.toString(), 'whatsapp');

    toast({
      title: "Order sent via WhatsApp!",
      description: `Your order has been sent to ${seller.name}`,
    });

    setStep("confirmed");
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
                <Card key={drink.id || drink.name} className="p-4">
                  <div className="flex gap-4 items-start">
                    {/* Drink image */}
                    {drink.photo_url && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                        <img
                          src={drink.photo_url}
                          alt={drink.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{drink.name}</h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2">{drink.description}</p>
                      <p className="text-xl font-bold text-primary mt-2">{drink.price.toFixed(2)} Dh</p>
                    </div>
                    <div className="ml-4 shrink-0">
                      {cart.find(item => item.id === drink.id) ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const item = cart.find(item => item.id === drink.id);
                              if (item && drink.id) updateQuantity(drink.id, item.quantity - 1);
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
                              if (item && drink.id) updateQuantity(drink.id, item.quantity + 1);
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
                      <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} Dh each</p>
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
                      {(item.price * item.quantity).toFixed(2)} Dh
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>{getTotalPrice().toFixed(2)} Dh</span>
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white hover:shadow-glow transition-all duration-300 flex items-center gap-2"
                size="lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
                Order via WhatsApp - {getTotalPrice().toFixed(2)} Dh
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`tel:${seller?.phone}`, '_self')}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <Phone className="w-5 h-5" />
                Call to Order
              </Button>
            </div>
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
                  <span className="font-semibold">{getTotalPrice().toFixed(2)} Dh</span>
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
