import React, { useState, useEffect } from 'react';
import {
  User, Coffee, Plus, Edit, Trash2, Eye, EyeOff, Search, BarChart3,
  Star, DollarSign, Package, TrendingUp, Heart, Menu, Settings,
  LayoutDashboard, LogOut, ArrowRightLeft, ShoppingBag
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSellerProfile, setHasSellerProfile] = useState(null);

  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    averageRating: 0,
    uniqueCustomers: 0
  });

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
            sales: 0
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

      // Get contact attempts for unique customers
      const { data: contactData, error: contactError } = await supabase
        .from('seller_analytics')
        .select('viewer_id')
        .eq('seller_id', sellerId)
        .eq('event_type', 'contact_attempt')
        .not('viewer_id', 'is', null);

      if (contactError) {
        console.error('Failed to load contact data:', contactError);
      }

      // Calculate analytics
      const profileViews = profileViewsData?.length || 0;
      const averageRating = sellerData?.rating_average || 0;
      const uniqueCustomers = new Set(contactData?.map(contact => contact.viewer_id)).size;

      setAnalytics({
        profileViews,
        averageRating,
        uniqueCustomers
      });
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
                    className="cursor-pointer p-4 min-h-[52px] group hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 touch-manipulation focus:ring-2 focus:ring-primary/30"
                  >
                    <div className="flex items-center w-full">
                      <div className="p-2 rounded-lg mr-4 transition-all duration-300 bg-amber-100 text-amber-700 group-hover:bg-amber-200">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Switch to Buyer</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Browse and order drinks</div>
                      </div>
                      <ArrowRightLeft className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
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
                  <div className="text-lg font-bold text-gray-800">{analytics.profileViews}</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{analytics.averageRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Rating</div>
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
            { id: 'menu', label: 'Menu', icon: Coffee }
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
            <div className="grid grid-cols-3 gap-4">
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
                          <div className="text-xs text-gray-500">{item.category || 'Drink'}</div>
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