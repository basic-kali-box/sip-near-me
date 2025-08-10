import React, { useState } from 'react';
import { LogOut, User, Settings, ChevronDown, Coffee, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserMenuProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ variant = 'desktop', className = '' }) => {
  const { user, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🔄 UserMenu: Starting sign out process...');
      
      await logout();
      
      console.log('✅ UserMenu: Sign out successful');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out. See you next time!",
      });

      // Redirect to landing page
      navigate('/landing', { replace: true });
      
    } catch (error: any) {
      console.error('❌ UserMenu: Sign out error:', error);
      
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  if (variant === 'mobile') {
    // Mobile version - simpler layout for mobile menus
    return (
      <div className={`space-y-3 ${className}`}>
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.profileImage} />
            <AvatarFallback className="bg-gradient-to-br from-coffee-500 to-matcha-500 text-white text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${user.userType === 'seller' ? 'bg-matcha-500' : 'bg-coffee-500'}`} />
              <span className="text-xs text-muted-foreground capitalize">{user.userType}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="w-full justify-start py-3 font-medium hover:bg-primary/10 transition-all duration-300"
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
          
          {user.userType === 'seller' && (
            <Button
              variant="ghost"
              onClick={() => navigate('/seller-dashboard')}
              className="w-full justify-start py-3 font-medium hover:bg-primary/10 transition-all duration-300"
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="w-full justify-start py-3 font-medium hover:bg-primary/10 transition-all duration-300"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full justify-start py-3 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    );
  }

  // Desktop version - dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 hover:bg-primary/10 transition-all duration-300 ${className}`}>
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.profileImage} />
            <AvatarFallback className="bg-gradient-to-br from-coffee-500 to-matcha-500 text-white text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-coffee-500 to-matcha-500 text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${user.userType === 'seller' ? 'bg-matcha-500' : 'bg-coffee-500'}`} />
                <span className="text-xs text-muted-foreground capitalize">{user.userType}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        {user.userType === 'seller' && (
          <DropdownMenuItem onClick={() => navigate('/seller-dashboard')} className="cursor-pointer">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut} 
          disabled={isLoggingOut}
          className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
