import { useEffect, useState } from "react";
import {
  ArrowLeft, Coffee, Plus, Edit, Trash2, User, DollarSign, Package, Star, MoreHorizontal,
  Search, BarChart3, Utensils, Eye, EyeOff, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SellerService } from "@/services/sellerService";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";


const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSellerProfile, setHasSellerProfile] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu'>('menu');

  useEffect(() => {
    // Main data fetching logic
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const profileExists = await SellerService.sellerProfileExists(user.id);
        setHasSellerProfile(profileExists);

        if (profileExists) {
          const { data: drinks, error: drinksError } = await supabase
            .from('drinks').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
          if (drinksError) throw drinksError;
          setMenuItems(drinks?.map(d => ({
            id: d.id, name: d.name, price: d.price, image: d.photo_url, category: d.category, is_available: d.is_available
          })) || []);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // --- Action Handlers (Edit, Delete, Toggle Availability) ---
  const handleEditItem = (itemId: string) => navigate(`/edit-listing/${itemId}`);

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Delete "${itemName}"? This action cannot be undone.`)) return;
    try {
      await supabase.from('drinks').delete().eq('id', itemId).throwOnError();
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast({ title: "Success", description: `"${itemName}" was deleted.` });
    } catch (error: any) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
    }
  };

  const toggleItemAvailability = async (itemId: string, currentAvailability: boolean) => {
    try {
      await supabase.from('drinks').update({ is_available: !currentAvailability }).eq('id', itemId).throwOnError();
      setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, is_available: !currentAvailability } : item));
      toast({ title: "Status Updated", description: `Item is now ${!currentAvailability ? 'available' : 'hidden'}.` });
    } catch (error: any) {
      toast({ title: "Error updating item", description: error.message, variant: "destructive" });
    }
  };

  // --- Render Logic ---
  if (loading) return <FullScreenLoader message="Loading Your Dashboard..." />;
  if (!user) return <FullScreenLoader message="Authenticating..." />;
  if (user.userType !== 'seller') return <AccessDeniedScreen />;
  if (!hasSellerProfile) return <CompleteProfilePrompt />;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">
      <DashboardHeader businessName={user.businessName} />

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('dashboard.welcome', { name: user.name })}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('dashboard.todayIs', { date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) })}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-2 rounded-lg bg-slate-200 dark:bg-slate-800 p-1">
            <TabButton
              icon={BarChart3}
              label={t('dashboard.analytics')}
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              icon={Utensils}
              label={t('dashboard.menu')}
              isActive={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'menu' && (
            <MenuView
              items={menuItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onToggleAvailability={toggleItemAvailability}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button for Adding Items */}
      {activeTab === 'menu' && (
        <Button
          onClick={() => navigate('/add-listing')}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl text-white flex items-center justify-center z-30 transform transition-transform hover:scale-105"
        >
          <Plus className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
};


// --- UI Sub-components ---

const DashboardHeader = ({ businessName }: { businessName?: string }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app')} className="text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4">
          <UserMenu variant="desktop" />
        </div>
      </div>
    </header>
  );
};

const TabButton = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
      ${isActive ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const AnalyticsView = () => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Sales</CardTitle>
          <DollarSign className="w-5 h-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">1,250 Dh</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+15% from yesterday</p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Orders</CardTitle>
          <Package className="w-5 h-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">32</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">4 pending</p>
        </CardContent>
      </Card>
    </div>

    {/* Sales Chart Card */}
    <Card className="bg-white dark:bg-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>This Week's Sales</CardTitle>
        <CardDescription>A visual summary of your sales performance.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Placeholder for a chart library like Recharts or Chart.js */}
        <div className="h-48 w-full flex items-end justify-between space-x-2 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '60%' }}></div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '40%' }}></div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '80%' }}></div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '75%' }}></div>
          <div className="w-full bg-emerald-300 dark:bg-emerald-700 rounded-t-md" style={{ height: '90%' }}></div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '50%' }}></div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-t-sm" style={{ height: '65%' }}></div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Orders Placeholder */}
     <Card className="bg-white dark:bg-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest orders and reviews.</CardDescription>
      </CardHeader>
       <CardContent>
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">No recent activity to show.</p>
       </CardContent>
     </Card>
  </div>
);

const MenuView = ({ items, onEdit, onDelete, onToggleAvailability }: any) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder={t('dashboard.searchMenu')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item: any) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-slate-500 py-10">{t('dashboard.noItems')}</p>
        )}
      </div>
    </div>
  );
};

const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }: any) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex gap-4 transition-shadow hover:shadow-md">
    <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Coffee className="w-8 h-8 text-slate-400" />
        </div>
      )}
    </div>
    <div className="flex-grow flex flex-col justify-between min-w-0">
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</h3>
        <p className="text-sm font-bold text-emerald-500">{item.price} Dh</p>
      </div>
      <Badge variant={item.is_available ? "default" : "secondary"} className={`w-fit mt-1 text-xs ${item.is_available ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
        {item.is_available ? "Available" : "Hidden"}
      </Badge>
    </div>
    <div className="flex-shrink-0">
       <Button variant="ghost" size="icon" onClick={() => onEdit(item.id)}>
          <Edit className="w-4 h-4 text-slate-500 hover:text-slate-800" />
       </Button>
    </div>
  </div>
);


// --- Full Page State Components ---

const CompleteProfilePrompt = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="text-center max-w-lg w-full shadow-lg">
        <CardHeader>
          <div className="mx-auto w-16 h-16 mb-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Let's Get You Set Up!</CardTitle>
          <CardDescription>Complete your profile to start selling and appear to customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate('/complete-profile')}>
            Complete Your Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const FullScreenLoader = ({ message }: { message: string }) => (
  <div className="h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

const AccessDeniedScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="text-center max-w-md w-full">
        <CardHeader>
          <div className="mx-auto w-16 h-16 mb-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <X className="w-8 h-8" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>This dashboard is for sellers only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => navigate('/')}>Go to Homepage</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerDashboard;