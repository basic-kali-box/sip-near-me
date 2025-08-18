import { useState, useEffect } from "react";
import { MapPin, Droplets, User, Plus, Menu, Leaf, LogOut, ShoppingBag } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ListView } from "@/components/ListView";
import { MapView } from "@/components/MapView";
import { UserMenu } from "@/components/UserMenu";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { ItemCardItem } from "@/components/ItemCard";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { getCurrentLocation, reverseGeocode } from "@/utils/geocoding";
import { SEO, SEO_CONFIGS } from "@/components/SEO";
import { getWebApplicationSchema } from "@/utils/structuredData";

const Index = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState<"map" | "list">("list");
  const [userLocation, setUserLocation] = useState<string>("Detecting location...");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Real location detection with reverse geocoding
  useEffect(() => {
    const detectLocation = async () => {
      try {
        console.log('🔄 Detecting user location...');
        const coordinates = await getCurrentLocation();
        console.log('📍 Got coordinates:', coordinates);

        const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
        console.log('🏠 Reverse geocoded address:', address);

        if (address) {
          // Extract city and state/country from the full address
          const parts = address.split(',');
          if (parts.length >= 2) {
            // Take the last 2 parts (usually city, state/country)
            const cityAndRegion = parts.slice(-2).map(part => part.trim()).join(', ');
            setUserLocation(cityAndRegion);
          } else {
            setUserLocation(address);
          }
        } else {
          setUserLocation("Location detected");
        }
      } catch (error) {
        console.warn('Location detection failed:', error);
        setUserLocation("Location unavailable");
      }
    };

    detectLocation();
  }, []);



  // Enhanced menu close function with animation
  const closeMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 300); // Match animation duration
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);



  const handleStartOrder = (item: ItemCardItem) => {
    navigate(`/order/${item.seller_id}?item=${item.id}`);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "map":
        return <MapView className="flex-1" />;
      default:
        return <ListView onStartOrder={handleStartOrder} className="flex-1" />;
    }
  };

  return (
    <>
      <SEO
        {...SEO_CONFIGS.sellers}
        title={`Find Coffee & Matcha in ${userLocation}`}
        description={`Discover amazing coffee roasters and matcha makers in ${userLocation}. Browse local sellers, view menus, and order premium drinks for delivery.`}
        structuredData={getWebApplicationSchema()}
      />
      <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger Menu */}
      <header className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-[100]" data-mobile-menu>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo and Location */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-matcha rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isAuthenticated && user ? `Welcome, ${user.name}` : 'BrewNear'}
              </h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{userLocation}</span>
              </div>
            </div>
          </div>

          {/* Hamburger Menu Button now toggles the Sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleSidebar()}
            className="h-9 w-9 hover:bg-primary/10 transition-colors duration-200 relative z-[101]"
          >
            <Menu className="w-5 h-5 text-foreground" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

            <div className={`absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-floating z-50 ${
              isMenuClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
            }`}>
            <div className="container mx-auto px-6 py-6 space-y-6">
              {/* Premium View Toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-matcha rounded-full"></div>
                  <p className="text-sm font-bold text-foreground">Browse</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={activeTab === "list" ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab("list");
                      closeMenu();
                    }}
                    className={`justify-center py-3 font-semibold transition-all duration-300 ${
                      activeTab === "list"
                        ? "bg-gradient-matcha shadow-glow hover:scale-105"
                        : "hover:bg-primary/10 hover:border-primary/50"
                    }`}
                  >
                    📋 List
                  </Button>
                  <Button
                    variant={activeTab === "map" ? "default" : "outline"}
                    onClick={() => {
                      setActiveTab("map");
                      closeMenu();
                    }}
                    className={`justify-center py-3 font-semibold transition-all duration-300 ${
                      activeTab === "map"
                        ? "bg-gradient-matcha shadow-glow hover:scale-105"
                        : "hover:bg-primary/10 hover:border-primary/50"
                    }`}
                  >
                    🗺️ Map
                  </Button>
                </div>
              </div>

              {/* Essential Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-coffee rounded-full"></div>
                  <p className="text-sm font-bold text-foreground">Quick Actions</p>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/add-listing");
                      closeMenu();
                    }}
                    className="w-full justify-start py-3 bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-matcha rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                      <Plus className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Start Selling</span>
                  </Button>
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-latte rounded-full"></div>
                  <p className="text-sm font-bold text-foreground">Account</p>
                </div>

                {isAuthenticated && user ? (
                  // Authenticated user options
                  <UserMenu variant="mobile" />
                ) : (
                  // Non-authenticated user options
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/signin");
                        closeMenu();
                      }}
                      className="justify-center py-3 font-semibold bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/signup");
                        closeMenu();
                      }}
                      className="bg-gradient-matcha hover:shadow-glow hover:scale-105 transition-all duration-300 justify-center py-3 font-semibold"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}
      </header>

      {/* Header - Always visible on desktop, hidden on mobile */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 transition-all duration-300 md:block hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-matcha rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isAuthenticated && user ? `Welcome, ${user.name}` : 'BrewNear'}
              </h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{userLocation}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-2">
            <Button
              variant={activeTab === "list" ? "default" : "ghost"}
              onClick={() => setActiveTab("list")}
              className={activeTab === "list" ? "bg-gradient-matcha" : ""}
            >
              List View
            </Button>
            <Button
              variant={activeTab === "map" ? "default" : "ghost"}
              onClick={() => setActiveTab("map")}
              className={activeTab === "map" ? "bg-gradient-matcha" : ""}
            >
              Map View
            </Button>

            {isAuthenticated && user ? (
              // Authenticated user navigation
              <>
                {user.userType === 'seller' ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/seller-dashboard")}
                    className="flex items-center gap-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700"
                  >
                    <Plus className="w-4 h-4" />
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/orders")}
                    className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Orders
                  </Button>
                )}
                <UserMenu variant="desktop" />
              </>
            ) : (
              // Non-authenticated user navigation
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/signin")}
                  className="flex items-center gap-2 bg-white/80 border-gray-300 text-gray-700 hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-700"
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/signup?userType=seller")}
                  className="bg-matcha-50 border-matcha-300 text-matcha-700 hover:bg-matcha-100 hover:border-matcha-400 hover:text-matcha-800 transition-all duration-300 flex items-center gap-2"
                >
                  <Leaf className="w-4 h-4" />
                  Become a Seller
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300 flex items-center gap-2"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col h-screen md:h-[calc(100vh-80px)] relative">
        {renderActiveView()}

        {/* Floating Action Button for Sellers in List View */}
        {isAuthenticated && user?.userType === 'seller' && activeTab === 'list' && (
          <Button
            onClick={() => navigate('/add-listing')}
            className="fixed bottom-20 md:bottom-6 right-6 h-14 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl text-white flex items-center justify-center gap-2 z-30 transform transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Item</span>
          </Button>
        )}
      </main>

      {/* Bottom navigation for mobile */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />


      </div>
    </>
  );
};

export default Index;
