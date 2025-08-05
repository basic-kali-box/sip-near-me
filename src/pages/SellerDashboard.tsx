import { useState } from "react";
import { ArrowLeft, Coffee, Leaf, Eye, EyeOff, Plus, Edit, Trash2, BarChart3, Users, Phone, MapPin, Clock, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser, toggleSellerAvailability } = useUser();
  const { toast } = useToast();

  // Mock data for demonstration
  const [stats] = useState({
    profileViews: 127,
    contactRequests: 23,
    completedOrders: 18,
    rating: 4.8,
    reviewCount: 15
  });

  const [recentContacts] = useState([
    { id: 1, customerName: "Sarah M.", drink: "Matcha Latte", time: "2 hours ago", status: "pending" },
    { id: 2, customerName: "John D.", drink: "Cold Brew", time: "4 hours ago", status: "completed" },
    { id: 3, customerName: "Emma L.", drink: "Cappuccino", time: "1 day ago", status: "completed" }
  ]);

  const [menuItems] = useState([
    { id: 1, name: "Matcha Latte", price: 5.50, description: "Premium ceremonial grade matcha", image: null, popular: true },
    { id: 2, name: "Cold Brew", price: 4.00, description: "Smooth 24-hour cold brew", image: null, popular: false },
    { id: 3, name: "Cappuccino", price: 4.50, description: "Classic Italian cappuccino", image: null, popular: true }
  ]);

  if (!user || user.userType !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This page is only available to sellers.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const handleToggleAvailability = () => {
    toggleSellerAvailability();
    toast({
      title: user.isOnline ? "You're now offline" : "You're now online",
      description: user.isOnline ? "Customers won't see you in search results" : "Customers can now find and contact you",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-elegant">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to App</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your coffee/matcha business</p>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {user.isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={user.isOnline}
                onCheckedChange={handleToggleAvailability}
                className="data-[state=checked]:bg-green-500"
              />
              <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-matcha rounded-2xl flex items-center justify-center mx-auto shadow-glow">
            {user.specialty === 'matcha' ? (
              <Leaf className="w-10 h-10 text-primary-foreground" />
            ) : (
              <Coffee className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h2>
            <p className="text-muted-foreground">{user.businessName}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.profileViews}</div>
            <div className="text-sm text-muted-foreground">Profile Views</div>
          </Card>

          <Card className="glass-card p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.contactRequests}</div>
            <div className="text-sm text-muted-foreground">Contact Requests</div>
          </Card>

          <Card className="glass-card p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.completedOrders}</div>
            <div className="text-sm text-muted-foreground">Completed Orders</div>
          </Card>

          <Card className="glass-card p-6 text-center hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.rating}</div>
            <div className="text-sm text-muted-foreground">{stats.reviewCount} Reviews</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/add-listing')}
              className="bg-gradient-matcha hover:shadow-glow transition-all duration-300 h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 h-12"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 h-12"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </Card>

        {/* Recent Contact Requests */}
        <Card className="glass-card p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Contact Requests</h3>
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-coffee rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{contact.customerName}</div>
                    <div className="text-sm text-muted-foreground">{contact.drink} • {contact.time}</div>
                  </div>
                </div>
                <Badge variant={contact.status === 'completed' ? 'default' : 'secondary'}>
                  {contact.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Menu Management Preview */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Your Menu</h3>
            <Button
              variant="outline"
              onClick={() => navigate('/add-listing')}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {item.name}
                      {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="text-lg font-bold text-primary">${item.price}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
