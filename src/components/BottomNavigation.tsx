import { MapPin, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: "map" | "list" | "add";
  onTabChange: (tab: "map" | "list" | "add") => void;
  className?: string;
}

export const BottomNavigation = ({ activeTab, onTabChange, className }: BottomNavigationProps) => {
  const tabs = [
    { id: "map" as const, label: "Map", icon: MapPin },
    { id: "list" as const, label: "List", icon: List },
    { id: "add" as const, label: "Add Listing", icon: Plus },
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
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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