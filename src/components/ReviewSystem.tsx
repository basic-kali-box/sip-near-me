import { useState } from "react";
import { Star, User, ThumbsUp, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  orderItems?: string[];
}

interface ReviewSystemProps {
  sellerId: string;
  sellerName: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  onReviewSubmitted?: (review: Review) => void;
}

export const ReviewSystem = ({
  sellerId,
  sellerName,
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  onReviewSubmitted
}: ReviewSystemProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock reviews for demonstration
  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah M.',
      rating: 5,
      comment: 'Amazing matcha latte! The quality is exceptional and the service was super friendly. Will definitely order again!',
      date: '2024-01-15',
      helpful: 12,
      orderItems: ['Matcha Latte', 'Almond Croissant']
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'John D.',
      rating: 4,
      comment: 'Great coffee and quick service. The cold brew was perfect for a hot day.',
      date: '2024-01-10',
      helpful: 8,
      orderItems: ['Cold Brew']
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Emma L.',
      rating: 5,
      comment: 'Best cappuccino in the area! Love supporting local businesses like this.',
      date: '2024-01-08',
      helpful: 15,
      orderItems: ['Cappuccino', 'Chocolate Muffin']
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (newReview.rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const review: Review = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
        helpful: 0
      };

      onReviewSubmitted?.(review);

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      });

      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} cursor-pointer transition-all duration-200 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 hover:text-yellow-400'
        } ${interactive ? 'hover:scale-110' : ''}`}
        onClick={interactive ? () => handleStarClick(index + 1) : undefined}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Customer Reviews</h3>
          {user && (
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{averageRating || 4.6}</div>
            <div className="flex items-center justify-center mb-1">
              {renderStars(Math.round(averageRating || 4.6))}
            </div>
            <div className="text-sm text-muted-foreground">{totalReviews || displayReviews.length} reviews</div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = displayReviews.filter(r => r.rating === stars).length;
              const percentage = displayReviews.length > 0 ? (count / displayReviews.length) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{stars}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="glass-card p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Write a Review for {sellerName}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {renderStars(newReview.rating, true)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
              <Textarea
                placeholder="Share your experience with this seller..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || newReview.rating === 0}
                className="bg-gradient-matcha hover:shadow-glow transition-all duration-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <Card key={review.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-coffee rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{review.userName}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(review.rating, false, "w-4 h-4")}
              </div>
            </div>

            {review.orderItems && (
              <div className="flex gap-2 mb-3">
                {review.orderItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-foreground mb-3">{review.comment}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-primary transition-colors duration-200">
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
