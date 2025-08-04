import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Star, RotateCcw, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  orderDate: string;
  estimatedTime?: string;
  address: string;
}

const OrderHistory = () => {
  const navigate = useNavigate();
  
  // Mock order data
  const [orders] = useState<Order[]>([
    {
      id: "ORD-123456",
      sellerId: "1",
      sellerName: "Green Goddess Smoothies",
      sellerPhoto: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
      items: [
        { name: "Green Power Smoothie", quantity: 1, price: 8.50 },
        { name: "Protein Boost", quantity: 1, price: 9.00 }
      ],
      total: 17.50,
      status: "preparing",
      orderDate: "2024-01-15T10:30:00Z",
      estimatedTime: "15-20 min",
      address: "123 Main St"
    },
    {
      id: "ORD-123455",
      sellerId: "2",
      sellerName: "Matcha Master",
      sellerPhoto: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
      items: [
        { name: "Traditional Matcha Latte", quantity: 2, price: 6.50 }
      ],
      total: 13.00,
      status: "delivered",
      orderDate: "2024-01-14T14:15:00Z",
      address: "456 Oak Ave"
    },
    {
      id: "ORD-123454",
      sellerId: "3",
      sellerName: "Fresh Juice Co.",
      sellerPhoto: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400",
      items: [
        { name: "Orange Carrot Ginger", quantity: 1, price: 7.00 },
        { name: "Green Detox", quantity: 1, price: 8.00 }
      ],
      total: 15.00,
      status: "delivered",
      orderDate: "2024-01-13T09:45:00Z",
      address: "789 Pine St"
    }
  ]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <Truck className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "preparing":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "ready":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeOrders = orders.filter(order => 
    order.status === "pending" || order.status === "preparing" || order.status === "ready"
  );
  
  const pastOrders = orders.filter(order => 
    order.status === "delivered" || order.status === "cancelled"
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={order.sellerPhoto}
            alt={order.sellerName}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold">{order.sellerName}</h3>
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
          {getStatusIcon(order.status)}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{order.address}</span>
        </div>
        <div className="text-lg font-semibold">${order.total.toFixed(2)}</div>
      </div>

      {order.estimatedTime && (order.status === "preparing" || order.status === "pending") && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Clock className="w-4 h-4" />
          <span>Estimated: {order.estimatedTime}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/seller/${order.sellerId}`)}
          className="flex-1"
        >
          View Seller
        </Button>
        {order.status === "delivered" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/order/${order.sellerId}`)}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reorder
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <h1 className="text-lg font-semibold">Order History</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Orders ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No active orders</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any orders in progress right now.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
                >
                  Browse Sellers
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.length > 0 ? (
              pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No past orders</h3>
                <p className="text-muted-foreground">
                  Your completed orders will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrderHistory;
