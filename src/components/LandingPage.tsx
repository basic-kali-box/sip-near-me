import { ArrowRight, Coffee, Leaf, Star, Clock, MapPin, ShoppingBag, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { createNavigationHelpers, trackNavigation } from "@/utils/navigationHelpers";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-matcha-coffee.jpg";
import matchaBarista from "@/assets/matcha-barista.jpg";
import coffeeBrewing from "@/assets/coffee-brewing.jpg";
import matchaProduct from "@/assets/matcha-product.jpg";

interface LandingPageProps {
  onGetStarted?: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useUser();
  const { t } = useTranslation();

  // Debug logging to see what the component receives
  console.log('🏠 LandingPage render:', {
    isLoading,
    isAuthenticated,
    user: user ? { id: user.id, name: user.name, userType: user.userType } : null
  });

  // Create navigation helpers with error handling
  const navigationHelpers = createNavigationHelpers(navigate, (error) => {
    toast({
      title: t('errors.navigationError'),
      description: t('errors.unableToNavigate'),
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
      title: t('landing.features.premiumCoffee.title'),
      description: t('landing.features.premiumCoffee.description')
    },
    {
      icon: Leaf,
      title: t('landing.features.authenticMatcha.title'),
      description: t('landing.features.authenticMatcha.description')
    },
    {
      icon: Clock,
      title: t('landing.features.quickDelivery.title'),
      description: t('landing.features.quickDelivery.description')
    },
    {
      icon: Star,
      title: t('landing.features.qualityVerified.title'),
      description: t('landing.features.qualityVerified.description')
    }
  ];

  const stats = [
    { number: "500+", label: t('landing.stats.localSellers') },
    { number: "50k+", label: t('landing.stats.happyCustomers') },
    { number: "4.9", label: t('landing.stats.averageRating') },
    { number: "15min", label: t('landing.stats.avgDelivery') }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/app');
                } else {
                  navigate('/signin');
                }
              }}
            >
              <div className="w-10 h-10 bg-gradient-matcha rounded-2xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Machroub</h1>
                <p className="text-xs text-muted-foreground">Premium Coffee & Matcha</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSwitcher
                variant="ghost"
                size="sm"
                showText={false}
              />
              {isLoading ? (
                // Loading state - show placeholder
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {t('common.loading')}
                  </div>
                </div>
              ) : isAuthenticated && user ? (
                // Authenticated user - show welcome message and user menu
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {t('landing.welcomeBackUser', { name: user.name || user.email?.split('@')[0] || 'User' })}
                  </div>
                  <UserMenu variant="desktop" />
                </div>
              ) : (
                // Non-authenticated user - show sign in/up buttons
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignIn}
                    className="hover:text-primary transition-colors duration-200"
                    aria-label={t('landing.signInToAccount')}
                  >
                    {t('auth.signIn')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-matcha hover:shadow-glow transition-all duration-300"
                    onClick={handleSignUp}
                    aria-label={t('landing.signUpForAccount')}
                  >
                    {t('landing.getStarted')}
                  </Button>
                </>
              )}
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
                  {t('landing.premiumQuality')}
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  {t('landing.findAmazing')}
                  <br />
                  <span className="text-primary font-bold">
                    {t('landing.coffeeMatcha')}
                  </span>
                  <br />
                  {t('landing.nearYou')}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t('landing.heroDescription')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={onGetStarted || (() => navigate('/app'))}
                  className="bg-gradient-matcha hover:shadow-glow transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 min-h-[48px] touch-manipulation"
                  aria-label={t('landing.exploreNearby')}
                >
                  <span>{t('landing.exploreNearby')}</span>
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
                {isAuthenticated && user ? (
                  // Show relevant button based on user type
                  user.userType === 'seller' ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 touch-manipulation"
                      onClick={() => navigate('/seller-dashboard')}
                      aria-label="Go to your seller dashboard"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{t('landing.myDashboard')}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 touch-manipulation"
                      onClick={handleBecomeASeller}
                      aria-label={t('nav.becomeSeller')}
                    >
                      <ShoppingBag className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{t('nav.becomeSeller')}</span>
                    </Button>
                  )
                ) : (
                  // Non-authenticated user - show become a seller
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 touch-manipulation"
                    onClick={handleBecomeASeller}
                    aria-label={t('nav.becomeSeller')}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{t('nav.becomeSeller')}</span>
                  </Button>
                )}
              </div>

              {/* Authentication Options - only show for non-authenticated users */}
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignIn}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] px-4 py-2 touch-manipulation"
                    aria-label="Sign in to existing account"
                  >
                    <LogIn className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{t('auth.alreadyHaveAccount')} {t('auth.signIn')}</span>
                  </Button>
                </div>
              )}

              {/* Authenticated user message */}
              {!isLoading && isAuthenticated && user && (
                <div className="pt-4">
                  <div className="bg-gradient-to-r from-coffee-50 to-matcha-50 border border-coffee-200 rounded-lg p-4">
                    <p className="text-coffee-800 text-center">
                      🎉 {t('landing.welcomeBackUser', { name: user.name || user.email?.split('@')[0] })}
                      {user.userType === 'seller' ? t('landing.readyToManage') : t('landing.readyToDiscover')}
                    </p>
                  </div>
                </div>
              )}

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
              {t('landing.whyChoose')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.whyChooseDescription')}
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
              {t('landing.gallery.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('landing.gallery.subtitle')}
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
                onClick={onGetStarted || (() => navigate('/app'))}
                className="text-lg px-8 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
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
                aria-label="Start selling your drinks on Machroub"
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
              <span className="text-xl font-bold">Machroub</span>
            </div>
            <p className="text-background/70 mb-6">
              Connecting coffee and matcha lovers with local artisans
            </p>
            <div className="text-sm text-background/50">
              © 2024 Machroub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};