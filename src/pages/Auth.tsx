import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Coffee, Leaf, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Sign In State
  const [signInLoading, setSignInLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});

  // Sign Up State
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});

  // Sign In Handlers
  const handleSignInChange = (field: string, value: string | boolean) => {
    setSignInData(prev => ({ ...prev, [field]: value }));
    if (signInErrors[field]) {
      setSignInErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    if (!signInData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signInData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!signInData.password) {
      newErrors.password = "Password is required";
    } else if (signInData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setSignInErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    setSignInLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setSignInLoading(false);
    }
  };

  // Sign Up Handlers
  const handleSignUpChange = (field: string, value: string | boolean) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    if (!signUpData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (signUpData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!signUpData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!signUpData.password) {
      newErrors.password = "Password is required";
    } else if (signUpData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!signUpData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }
    setSignUpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    setSignUpLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Welcome to BrewNear!",
        description: "Your account has been created successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    toast({
      title: `${provider} Sign In`,
      description: "Social authentication would be implemented here.",
    });
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset link would be sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-matcha rounded-2xl flex items-center justify-center shadow-elegant">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BrewNear</h1>
                <p className="text-xs text-muted-foreground">Premium Coffee & Matcha</p>
              </div>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Sign In Form */}
          <Card className="glass-strong backdrop-blur-xl border-border/20 shadow-floating hover:shadow-premium hover:border-primary/30 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="p-8 space-y-8 relative z-10">
              {/* Sign In Header */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-matcha rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <Coffee className="w-8 h-8 text-primary-foreground" />
                    <Leaf className="w-3 h-3 text-primary-foreground/80 absolute -top-1 -right-1" />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <h2 className="text-2xl font-bold text-foreground hover:scale-105 transition-transform duration-300 cursor-default">
                    Welcome Back
                  </h2>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    Sign in to your account
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 hover:text-primary/80 transition-colors duration-200">
                    <Shield className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
                    <span>Secure & encrypted</span>
                  </div>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={signInData.email}
                      onChange={(e) => handleSignInChange("email", e.target.value)}
                      className={`pl-4 pr-4 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signInErrors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signInLoading}
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-matcha opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signInErrors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signInErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => handleSignInChange("password", e.target.value)}
                      className={`pl-4 pr-12 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signInErrors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signInLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/15 hover:scale-110 transition-all duration-200"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      disabled={signInLoading}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </Button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-matcha opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signInErrors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signInErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3 group">
                    <Checkbox
                      id="signin-remember"
                      checked={signInData.rememberMe}
                      onCheckedChange={(checked) => handleSignInChange("rememberMe", checked as boolean)}
                      disabled={signInLoading}
                      className="border-border/60 data-[state=checked]:bg-gradient-matcha data-[state=checked]:border-primary hover:border-primary/50 hover:scale-110 transition-all duration-200"
                    />
                    <Label htmlFor="signin-remember" className="text-sm text-muted-foreground hover:text-foreground group-hover:text-foreground transition-colors cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:text-primary/80 p-0 h-auto font-medium transition-all duration-200 hover:underline"
                    onClick={handleForgotPassword}
                    disabled={signInLoading}
                  >
                    Forgot password?
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-matcha hover:shadow-glow hover:scale-[1.02] transition-all duration-300 text-base font-semibold relative overflow-hidden group"
                    disabled={signInLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {signInLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Signing you in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Social Login */}
              <div className="space-y-4">
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gradient-to-r from-transparent via-border/60 to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground/80 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn("Google")}
                    disabled={signInLoading}
                    className="h-10 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 group text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn("Apple")}
                    disabled={signInLoading}
                    className="h-10 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 group text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Sign Up Form */}
          <Card className="glass-strong backdrop-blur-xl border-border/20 shadow-floating hover:shadow-premium hover:border-primary/30 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-premium opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

            <div className="p-8 space-y-8 relative z-10">
              {/* Sign Up Header */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-coffee rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <User className="w-8 h-8 text-primary-foreground" />
                    <Coffee className="w-3 h-3 text-primary-foreground/80 absolute -top-1 -right-1" />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <h2 className="text-2xl font-bold text-foreground hover:scale-105 transition-transform duration-300 cursor-default">
                    Join BrewNear
                  </h2>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    Create your account today
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 hover:text-primary/80 transition-colors duration-200">
                    <Shield className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
                    <span>Free to join</span>
                  </div>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.name}
                      onChange={(e) => handleSignUpChange("name", e.target.value)}
                      className={`pl-4 pr-4 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signUpErrors.name ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signUpLoading}
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-coffee opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signUpErrors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signUpErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={signUpData.email}
                      onChange={(e) => handleSignUpChange("email", e.target.value)}
                      className={`pl-4 pr-4 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signUpErrors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signUpLoading}
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-coffee opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signUpErrors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signUpErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => handleSignUpChange("password", e.target.value)}
                      className={`pl-4 pr-12 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signUpErrors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signUpLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/15 hover:scale-110 transition-all duration-200"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      disabled={signUpLoading}
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </Button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-coffee opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signUpErrors.password && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signUpErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => handleSignUpChange("confirmPassword", e.target.value)}
                      className={`pl-4 pr-12 h-12 glass-card border-border/50 focus:border-primary/70 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base placeholder:text-muted-foreground/60 hover:border-primary/50 hover:shadow-soft hover:scale-[1.01] ${
                        signUpErrors.confirmPassword ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                      disabled={signUpLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/15 hover:scale-110 transition-all duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={signUpLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </Button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-coffee opacity-0 group-hover:opacity-3 group-focus-within:opacity-8 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {signUpErrors.confirmPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signUpErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 group">
                    <Checkbox
                      id="signup-terms"
                      checked={signUpData.acceptTerms}
                      onCheckedChange={(checked) => handleSignUpChange("acceptTerms", checked as boolean)}
                      disabled={signUpLoading}
                      className="border-border/60 data-[state=checked]:bg-gradient-coffee data-[state=checked]:border-primary hover:border-primary/50 hover:scale-110 transition-all duration-200 mt-1"
                    />
                    <Label htmlFor="signup-terms" className="text-sm text-muted-foreground hover:text-foreground group-hover:text-foreground transition-colors cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:text-primary/80 font-medium underline underline-offset-2">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {signUpErrors.acceptTerms && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {signUpErrors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-coffee hover:shadow-glow hover:scale-[1.02] transition-all duration-300 text-base font-semibold relative overflow-hidden group"
                    disabled={signUpLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {signUpLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Social Login */}
              <div className="space-y-4">
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gradient-to-r from-transparent via-border/60 to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground/80 font-medium">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn("Google")}
                    disabled={signUpLoading}
                    className="h-10 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 group text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn("Apple")}
                    disabled={signUpLoading}
                    className="h-10 glass-card border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 group text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
