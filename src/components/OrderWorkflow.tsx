import { useState } from "react";
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, MapPin, Star, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./StarRating";
import { Seller, Drink } from "@/data/mockSellers";

interface OrderWorkflowProps {
  seller: Seller | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem extends Drink {
  quantity: number;
}

export const OrderWorkflow = ({ seller, isOpen, onClose }: OrderWorkflowProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"menu" | "cart" | "checkout" | "confirmed">("menu");

  if (!seller) return null;

  const addToCart = (drink: Drink) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === drink.name);
      if (existing) {
        return prev.map(item =>
          item.name === drink.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...drink, quantity: 1 }];
    });
  };

  const removeFromCart = (drinkName: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === drinkName);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.name === drinkName
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.name !== drinkName);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const getCategoryIcon = (category: Drink["category"]) => {
    switch (category) {
      case "coffee": return "☕";
      case "matcha": return "🍃";
      case "specialty": return "✨";
      case "pastry": return "🥐";
      default: return "🥤";
    }
  };

  const renderMenu = () => (
    <div className="space-y-6">
      {/* Seller Header */}
      <div className="relative">
        <img
          src={seller.photo_url}
          alt={seller.name}
          className="w-full h-40 object-cover bg-gradient-warm rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent rounded-lg" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary text-primary-foreground">
              <Truck className="w-3 h-3 mr-1" />
              {seller.deliveryTime}
            </Badge>
            {seller.isVerified && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                ✓ Verified
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold">{seller.name}</h1>
          <p className="text-white/90 text-sm">{seller.specialty}</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{seller.rating}</span>
          </div>
          <p className="text-xs text-muted-foreground">{seller.reviewCount} reviews</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{seller.deliveryTime}</span>
          </div>
          <p className="text-xs text-muted-foreground">Delivery</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold">{seller.distance}</span>
          </div>
          <p className="text-xs text-muted-foreground">Distance</p>
        </div>
      </div>

      <Separator />

      {/* Menu Items */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Menu</h2>
        {seller.drinks.map((drink, index) => {
          const cartItem = cart.find(item => item.name === drink.name);
          const quantity = cartItem?.quantity || 0;

          return (
            <Card key={index} className="p-4 border-border/50 hover:shadow-soft transition-all duration-200">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(drink.category)}</span>
                    <h3 className="font-semibold text-foreground">{drink.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{drink.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-semibold">
                      {drink.price}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {quantity > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(drink.name)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                      {quantity > 0 && (
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                      )}
                      <Button
                        size="sm"
                        onClick={() => addToCart(drink)}
                        className="w-8 h-8 p-0 bg-gradient-matcha"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStep("menu")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Your Order</h2>
      </div>

      <Card className="p-4 border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-matcha rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{seller.name}</h3>
            <p className="text-sm text-muted-foreground">{seller.deliveryTime} • {seller.distance}</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          {cart.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.price} each</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromCart(item.name)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <Button
                  size="sm"
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 p-0 bg-gradient-matcha"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>$2.99</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>${(getCartTotal() + 2.99).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-gradient-matcha hover:shadow-glow transition-all duration-300"
        size="lg"
        onClick={() => setStep("confirmed")}
      >
        Place Order • ${(getCartTotal() + 2.99).toFixed(2)}
      </Button>
    </div>
  );

  const renderConfirmed = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-gradient-matcha rounded-full flex items-center justify-center mx-auto">
        <ShoppingCart className="w-10 h-10 text-primary-foreground" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground">
          Your order from {seller.name} has been confirmed and will be delivered in {seller.deliveryTime}.
        </p>
      </div>
      <Card className="p-4 bg-accent/20 border-accent">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-primary" />
          <div className="text-left">
            <p className="font-semibold">Estimated delivery</p>
            <p className="text-sm text-muted-foreground">{seller.deliveryTime}</p>
          </div>
        </div>
      </Card>
      <Button onClick={onClose} variant="outline" className="w-full">
        Track Order
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-background">
        <div className="p-6">
          {step === "menu" && renderMenu()}
          {step === "cart" && renderCart()}
          {step === "confirmed" && renderConfirmed()}
        </div>

        {/* Fixed bottom cart button (only in menu view) */}
        {step === "menu" && cartItemCount > 0 && (
          <div className="sticky bottom-0 p-4 bg-background border-t border-border/50">
            <Button 
              className="w-full bg-gradient-matcha hover:shadow-glow transition-all duration-300 flex items-center justify-between"
              size="lg"
              onClick={() => setStep("cart")}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{cartItemCount} items</span>
              </div>
              <span>${getCartTotal().toFixed(2)}</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};