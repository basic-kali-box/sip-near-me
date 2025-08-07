import { ArrowRight, Coffee, Leaf, Star, Clock, MapPin, ShoppingBag, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createNavigationHelpers, trackNavigation } from "@/utils/navigationHelpers";
import heroImage from "@/assets/hero-matcha-coffee.jpg";
import matchaBarista from "@/assets/matcha-barista.jpg";
import coffeeBrewing from "@/assets/coffee-brewing.jpg";
import matchaProduct from "@/assets/matcha-product.jpg";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create navigation helpers with error handling
  const navigationHelpers = createNavigationHelpers(navigate, (error) => {
    toast({
      title: "Navigation Error",
      description: "Unable to navigate. Please try again.",
      variant: "destructive",
    });
  });

  // Navigation handlers with proper error handling and analytics
  const handleSignIn = () => {
    trackNavigation('landing', 'signin');
    navigationHelpers.navigateToSignIn();
  };

  const handleSignUp = () => {
    trackNavigation('landing', 'signup');
    navigationHelpers.navigateToSignUp();
  };

  const handleBecomeASeller = () => {
    trackNavigation('landing', 'signup', 'seller');
    navigationHelpers.navigateToSellerSignUp('landing_become_seller');
  };
  const features = [
    {
      icon: Coffee,
      title: "Premium Coffee",
      description: "Discover artisan coffee roasters and specialty brews in your neighborhood"
    },
    {
      icon: Leaf, 
      title: "Authentic Matcha",
      description: "Find ceremonial grade matcha and traditional tea experiences"
    },
    {
      icon: Clock,
      title: "Quick Delivery",
      description: "Fresh drinks delivered in 15-30 minutes from local sellers"
    },
    {
      icon: Star,
      title: "Quality Verified",
      description: "All sellers are verified and rated by the community"
    }
  ];

  const stats = [
    { number: "500+", label: "Local Sellers" },
    { number: "50k+", label: "Happy Customers" },
    { number: "4.9", label: "Average Rating" },
    { number: "15min", label: "Avg Delivery" }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-matcha rounded-2xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BrewNear</h1>
                <p className="text-xs text-muted-foreground">Premium Coffee & Matcha</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignIn}
                className="hover:text-primary transition-colors duration-200"
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-gradient-matcha hover:shadow-glow transition-all duration-300"
                onClick={handleSignUp}
                aria-label="Create a new account"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                  <Leaf className="w-4 h-4" />
                  Premium Quality Guaranteed
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Find Amazing
                  <br />
                  <span className="text-primary font-bold">
                    Coffee & Matcha
                  </span>
                  <br />
                  Near You
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Discover local artisan coffee roasters and authentic matcha makers. 
                  Order premium drinks from verified sellers and enjoy fast delivery.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-gradient-matcha hover:shadow-glow transition-all duration-300 text-lg px-8"
                  aria-label="Explore nearby coffee and matcha sellers"
                >
                  Explore Nearby
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  onClick={handleBecomeASeller}
                  aria-label="Sign up as a seller to start selling drinks"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Become a Seller
                </Button>
              </div>

              {/* Authentication Options */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignIn}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="Sign in to existing account"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Already have an account? Sign In
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-floating">
                <img
                  src={heroImage}
                  alt="Premium coffee and matcha setup"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              
              {/* Floating cards */}
              <Card className="absolute -bottom-6 -left-6 p-4 bg-background/95 backdrop-blur-md shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-matcha rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Zen Matcha Studio</div>
                    <div className="text-sm text-muted-foreground">0.3 mi • 15-25 min</div>
                  </div>
                </div>
              </Card>

              <Card className="absolute -top-6 -right-6 p-4 bg-background/95 backdrop-blur-md shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Nordic Roasters</div>
                    <div className="text-sm text-muted-foreground">4.7★ • Premium</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Why Choose BrewNear?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with passionate local sellers who craft exceptional coffee and matcha experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center border-border/50 hover:shadow-elegant transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-matcha rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Discover Amazing Experiences
            </h2>
            <p className="text-xl text-muted-foreground">
              From traditional matcha ceremonies to innovative coffee brewing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={matchaBarista}
                  alt="Professional matcha preparation"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Artisan Matcha</h3>
                <p className="text-muted-foreground">Ceremonial grade matcha prepared by skilled artisans</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={coffeeBrewing}
                  alt="Coffee brewing process"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Specialty Coffee</h3>
                <p className="text-muted-foreground">Single origin beans and innovative brewing methods</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={matchaProduct}
                  alt="Premium matcha ingredients"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Premium Ingredients</h3>
                <p className="text-muted-foreground">Only the finest quality ingredients and tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Discover Your Perfect Cup?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of coffee and matcha lovers finding amazing local experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={onGetStarted}
                className="text-lg px-8 bg-background text-foreground hover:bg-background/90 transition-all duration-300"
                aria-label="Find nearby coffee and matcha sellers"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Nearby Sellers
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground transition-all duration-300"
                onClick={handleBecomeASeller}
                aria-label="Start selling your drinks on BrewNear"
              >
                Start Selling
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-matcha rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BrewNear</span>
            </div>
            <p className="text-background/70 mb-6">
              Connecting coffee and matcha lovers with local artisans
            </p>
            <div className="text-sm text-background/50">
              © 2024 BrewNear. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};