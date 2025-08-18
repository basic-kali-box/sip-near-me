import React, { useState, useEffect } from 'react';
import {
  User, Coffee, Plus, Edit, Trash2, Eye, EyeOff, Search, BarChart3,
  Star, DollarSign, Package, TrendingUp, Heart, Menu, Settings,
  LayoutDashboard, LogOut, ArrowRightLeft, ShoppingBag
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SellerService } from "@/services/sellerService";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSellerProfile, setHasSellerProfile] = useState(null);

  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    profileViews: 0,
    averageRating: 0,
    whatsappOrders: 0,
    uniqueCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const profileExists = await SellerService.sellerProfileExists(user.id);
        setHasSellerProfile(profileExists);

        if (profileExists) {
          // Load menu items
          const { data: drinks, error: drinksError } = await supabase
            .from('drinks').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
          if (drinksError) throw drinksError;
          setMenuItems(drinks?.map(d => ({
            id: d.id,
            name: d.name,
            price: d.price,
            image: d.photo_url,
            category: d.category,
            isAvailable: d.is_available,
            sales: 0 // Will be calculated from orders
          })) || []);

          // Load analytics data
          await loadAnalyticsData(user.id);
        }
      } catch (e) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Load analytics data from database
  const loadAnalyticsData = async (sellerId: string) => {
    try {
      // Get WhatsApp orders
      const { data: whatsappOrdersData, error } = await supabase
        .from('order_history')
        .select(`
          *,
          buyer:users!buyer_id(name, phone, avatar_url)
        `)
        .eq('seller_id', sellerId)
        .eq('contact_method', 'whatsapp')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all orders for total revenue
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('order_history')
        .select('total_amount')
        .eq('seller_id', sellerId);

      if (allOrdersError) throw allOrdersError;

      // Get profile views count
      const { data: profileViewsData, error: viewsError } = await supabase
        .from('seller_analytics')
        .select('id')
        .eq('seller_id', sellerId)
        .eq('event_type', 'profile_view');

      if (viewsError) {
        console.error('Failed to load profile views:', viewsError);
      }

      // Get seller rating
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('rating_average')
        .eq('id', sellerId)
        .single();

      if (sellerError) {
        console.error('Failed to load seller rating:', sellerError);
      }

      // Calculate analytics
      const totalOrders = allOrders?.length || 0;
      const totalRevenue = allOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const whatsappOrdersCount = whatsappOrdersData?.length || 0;
      const uniqueCustomers = new Set(whatsappOrdersData?.map(order => order.buyer_id)).size;
      const profileViews = profileViewsData?.length || 0;
      const averageRating = sellerData?.rating_average || 0;

      setAnalytics({
        totalOrders,
        totalRevenue,
        profileViews,
        averageRating,
        whatsappOrders: whatsappOrdersCount,
        uniqueCustomers
      });

      // Set recent orders for the orders tab
      setRecentOrders(whatsappOrdersData?.slice(0, 10) || []);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const toggleItemAvailability = async (id: string) => {
    try {
      const item = menuItems.find(item => item.id === id);
      const newAvailability = !item.isAvailable;

      const { error } = await supabase
        .from('drinks')
        .update({ is_available: newAvailability })
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === id ? { ...item, isAvailable: newAvailability } : item
      ));

      toast({
        title: "Item Updated",
        description: `${item.name} is now ${newAvailability ? 'available' : 'hidden'}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (id: string) => {
    // Navigate to edit listing page
    navigate(`/edit-listing/${id}`);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Item Deleted",
        description: "Menu item has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = () => {
    // Navigate to add listing page
    navigate('/add-listing');
  };



  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDashboardClick = () => {
    navigate('/seller-dashboard');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleSwitchUserType = async () => {
    if (!user) return;

    try {
      // Switch to buyer
      await supabase.auth.updateUser({
        data: { user_type: 'buyer' }
      });

      toast({
        title: "Switched to Buyer",
        description: "You are now browsing as a buyer",
      });

      navigate('/app');
    } catch (error) {
      toast({
        title: "Switch Failed",
        description: "Failed to switch user type",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('order_history')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update the local state
      setRecentOrders(prev => prev.map((order: any) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check authentication and seller profile
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (user.userType !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Seller account required.</p>
        </div>
      </div>
    );
  }

  if (!hasSellerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please complete your seller profile first.</p>
          <button
            onClick={() => navigate('/complete-profile')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 via-amber-50/90 to-green-50/95 backdrop-blur-xl border-b border-gradient-to-r from-amber-200/50 to-green-200/50 shadow-lg">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Business Info Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-green-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Coffee className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="font-bold text-gray-800 text-xl tracking-tight">
                  {user.businessName || user.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-green-100 text-amber-800 border border-amber-200/50">
                    {user.specialty || 'Coffee & Matcha'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-medium text-gray-600">
                      {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-3">
              {/* Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative">
                    <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
                      <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                    </button>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                      <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64" align="end">
                  {/* User Info Header */}
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10">
                        <img
                          className="aspect-square h-full w-full"
                          src={user.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                          alt={user.name || 'User'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground capitalize">seller</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Menu Items */}
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Switch User Type */}
                  <DropdownMenuItem
                    onClick={handleSwitchUserType}
                    className="cursor-pointer p-3 group hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-center w-full">
                      <div className="p-1.5 rounded-md mr-3 transition-all duration-300 bg-amber-100 text-amber-700 group-hover:bg-amber-200">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Switch to Buyer</div>
                        <div className="text-xs text-muted-foreground">Browse and order drinks</div>
                      </div>
                      <ArrowRightLeft className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-amber-200/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{analytics.whatsappOrders}</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{analytics.profileViews}</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-b border-amber-100">
        <div className="flex space-x-1 bg-white/70 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'menu', label: 'Menu', icon: Coffee },
            { id: 'orders', label: 'Orders', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-green-500 text-white shadow-lg transform scale-[0.98]'
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-green-600 bg-clip-text text-transparent">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name?.split(' ')[0] || 'Seller'}!
            </h2>
          </div>
          <p className="text-gray-600">Ready to brew some magic today?</p>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{analytics.whatsappOrders}</div>
                <div className="text-xs text-gray-500">WhatsApp Orders</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{analytics.uniqueCustomers}</div>
                <div className="text-xs text-gray-500">Unique Customers</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{analytics.profileViews}</div>
                <div className="text-xs text-gray-500">Profile Views</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{analytics.averageRating.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Average Rating</div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                This Week's Sales
              </h3>
              <div className="h-40 flex items-end justify-between space-x-2 px-2">
                {[60, 40, 80, 75, 90, 65, 85].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-400 to-green-500 rounded-t-lg transition-all duration-1000 hover:from-green-400 hover:to-emerald-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 font-medium">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {menuItems.length > 0 ? (
                  menuItems
                    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-800' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-amber-200 text-amber-700'
                        }`}>
                          {index + 1}
                        </div>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.sales || 0} orders</div>
                        </div>
                        <div className="text-sm font-bold text-green-600">{item.price} Dh</div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No menu items yet</p>
                    <p className="text-gray-400 text-sm">Add items to see top performers</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Add Item Button - Top of Menu */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-lg">
              <button
                onClick={handleAddItem}
                className="w-full bg-gradient-to-r from-amber-400 to-green-500 text-white rounded-xl py-4 px-6 flex items-center justify-center gap-3 hover:from-amber-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold text-lg">Add New Menu Item</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your delicious creations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-green-600">{item.price} Dh</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.category?.toLowerCase().includes('matcha')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.category?.toLowerCase().includes('matcha') ? '🍃 Matcha' : '☕ Coffee'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.isAvailable ? '✓ Available' : '⏸ Hidden'}
                          </span>
                          <span className="text-xs text-gray-500">{item.sales || 0} sold</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`p-2 rounded-full transition-all ${
                              item.isAvailable 
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            {item.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-amber-100 shadow-lg text-center">
                <Coffee className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                {menuItems.length === 0 ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Your Menu</h3>
                    <p className="text-gray-600 mb-6 text-lg">Add your first delicious item to get started!</p>
                    <button
                      onClick={handleAddItem}
                      className="bg-gradient-to-r from-amber-400 to-green-500 text-white rounded-xl py-4 px-8 flex items-center justify-center gap-3 hover:from-amber-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto group"
                    >
                      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-semibold text-xl">Add Your First Item</span>
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No items found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or add a new item</p>
                    <button
                      onClick={handleAddItem}
                      className="bg-gradient-to-r from-amber-400 to-green-500 text-white rounded-xl py-3 px-6 flex items-center justify-center gap-2 hover:from-amber-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto group"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-semibold">Add New Item</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                Recent Orders
              </h3>

              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="bg-white/50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{order.buyer?.name || 'Customer'}</p>
                            <p className="text-sm text-gray-500">
                              Order #{order.id.slice(-6)} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            {order.buyer?.phone && (
                              <p className="text-xs text-gray-400">📱 {order.buyer.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{order.total_amount.toFixed(2)} Dh</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1 mb-3">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm text-gray-600">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(item.price * item.quantity).toFixed(2)} Dh</span>
                          </div>
                        ))}
                      </div>

                      {/* Contact Method */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                          </svg>
                          WhatsApp Order
                        </div>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                          >
                            Confirm Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No Orders Yet</h4>
                  <p className="text-gray-500">Your customer orders will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Floating Add Button */}
      {activeTab === 'menu' && (
        <button
          onClick={handleAddItem}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-amber-400 to-green-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 px-6 py-4 hover:shadow-3xl hover:scale-105 transition-all duration-300 z-50 group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold text-lg">Add Menu Item</span>
        </button>
      )}
    </div>
  );
};

export default SellerDashboard;