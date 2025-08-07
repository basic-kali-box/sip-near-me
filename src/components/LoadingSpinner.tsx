import { Coffee, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
  variant?: "coffee" | "matcha" | "default";
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  message,
  variant = "default"
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const containerSizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const getIcon = () => {
    switch (variant) {
      case "coffee":
        return <Coffee className={cn(sizeClasses[size], "text-primary-foreground")} />;
      case "matcha":
        return <Leaf className={cn(sizeClasses[size], "text-primary-foreground")} />;
      default:
        return (
          <div className={cn(
            "border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin",
            sizeClasses[size]
          )} />
        );
    }
  };

  const getGradient = () => {
    switch (variant) {
      case "coffee":
        return "bg-gradient-coffee";
      case "matcha":
        return "bg-gradient-matcha";
      default:
        return "bg-gradient-matcha";
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className={cn(
        "rounded-2xl flex items-center justify-center animate-pulse",
        containerSizeClasses[size],
        getGradient()
      )}>
        {getIcon()}
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Page-level loading component
export const PageLoading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
      <LoadingSpinner size="lg" variant="matcha" message={message} />
    </div>
  );
};

// Inline loading component for buttons
export const ButtonLoading = ({ size = "sm" }: { size?: "sm" | "md" }) => {
  return (
    <div className={cn(
      "border-2 border-current border-t-transparent rounded-full animate-spin",
      size === "sm" ? "w-4 h-4" : "w-5 h-5"
    )} />
  );
};
