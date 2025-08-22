import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";
import { initGA, trackPageView, initScrollTracking, trackWebVitals } from "@/utils/analytics";
import { Analytics } from "@vercel/analytics/react";
// Initialize i18n
import "./i18n";
// SECURITY FIX: Only import debug utilities in development
if (import.meta.env.DEV) {
  import("@/utils/authDebug");
  import("@/utils/testSellerValidation");
}
import { checkDomainRedirect } from "@/utils/authDebug";
import { checkAndHandleOAuthTokens } from "@/utils/oauthHandler";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Plus, LayoutDashboard, ShoppingBag, User as UserIcon, Settings as SettingsIcon, HelpCircle, Droplets, LogOut, Coffee, Leaf, ArrowRightLeft, Store } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import EmailConfirmation from "./pages/EmailConfirmation";
import CompleteProfile from "./pages/CompleteProfile";
import AddListing from "./pages/AddListing";
import EditListing from "./pages/EditListing";
import SellerDetails from "./pages/SellerDetails";
import SellerDashboard from "./pages/SellerDashboard";

import ItemDetail from "./pages/ItemDetail";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/Settings";
import Help from "./pages/Help";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LocationPickerDemo from "./pages/LocationPickerDemo";
import ItemCardDemo from "./pages/ItemCardDemo";
import ImageUploadDebug from "./pages/ImageUploadDebug";
import DebugData from "./pages/DebugData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function SidebarNavContent() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { user, isAuthenticated, logout, switchUserType } = useUser()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      if (isMobile) setOpenMobile(false)
      // Navigation is now handled by the logout function in UserContext
    } catch (error) {
      console.error('Signout error:', error)
    }
  }

  const handleSwitchUserType = async () => {
    if (!user) return

    try {
      const newUserType = user.userType === 'buyer' ? 'seller' : 'buyer'
      await switchUserType(newUserType)

      if (isMobile) setOpenMobile(false)

      toast({
        title: `Switched to ${newUserType}`,
        description: `You are now a ${newUserType}. ${newUserType === 'seller' ? 'Complete your seller profile to start selling.' : 'You can now browse and order drinks.'}`,
      })

      // Navigate to appropriate page
      if (newUserType === 'seller') {
        navigate('/seller-dashboard')
      } else {
        navigate('/app')
      }
    } catch (error: any) {
      toast({
        title: "Failed to switch user type",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <SidebarHeader>
        <div
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors duration-200"
          onClick={() => {
            if (isAuthenticated) {
              navigate('/app');
            } else {
              navigate('/signin');
            }
            if (isMobile) setOpenMobile(false);
          }}
        >
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary">
            <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Machroub</span>
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupLabel>Browse</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={handleNavigate}>
                <Link to="/">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Only show Sell section for authenticated sellers */}
      {isAuthenticated && user?.userType === 'seller' && (
        <SidebarGroup>
          <SidebarGroupLabel>Sell</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavigate}>
                  <Link to="/add-listing">
                    <Plus />
                    <span>Add Listing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavigate}>
                  <Link to="/seller-dashboard">
                    <LayoutDashboard />
                    <span>Seller Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>

            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={handleNavigate}>
                <Link to="/profile">
                  <UserIcon />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={handleNavigate}>
                <Link to="/settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={handleNavigate}>
                <Link to="/help">
                  <HelpCircle />
                  <span>Help</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAuthenticated && user && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSwitchUserType}
                  className="group relative overflow-hidden bg-gradient-to-r from-transparent via-primary/5 to-transparent hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-md py-3 my-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center w-full">
                    <div className={`p-1.5 rounded-md mr-3 transition-all duration-300 ${
                      user.userType === 'buyer'
                        ? 'bg-green-100 text-green-700 group-hover:bg-green-200'
                        : 'bg-amber-100 text-amber-700 group-hover:bg-amber-200'
                    }`}>
                      {user.userType === 'buyer' ? (
                        <Store className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">
                        {user.userType === 'buyer' ? 'Switch to Seller' : 'Switch to Buyer'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.userType === 'buyer' ? 'Start selling' : 'Browse drinks'}
                      </div>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {isAuthenticated && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="text-xs text-muted-foreground">v1.0</div>
          <LanguageSwitcher variant="ghost" size="sm" />
        </div>
      </SidebarFooter>
    </>
  )
}

const App = () => {
  // Initialize analytics on app load
  useEffect(() => {
    // Check for domain redirect issues first
    if (checkDomainRedirect()) {
      return; // Redirect is happening, don't initialize other stuff
    }

    // Check for OAuth tokens in URL and handle them
    checkAndHandleOAuthTokens().then((handled) => {
      if (handled) {
        console.log('🔄 OAuth tokens handled, redirect in progress...');
        return; // OAuth redirect is happening
      }

      // Continue with normal initialization
      initGA();
      trackWebVitals();
      initScrollTracking();
    }).catch((error) => {
      console.error('❌ Error handling OAuth tokens:', error);
      // Continue with normal initialization even if OAuth handling fails
      initGA();
      trackWebVitals();
      initScrollTracking();
    });

    // Global error handlers for unhandled errors
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      console.error('Rejection details:', {
        reason: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <UserProvider>
                <Toaster />
                <Sonner />
                <Analytics />
                <ErrorBoundary>
                  <SidebarProvider defaultOpen={false}>
                    <Sidebar collapsible="offcanvas">
                      <SidebarContent>
                        <SidebarNavContent />
                      </SidebarContent>
                    </Sidebar>
                    <SidebarInset>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/landing" element={<Landing />} />
                        <Route path="/app" element={
                          <ProtectedRoute requireAuth={true} showLoginPrompt={false} fallbackPath="/signin">
                            <Index />
                          </ProtectedRoute>
                        } />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/email-confirmation" element={<EmailConfirmation />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/add-listing" element={
                          <ProtectedRoute requireAuth={true} requireUserType="seller">
                            <AddListing />
                          </ProtectedRoute>
                        } />
                        <Route path="/edit-listing/:itemId" element={
                          <ProtectedRoute requireAuth={true} requireUserType="seller">
                            <EditListing />
                          </ProtectedRoute>
                        } />
                        <Route path="/seller/:id" element={<SellerDetails />} />
                        <Route path="/item/:itemId" element={<ItemDetail />} />
                        <Route path="/seller-dashboard" element={
                          <ProtectedRoute requireAuth={true} requireUserType="seller">
                            <SellerDashboard />
                          </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                          <ProtectedRoute requireAuth={true}>
                            <Profile />
                          </ProtectedRoute>
                        } />

                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />

                        {/* SECURITY FIX: Only show debug routes in development */}
                        {import.meta.env.DEV && (
                          <>
                            <Route path="/location-demo" element={<LocationPickerDemo />} />
                            <Route path="/itemcard-demo" element={<ItemCardDemo />} />
                            <Route path="/image-debug" element={<ImageUploadDebug />} />
                            <Route path="/debug-data" element={<DebugData />} />
                          </>
                        )}
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </SidebarInset>
                  </SidebarProvider>
                </ErrorBoundary>
              </UserProvider>
            </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
