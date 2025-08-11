import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";
import { initGA, trackPageView, initScrollTracking, trackWebVitals } from "@/utils/analytics";
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
import { Home, Plus, LayoutDashboard, ShoppingBag, User as UserIcon, Settings as SettingsIcon, HelpCircle, Droplets, LogOut } from "lucide-react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import EmailConfirmation from "./pages/EmailConfirmation";
import CompleteProfile from "./pages/CompleteProfile";
import AddListing from "./pages/AddListing";
import SellerDetails from "./pages/SellerDetails";
import SellerDashboard from "./pages/SellerDashboard";
import OrderFlow from "./pages/OrderFlow";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/Settings";
import Help from "./pages/Help";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LocationPickerDemo from "./pages/LocationPickerDemo";
import DebugData from "./pages/DebugData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function SidebarNavContent() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { user, isAuthenticated, logout } = useUser()
  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      if (isMobile) setOpenMobile(false)
      // Redirect will be handled by the logout function
    } catch (error) {
      console.error('Signout error:', error)
    }
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary">
            <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">BrewNear</span>
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
                <Link to="/orders">
                  <ShoppingBag />
                  <span>Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
        <div className="px-2 text-xs text-muted-foreground">v1.0 • 12rem compact</div>
      </SidebarFooter>
    </>
  )
}

const App = () => {
  // Initialize analytics on app load
  useEffect(() => {
    initGA();
    trackWebVitals();
    initScrollTracking();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                      <ProtectedRoute requireAuth={true} showLoginPrompt={true}>
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
                    <Route path="/seller/:id" element={<SellerDetails />} />
                    <Route path="/seller-dashboard" element={
                      <ProtectedRoute requireAuth={true} requireUserType="seller">
                        <SellerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/order/:sellerId" element={
                      <ProtectedRoute requireAuth={true}>
                        <OrderFlow />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth={true}>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute requireAuth={true}>
                        <OrderHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/location-demo" element={<LocationPickerDemo />} />
                    <Route path="/debug-data" element={<DebugData />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </SidebarProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
