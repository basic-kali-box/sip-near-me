import { useState, useEffect } from "react";
import { MapPin, Droplets, User, Plus, Menu, X } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ListView } from "@/components/ListView";
import { MapView } from "@/components/MapView";
import { LandingPage } from "@/components/LandingPage";
import { Button } from "@/components/ui/button";
import { Seller } from "@/data/mockSellers";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"map" | "list">("list");
  const [showLanding, setShowLanding] = useState(true);
  const [userLocation, setUserLocation] = useState<string>("New York, NY");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Mock location detection
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      () => {
        // In a real app, you'd reverse geocode coordinates
        setUserLocation("Current Location");
      },
      () => {
        console.log("Location access denied");
      }
    );
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

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  const handleStartOrder = (seller: Seller) => {
    navigate(`/order/${seller.id}`);
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
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger Menu */}
      <header className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50" data-mobile-menu>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo and Location */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-matcha rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">BrewNear</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{userLocation}</span>
              </div>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isMobileMenuOpen ? closeMenu() : setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-primary/10 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
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
                    className="w-full justify-start py-3 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 group"
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
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/auth");
                      closeMenu();
                    }}
                    className="justify-center py-3 font-semibold hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      closeMenu();
                    }}
                    className="bg-gradient-matcha hover:shadow-glow hover:scale-105 transition-all duration-300 justify-center py-3 font-semibold"
                  >
                    Sign Up
                  </Button>
                </div>
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
              <h1 className="text-xl font-bold text-foreground">BrewNear</h1>
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
            <Button
              variant="outline"
              onClick={() => navigate("/add-listing")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Listing
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300 flex items-center gap-2"
            >
              Sign Up
            </Button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col h-screen md:h-[calc(100vh-80px)]">
        {renderActiveView()}
      </main>

      {/* Bottom navigation for mobile */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

    </div>
  );
};

export default Index;
