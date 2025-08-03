import { useState, useEffect } from "react";
import { MapPin, Droplets } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ListView } from "@/components/ListView";
import { MapView } from "@/components/MapView";
import { AddListingView } from "@/components/AddListingView";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"map" | "list" | "add">("list");
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

  const renderActiveView = () => {
    switch (activeTab) {
      case "map":
        return <MapView className="flex-1" />;
      case "add":
        return <AddListingView className="flex-1" />;
      default:
        return <ListView className="flex-1" />;
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
            <div className="w-8 h-8 bg-gradient-sunrise rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Drinks Next To Me</h1>
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
              className={activeTab === "list" ? "bg-gradient-sunrise" : ""}
            >
              List View
            </Button>
            <Button
              variant={activeTab === "map" ? "default" : "ghost"}
              onClick={() => setActiveTab("map")}
              className={activeTab === "map" ? "bg-gradient-sunrise" : ""}
            >
              Map View
            </Button>
            <Button
              variant={activeTab === "add" ? "default" : "ghost"}
              onClick={() => setActiveTab("add")}
              className={activeTab === "add" ? "bg-gradient-sunrise" : ""}
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
    </div>
  );
};

export default Index;
