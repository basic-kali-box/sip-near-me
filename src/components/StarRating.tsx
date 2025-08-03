import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const StarRating = ({ 
  rating, 
  reviewCount, 
  size = "md", 
  showText = true,
  className = ""
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`${sizeClasses[size]} fill-primary text-primary`}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${sizeClasses[size]} text-border`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-primary text-primary`} />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className={`${sizeClasses[size]} text-border`}
        />
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showText && (
        <div className={`flex items-center gap-1 ${textSizeClasses[size]} text-muted-foreground`}>
          <span className="font-medium text-foreground">{rating}</span>
          {reviewCount && (
            <span>({reviewCount} reviews)</span>
          )}
        </div>
      )}
    </div>
  );
};