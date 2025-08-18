import { MapPin, List, Plus, User, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface BottomNavigationProps {
  activeTab: "map" | "list";
  onTabChange: (tab: "map" | "list") => void;
  className?: string;
}

export const BottomNavigation = ({ activeTab, onTabChange, className }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useUser();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      // Navigation is now handled by the logout function in UserContext
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: "map" as const, label: "Map", icon: MapPin, isTab: true },
    { id: "list" as const, label: "List", icon: List, isTab: true },
    // Only show Add Listing for sellers
    ...(isAuthenticated && user?.userType === 'seller'
      ? [{ id: "add" as const, label: "Add Listing", icon: Plus, isTab: false }]
      : []
    ),
    // Show different options based on authentication state
    isAuthenticated
      ? { id: "profile" as const, label: "Profile", icon: User, isTab: false }
      : { id: "signin" as const, label: "Sign In", icon: LogIn, isTab: false },
    // Add sign out option for authenticated users
    ...(isAuthenticated ? [{ id: "signout" as const, label: "Sign Out", icon: LogOut, isTab: false }] : []),
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 z-50",
      "md:hidden", // Only show on mobile
      className
    )}>
      <nav className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isTab && activeTab === tab.id;

          const handleClick = () => {
            if (tab.isTab) {
              onTabChange(tab.id as "map" | "list");
            } else if (tab.id === "add") {
              navigate("/add-listing");
            } else if (tab.id === "profile") {
              navigate("/profile");
            } else if (tab.id === "signin") {
              navigate("/auth");
            } else if (tab.id === "signout") {
              handleSignOut();
            }
          };

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200",
                "min-h-[60px] touch-manipulation", // Minimum touch target
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};