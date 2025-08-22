import { useState } from "react";
import { ArrowLeft, Coffee, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemCard, type ItemCardItem } from "@/components/ItemCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ItemCardDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample items for demonstration
  const sampleItems: ItemCardItem[] = [
    {
      id: "item-1",
      name: "Premium Matcha Latte",
      description: "Authentic Japanese matcha powder with steamed milk and a touch of honey",
      price: 45.00,
      photo_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop",
      category: "hot_drinks",
      is_available: true,
      seller_id: "seller-1",
      seller: {
        id: "seller-1",
        business_name: "Green Tea House",
        address: "123 Boulevard Mohammed V, Casablanca, Morocco",
        phone: "+212612345678",
        specialty: "matcha" as const,
        rating_average: 4.8,
        rating_count: 127,
        distance_km: 1.2,
        latitude: 33.5731,
        longitude: -7.5898,
      },
    },
    {
      id: "item-2",
      name: "Espresso Romano",
      description: "Traditional Italian espresso with a twist of lemon zest",
      price: 25.00,
      photo_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop",
      category: "hot_drinks",
      is_available: true,
      seller_id: "seller-2",
      seller: {
        id: "seller-2",
        business_name: "Café Milano",
        address: "456 Rue des Habous, Casablanca, Morocco",
        phone: "+212687654321",
        specialty: "coffee" as const,
        rating_average: 4.5,
        rating_count: 89,
        distance_km: 2.8,
        latitude: 33.5892,
        longitude: -7.6031,
      },
    },
    {
      id: "item-3",
      name: "Iced Matcha Fusion",
      description: "Cold-brewed matcha with coconut milk and vanilla syrup",
      price: 38.00,
      photo_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop",
      category: "cold_drinks",
      is_available: false, // Unavailable item for testing
      seller_id: "seller-3",
      seller: {
        id: "seller-3",
        business_name: "Zen Beverages",
        address: "789 Avenue Hassan II, Rabat, Morocco",
        phone: "+212698765432",
        specialty: "both" as const,
        rating_average: 4.2,
        rating_count: 56,
        distance_km: 45.3,
        latitude: 34.0209,
        longitude: -6.8416,
      },
    },
    {
      id: "item-4",
      name: "Cappuccino Classico",
      description: "Rich espresso with perfectly steamed milk foam art",
      price: 32.00,
      photo_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
      category: "hot_drinks",
      is_available: true,
      seller_id: "seller-4",
      seller: {
        id: "seller-4",
        business_name: "Artisan Coffee Co.",
        address: "321 Corniche Ain Diab, Casablanca, Morocco",
        phone: "+212655443322",
        specialty: "coffee" as const,
        rating_average: 4.9,
        rating_count: 203,
        distance_km: 0.8,
        latitude: 33.5731,
        longitude: -7.6298,
      },
    },
    {
      id: "item-5",
      name: "Traditional Mint Tea",
      description: "Authentic Moroccan mint tea served in traditional glasses",
      price: 15.00,
      photo_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
      category: "hot_drinks",
      is_available: true,
      seller_id: "seller-5",
      seller: {
        id: "seller-5",
        business_name: "Traditional Tea House",
        address: "Old Medina, Fez, Morocco",
        phone: "+212677889900",
        specialty: "both" as const,
        rating_average: 4.3,
        rating_count: 78,
        distance_km: 120.5,
        // No GPS coordinates - will fallback to address-based location
      },
    },
  ];

  const handleAddToCart = (item: ItemCardItem) => {
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleViewSeller = (sellerId: string) => {
    toast({
      title: "View Shop",
      description: `Opening shop details for seller ${sellerId}`,
    });
    // In real app: navigate(`/seller/${sellerId}`);
    // For demo purposes, we'll just show the toast
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ItemCard Demo</h1>
              <p className="text-sm text-muted-foreground">
                Showcasing product cards with precise GPS location functionality
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Feature Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            New Product Card Features
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-foreground">WhatsApp Ordering</h3>
                <p className="text-muted-foreground">Direct contact with sellers via WhatsApp with pre-filled product details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Coffee className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Shop Details</h3>
                <p className="text-muted-foreground">View complete seller profile, menu, and business information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Precise GPS Location</h3>
                <p className="text-muted-foreground">Uses exact GPS coordinates when available, falls back to address-based location</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Cards */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
            <p className="text-muted-foreground mb-6">
              Try the different actions on each product card. The location button now uses precise GPS coordinates when available.
              Click the location button to see how it opens Google Maps with exact coordinates for the first 4 items,
              and falls back to address-based location for the last item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <ItemCard
                  item={item}
                  onAddToCart={handleAddToCart}
                  onViewSeller={handleViewSeller}
                />
                <div className="text-xs text-muted-foreground space-y-1 px-2">
                  {item.seller?.latitude && item.seller?.longitude ? (
                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                      GPS Coordinates: {item.seller.latitude.toFixed(4)}, {item.seller.longitude.toFixed(4)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Address-based location only
                    </Badge>
                  )}
                  {!item.is_available && (
                    <Badge variant="secondary" className="text-xs">
                      Unavailable - WhatsApp disabled
                    </Badge>
                  )}
                  {!item.seller?.phone && (
                    <Badge variant="outline" className="text-xs">
                      No phone - WhatsApp disabled
                    </Badge>
                  )}
                  {!item.seller?.address && (
                    <Badge variant="outline" className="text-xs">
                      No address - Location hidden
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile UX Notes */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-secondary/5 to-primary/5 border-secondary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-secondary" />
            Mobile-First Design
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Layout Strategy</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Primary action (WhatsApp) gets full width</li>
                <li>• Secondary actions share space below</li>
                <li>• Responsive text (full/short versions)</li>
                <li>• Touch-friendly button sizes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Smart States</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• WhatsApp disabled if no phone or unavailable</li>
                <li>• Location hidden if no address</li>
                <li>• Visual feedback for all interactions</li>
                <li>• External link indicators</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ItemCardDemo;
