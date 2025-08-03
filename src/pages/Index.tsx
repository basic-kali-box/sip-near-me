import { useState, useEffect } from "react";
import { MapPin, Droplets } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ListView } from "@/components/ListView";
import { MapView } from "@/components/MapView";
import { AddListingView } from "@/components/AddListingView";
import { LandingPage } from "@/components/LandingPage";
import { OrderWorkflow } from "@/components/OrderWorkflow";
import { Button } from "@/components/ui/button";
import { Seller } from "@/data/mockSellers";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"map" | "list" | "add">("list");
  const [showLanding, setShowLanding] = useState(true);
  const [selectedSellerForOrder, setSelectedSellerForOrder] = useState<Seller | null>(null);
  const [userLocation, setUserLocation] = useState<string>("New York, NY");

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

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "map":
        return <MapView className="flex-1" />;
      case "add":
        return <AddListingView className="flex-1" />;
      default:
        return <ListView onStartOrder={setSelectedSellerForOrder} className="flex-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden on mobile when in map/list view */}
      <header className={`bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 transition-all duration-300 ${
        activeTab !== "add" ? "md:block hidden" : "block"
      }`}>
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
              variant={activeTab === "add" ? "default" : "ghost"}
              onClick={() => setActiveTab("add")}
              className={activeTab === "add" ? "bg-gradient-matcha" : ""}
            >
              Add Listing
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

      {/* Order workflow modal */}
      <OrderWorkflow
        seller={selectedSellerForOrder}
        isOpen={!!selectedSellerForOrder}
        onClose={() => setSelectedSellerForOrder(null)}
      />
    </div>
  );
};

export default Index;
