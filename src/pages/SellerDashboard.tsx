import { useEffect, useState } from "react";
import { ArrowLeft, Coffee, Leaf, Eye, EyeOff, Plus, Edit, Trash2, BarChart3, Users, Phone, MapPin, Clock, Star, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { SellerService } from "@/services/sellerService";
import { supabase } from "@/lib/supabase";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser, toggleSellerAvailability } = useUser();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    profileViews: 0,
    contactRequests: 0,
    completedOrders: 0,
    rating: 0,
    reviewCount: 0,
    revenue: 0
  });
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSellerProfile, setHasSellerProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        // First check if seller profile exists
        const profileExists = await SellerService.sellerProfileExists(user.id);
        setHasSellerProfile(profileExists);

        if (!profileExists) {
          console.log('📝 No seller profile found, showing setup message');
          setLoading(false);
          return;
        }

        const [analytics, contacts, drinks] = await Promise.all([
          SellerService.getSellerAnalytics(user.id, 30),
          SellerService.getContactRequests(user.id),
          // load menu items
          (async () => {
            const { data, error } = await supabase
              .from('drinks')
              .select('*')
              .eq('seller_id', user.id)
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          })()
        ]);

        setStats({
          profileViews: analytics.profileViews,
          contactRequests: analytics.contactRequests,
          completedOrders: analytics.totalOrders,
          rating: analytics.averageRating,
          reviewCount: 0,
          revenue: analytics.revenue,
        });
        setRecentContacts(contacts.map(c => ({
          id: c.id,
          customerName: c.buyer?.name || 'Customer',
          drink: c.metadata?.drink || '-',
          time: new Date(c.created_at).toLocaleString(),
          status: c.status
        })));
        setMenuItems(drinks.map((d: any) => ({ id: d.id, name: d.name, price: d.price, description: d.description, image: d.photo_url, popular: d.is_available })));
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </Card>
      </div>
    );
  }

  if (user.userType !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This page is only available to sellers.</p>
          <div className="text-xs text-muted-foreground mb-4">
            Current user type: {user.userType || 'undefined'}
          </div>
          <div className="space-y-2">
            <Button onClick={() => navigate('/')}>Go Home</Button>
            <Button
              variant="outline"
              onClick={() => navigate('/complete-profile')}
              className="bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700"
            >
              Complete Seller Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleToggleAvailability = async () => {
    try {
      console.log('🔄 SellerDashboard: Toggling availability...');
      await toggleSellerAvailability();

      // Show success message
      toast({
        title: user.isOnline ? "You're now offline" : "You're now online",
        description: user.isOnline ? "Customers won't see you in search results" : "Customers can now find and contact you",
      });

      console.log('✅ SellerDashboard: Availability toggled successfully');
    } catch (error: any) {
      console.error('❌ SellerDashboard: Toggle availability error:', error);

      // Show error message
      toast({
        title: "Failed to toggle availability",
        description: error.message || "Please try again or complete your seller profile first.",
        variant: "destructive",
      });

      // If the error is about missing seller profile, offer to redirect
      if (error.message?.includes('complete your seller profile')) {
        setTimeout(() => {
          toast({
            title: "Complete your seller profile",
            description: "Click here to complete your seller profile and start selling.",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/complete-profile')}
              >
                Complete Profile
              </Button>
            ),
          });
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-elegant">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1 md:gap-2 text-gray-700 hover:bg-coffee-50 hover:text-coffee-700 transition-colors duration-200 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Manage your business</p>
            </div>
          </div>

          {/* Availability Toggle and User Menu */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-medium text-muted-foreground hidden md:inline">
                {hasSellerProfile === false ? 'Incomplete' : (user.isOnline ? 'Online' : 'Offline')}
              </span>
              <Switch
                checked={user.isOnline && hasSellerProfile !== false}
                onCheckedChange={handleToggleAvailability}
                disabled={hasSellerProfile === false}
                className="data-[state=checked]:bg-green-500 disabled:opacity-50 scale-90 md:scale-100"
              />
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                hasSellerProfile === false
                  ? 'bg-yellow-400'
                  : (user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400')
              }`} />
            </div>
            {hasSellerProfile === false && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 hidden lg:inline">
                Complete profile
              </span>
            )}
            <UserMenu variant="desktop" />
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
            <p className="text-muted-foreground">{user.businessName || 'Your Business'}</p>
          </div>
        </div>

        {/* Profile Status Alert */}
        {hasSellerProfile === false && (
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Your seller profile is incomplete. Complete it to start accepting orders and appear in search results.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => navigate('/complete-profile')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="sm"
                  >
                    Complete Profile
                  </Button>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        )}

        {/* Seller Profile Setup Required */}
        {hasSellerProfile === false && (
          <Card className="p-8 text-center border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Complete Your Seller Profile
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-6">
              You need to complete your seller profile before you can start selling and go online.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/complete-profile')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Complete Seller Profile
              </Button>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Add your business information, address, and specialty to get started.
              </p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 text-center border-red-200 bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}

        {/* Stats Overview */}
        {!loading && !error && hasSellerProfile && (
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
        )}

        {/* Quick Actions */}
        {!loading && !error && hasSellerProfile && (
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
              className="bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700 transition-all duration-300 h-12"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>

          </div>
        </Card>
        )}

        {/* Recent Contact Requests */}
        {!loading && !error && hasSellerProfile && (
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
        )}

        {/* Menu Management Preview */}
        {!loading && !error && hasSellerProfile && (
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Your Menu</h3>
            <Button
              variant="outline"
              onClick={() => navigate('/add-listing')}
              className="bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700 transition-all duration-300"
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
                  <div className="text-lg font-bold text-primary">{item.price} Dh</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
