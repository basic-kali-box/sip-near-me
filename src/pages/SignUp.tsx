import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Coffee, Leaf, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { ButtonLoading } from "@/components/LoadingSpinner";
import { SEO, SEO_CONFIGS } from "@/components/SEO";


const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { register, loginWithGoogle } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get initial user type from location state or URL params
  const getInitialUserType = (): "buyer" | "seller" => {
    // Check location state first (from navigation)
    if (location.state?.userType) {
      return location.state.userType;
    }

    // Check URL search params as fallback
    const urlParams = new URLSearchParams(location.search);
    const userTypeParam = urlParams.get('userType');
    if (userTypeParam === 'seller' || userTypeParam === 'buyer') {
      return userTypeParam;
    }

    // Default to buyer
    return "buyer";
  };

  // Get returnTo parameter from URL
  const urlParams = new URLSearchParams(location.search);
  const returnTo = urlParams.get('returnTo');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: getInitialUserType(),
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effect to handle pre-selection and show toast for seller signup
  useEffect(() => {
    const initialUserType = getInitialUserType();
    if (initialUserType === "seller" && location.state?.source === "landing_become_seller") {
      toast({
        title: "Welcome Future Seller!",
        description: "You're signing up to become a seller. Complete the form to start your journey.",
      });
    }
  }, [location.state, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      // SECURITY FIX: Enhanced password validation
      const password = formData.password;
      const errors = [];

      if (password.length < 12) {
        errors.push("at least 12 characters");
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push("a lowercase letter");
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("an uppercase letter");
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push("a number");
      }
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        errors.push("a special character");
      }

      // Check for common weak passwords
      const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'shadow', 'football', 'baseball'
      ];

      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push("avoid common passwords");
      }

      // Check for repeated characters
      if (/(.)\1{2,}/.test(password)) {
        errors.push("avoid repeated characters");
      }

      if (errors.length > 0) {
        newErrors.password = `Password must contain ${errors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        userType: formData.userType
      }, formData.password);

      if (success) {
        // Store returnTo parameter if provided
        if (returnTo) {
          localStorage.setItem('auth_returnTo', returnTo);
        }

        toast({
          title: "Account created successfully!",
          description: "You can now sign in with your credentials.",
        });

        // Redirect directly to signin page with email pre-filled
        navigate(`/signin?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast({
          title: "Registration failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      let title = "Registration failed";
      let description = "Please try again later.";

      if (error.message?.includes('rate_limit') || error.message?.includes('over_email_send_rate_limit')) {
        title = "Too many attempts";
        description = "Please wait a moment, or try signing in if you already have an account.";
      } else if (error.message?.includes('User already registered') || error.message?.includes('Account already exists')) {
        title = "Account exists";
        description = "An account with this email already exists. Try signing in instead.";
      } else if (error.message?.includes('Database error') || error.message?.includes('saving new user')) {
        title = "Registration issue";
        description = "There was a problem creating your account. Please try signing in if you already have an account.";
      } else if (error.message?.includes('Registration failed')) {
        title = "Registration failed";
        description = error.message;
      } else if (error.message) {
        description = error.message;
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    if (provider !== "Google") {
      toast({ title: `${provider} Sign Up`, description: "This provider is not yet enabled." });
      return;
    }

    setIsLoading(true);
    try {
      // Store the user type for the OAuth callback
      localStorage.setItem('pending_oauth_userType', formData.userType);

      // Use the proper Google OAuth method from context
      await loginWithGoogle();
      // The redirect will handle the rest
    } catch (error: any) {
      console.error('Google sign up error:', error);

      let errorMessage = "Please try again or use email/password.";

      if (error.message?.includes('provider is not enabled')) {
        errorMessage = "Google sign-up is not configured. Please contact support or try email sign-up.";
      } else if (error.message?.includes('validation_failed')) {
        errorMessage = "Google authentication is not properly set up. Please try email sign-up.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Google sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO {...SEO_CONFIGS.signup} />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => navigate('/')}
          >
            <Coffee className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Machroub</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md glass-strong backdrop-blur-xl border-border/20 shadow-premium">
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-matcha rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Join Sip Near Me</h2>
              <p className="text-muted-foreground">
                Create your account to discover amazing drinks
              </p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp("Google")}
                disabled={isLoading}
                className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignUp("Apple")}
                disabled={isLoading}
                className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 glass-card border-border/50 focus:border-primary/50 transition-all duration-300 ${
                      errors.name ? "border-destructive focus:border-destructive" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    aria-invalid={!!errors.name}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* User Type Selection */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-medium">
                  I want to
                  {location.state?.source === "landing_become_seller" && (
                    <span className="ml-2 text-xs text-primary font-normal">(Pre-selected as Seller)</span>
                  )}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Button
                    type="button"
                    variant={formData.userType === 'buyer' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('userType', 'buyer')}
                    className={`justify-start min-h-[56px] sm:min-h-[52px] h-auto py-4 sm:py-3 px-4 sm:px-5 transition-all duration-300 touch-manipulation ${
                      formData.userType === 'buyer'
                        ? 'bg-gradient-coffee shadow-glow hover:scale-105 active:scale-[0.98] ring-2 ring-coffee-200'
                        : 'hover:bg-primary/10 hover:border-primary/50 hover:scale-105 active:scale-[0.98] focus:ring-2 focus:ring-coffee-200'
                    }`}
                    disabled={isLoading}
                    aria-label="Sign up as a buyer to discover and order drinks"
                  >
                    <Coffee className="w-6 h-6 sm:w-5 sm:h-5 mr-3 sm:mr-4 flex-shrink-0" />
                    <span className="text-base sm:text-sm font-semibold sm:font-medium">Buy Drinks</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.userType === 'seller' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('userType', 'seller')}
                    className={`justify-start min-h-[56px] sm:min-h-[52px] h-auto py-4 sm:py-3 px-4 sm:px-5 transition-all duration-300 touch-manipulation ${
                      formData.userType === 'seller'
                        ? 'bg-gradient-matcha shadow-glow hover:scale-105 active:scale-[0.98] ring-2 ring-matcha-200'
                        : 'hover:bg-primary/10 hover:border-primary/50 hover:scale-105 active:scale-[0.98] focus:ring-2 focus:ring-matcha-200'
                    }`}
                    disabled={isLoading}
                    aria-label="Sign up as a seller to start selling drinks"
                  >
                    <Leaf className="w-6 h-6 sm:w-5 sm:h-5 mr-3 sm:mr-4 flex-shrink-0" />
                    <span className="text-base sm:text-sm font-semibold sm:font-medium">Sell Drinks</span>
                  </Button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 glass-card border-border/50 focus:border-primary/50 transition-all duration-300 ${
                      errors.email ? "border-destructive focus:border-destructive" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 glass-card border-border/50 focus:border-primary/50 transition-all duration-300 ${
                      errors.password ? "border-destructive focus:border-destructive" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={!!errors.password}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 glass-card border-border/50 focus:border-primary/50 transition-all duration-300 ${
                      errors.confirmPassword ? "border-destructive focus:border-destructive" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    aria-invalid={!!errors.confirmPassword}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p id="terms-error" className="text-sm text-destructive" role="alert">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-matcha hover:shadow-glow transition-all duration-300"
                size="lg"
                disabled={isLoading}
                aria-label={isLoading ? "Creating your account, please wait" : `Create ${formData.userType} account`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <ButtonLoading />
                    Creating account...
                  </div>
                ) : (
                  `Create ${formData.userType === 'seller' ? 'Seller' : 'Buyer'} Account`
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </>
  );
};

export default SignUp;
