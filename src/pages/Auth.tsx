import { ArrowLeft, Coffee, Leaf, Shield, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute -top-2 left-0 flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="w-24 h-24 bg-gradient-matcha rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 relative">
            <Coffee className="w-12 h-12 text-primary-foreground" />
            <Leaf className="w-4 h-4 text-primary-foreground/80 absolute -top-1 -right-1" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-3">Welcome to BrewNear</h1>
          <p className="text-lg text-muted-foreground mb-2">Your local coffee & matcha marketplace</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 hover:text-primary/80 transition-colors duration-200">
            <Shield className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
            <span>Secure & trusted platform</span>
          </div>
        </div>

        {/* Auth Options */}
        <div className="space-y-6">
          {/* Sign In Card */}
          <Card className="glass-card border-border/30 shadow-elegant p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-coffee rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                <LogIn className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Sign In</h2>
                <p className="text-muted-foreground mb-6">
                  Welcome back! Continue your BrewNear journey
                </p>
              </div>
              <Button
                onClick={() => navigate('/signin')}
                className="w-full h-12 bg-gradient-coffee hover:shadow-glow hover:scale-[1.02] transition-all duration-300 font-semibold text-base relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Your Account
              </Button>
            </div>
          </Card>

          {/* Sign Up Card */}
          <Card className="glass-card border-border/30 shadow-elegant p-8 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-matcha rounded-2xl flex items-center justify-center mx-auto shadow-soft">
                <UserPlus className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Sign Up</h2>
                <p className="text-muted-foreground mb-6">
                  New to BrewNear? Join our community today
                </p>
              </div>
              <Button
                onClick={() => navigate('/signup')}
                className="w-full h-12 bg-gradient-matcha hover:shadow-glow hover:scale-[1.02] transition-all duration-300 font-semibold text-base relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <UserPlus className="w-5 h-5 mr-2" />
                Create New Account
              </Button>
            </div>
          </Card>

          {/* User Type Preview */}
          <Card className="glass-card border-border/30 shadow-elegant p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Choose Your Journey</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50">
                  <Coffee className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Buyer</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Discover & order amazing drinks</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                  <Leaf className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Seller</h4>
                  <p className="text-xs text-green-700 dark:text-green-300">Share your drinks with the world</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <button
              onClick={() => navigate('/terms')}
              className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              onClick={() => navigate('/privacy')}
              className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
