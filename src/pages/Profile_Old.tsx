import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Settings, Heart, ShoppingBag, Coffee, Leaf, Plus, LayoutDashboard, Star, Save, X, Camera, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/userService";
import { SellerService } from "@/services/sellerService";
import { BuyerService } from "@/services/buyerService";
import { AddressInput } from "@/components/AddressInput";
import { BusinessHoursInput } from "@/components/BusinessHoursInput";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";

import { type Coordinates } from "@/utils/geocoding";

// Types
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: Coordinates | null;
  avatar: string;
  memberSince: string;
  businessName: string;
  businessHours: string;
  specialty: "coffee" | "matcha" | "both";
  description: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
}

interface BuyerStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCount: number;
  reviewCount: number;
}

interface SellerStats {
  profileViews: number;
  contactRequests: number;
  totalOrders: number;
  revenue: number;
  averageRating: number;
  menuItems: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useUser();

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [sellerProfileExists, setSellerProfileExists] = useState<boolean | null>(null);

  // Profile Data
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    coordinates: null,
    avatar: "",
    memberSince: "",
    businessName: "",
    businessHours: "",
    specialty: "coffee",
    description: "",
    isAvailable: false,
    rating: 0,
    reviewCount: 0
  });

  // Analytics Data
  const [buyerStats, setBuyerStats] = useState<BuyerStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCount: 0,
    reviewCount: 0
  });

  const [sellerStats, setSellerStats] = useState<SellerStats>({
    profileViews: 0,
    contactRequests: 0,
    totalOrders: 0,
    revenue: 0,
    averageRating: 0,
    menuItems: 0
  });

  // Initialize profile with user data
  const initializeProfile = useCallback((userData: typeof user): ProfileData => {
    return {
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.userType === 'seller' ? (userData.businessAddress || "") : "",
      coordinates: null,
      avatar: userData?.profileImage || "",
      memberSince: userData?.id ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
      businessName: userData?.userType === 'seller' ? (userData.businessName || "") : "",
      businessHours: userData?.userType === 'seller' ? (userData.businessHours || "") : "",
      specialty: userData?.userType === 'seller' ? ((userData.specialty as any) || "coffee") : "coffee",
      description: "",
      isAvailable: userData?.userType === 'seller' ? (userData.isOnline || false) : false,
      rating: userData?.userType === 'seller' ? (userData.rating || 0) : 0,
      reviewCount: userData?.userType === 'seller' ? (userData.reviewCount || 0) : 0
    };
  }, []);

  // Load seller analytics
  const loadSellerAnalytics = useCallback(async (sellerId: string) => {
    setLoadingAnalytics(true);
    try {
      const analytics = await SellerService.getSellerAnalytics(sellerId);

      // Get menu items count
      const { data: menuItems } = await supabase
        .from('drinks')
        .select('id')
        .eq('seller_id', sellerId);

      setSellerStats({
        profileViews: analytics.profileViews,
        contactRequests: analytics.contactRequests,
        totalOrders: analytics.totalOrders,
        revenue: analytics.revenue,
        averageRating: analytics.averageRating,
        menuItems: menuItems?.length || 0
      });
    } catch (analyticsError) {
      console.warn('Failed to load seller analytics:', analyticsError);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Load seller profile data
  const loadSellerProfile = useCallback(async (userId: string) => {
    try {
      const sellerDetails = await SellerService.getSellerById(userId);
      console.log('🔍 Seller details from database:', sellerDetails);

      if (sellerDetails) {
        setSellerProfileExists(true);
        console.log('🔍 Seller details breakdown:', {
          business_name: sellerDetails.business_name,
          address: sellerDetails.address,
          hours: sellerDetails.hours,
          phone: sellerDetails.phone
        });

        // Update profile with seller details
        setProfile(prevProfile => {
          const updatedProfile = {
            ...prevProfile,
            businessName: sellerDetails.business_name || prevProfile.businessName,
            address: sellerDetails.address || prevProfile.address,
            businessHours: sellerDetails.hours || prevProfile.businessHours,
            specialty: sellerDetails.specialty || prevProfile.specialty,
            description: sellerDetails.description || "",
            isAvailable: sellerDetails.is_available || false,
            rating: sellerDetails.rating_average || 0,
            reviewCount: sellerDetails.rating_count || 0,
            phone: sellerDetails.phone || prevProfile.phone,
            avatar: sellerDetails.photo_url || prevProfile.avatar,
            coordinates: sellerDetails.latitude && sellerDetails.longitude ? {
              latitude: parseFloat(String(sellerDetails.latitude)),
              longitude: parseFloat(String(sellerDetails.longitude))
            } : prevProfile.coordinates
          };

          console.log('✅ Profile updated with seller details:', {
            businessName: updatedProfile.businessName,
            address: updatedProfile.address,
            businessHours: updatedProfile.businessHours,
            phone: updatedProfile.phone
          });

          return updatedProfile;
        });

        // Load seller analytics
        await loadSellerAnalytics(userId);
      } else {
        setSellerProfileExists(false);
        console.warn('⚠️ No seller details found in database for user:', userId);
      }
    } catch (error) {
      console.warn('Failed to load seller details:', error);
      setSellerProfileExists(false);
    }
  }, [loadSellerAnalytics]);

  // Load buyer profile data
  const loadBuyerProfile = useCallback(async (userId: string) => {
    try {
      const buyerProfile = await BuyerService.getBuyerProfile(userId);
      if (buyerProfile) {
        setBuyerStats({
          totalOrders: buyerProfile.stats.totalOrders || 0,
          totalSpent: buyerProfile.stats.totalSpent || 0,
          favoriteCount: 0, // Will be implemented later
          reviewCount: buyerProfile.stats.reviewCount || 0
        });
        setProfile(prevProfile => ({
          ...prevProfile,
          name: buyerProfile.user.name || prevProfile.name,
          email: buyerProfile.user.email || prevProfile.email,
          phone: buyerProfile.user.phone || prevProfile.phone,
          avatar: buyerProfile.user.avatar_url || prevProfile.avatar
        }));
      }
    } catch (error) {
      console.warn('Failed to load buyer details:', error);
    }
  }, []);

  // Load user data and seller/buyer details on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      // Initialize profile with user data
      const initialProfile = initializeProfile(user);
      setProfile(initialProfile);
      console.log('🔍 Initial profile state:', {
        businessName: initialProfile.businessName,
        address: initialProfile.address,
        businessHours: initialProfile.businessHours,
        phone: initialProfile.phone,
        userBusinessHours: user.businessHours
      });

        // Fetch user creation date from database
        try {
          const userDetails = await UserService.getUserProfileById(user.id);
          if (userDetails?.created_at) {
            setProfile(prev => ({
              ...prev,
              memberSince: new Date(userDetails.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })
            }));
          }
        } catch (error) {
          console.warn('Failed to load user creation date:', error);
        }

        // Load user-type specific data
        if (user.userType === 'seller') {
          try {
            console.log('🔍 Fetching seller details for user ID:', user.id);
            const sellerDetails = await SellerService.getSellerById(user.id);
            console.log('🔍 Seller details from database:', sellerDetails);
            if (sellerDetails) {
              console.log('🔍 Seller details breakdown:', {
                business_name: sellerDetails.business_name,
                address: sellerDetails.address,
                hours: sellerDetails.hours,
                phone: sellerDetails.phone
              });
            }
            if (sellerDetails) {
              setSellerProfileExists(true);
              console.log('🔍 Loading seller details - hours from DB:', sellerDetails.hours);
              console.log('🔍 Previous profile state:', {
                businessName: prev.businessName,
                address: prev.address,
                businessHours: prev.businessHours,
                phone: prev.phone
              });
              const updatedProfile = {
                ...prev,
                businessName: sellerDetails.business_name || user.businessName || "",
                address: sellerDetails.address || prev.address,
                businessHours: sellerDetails.hours || prev.businessHours,
                specialty: sellerDetails.specialty || prev.specialty,
                description: sellerDetails.description || "",
                isAvailable: sellerDetails.is_available || false,
                rating: sellerDetails.rating_average || 0,
                reviewCount: sellerDetails.rating_count || 0,
                phone: sellerDetails.phone || prev.phone,
                avatar: sellerDetails.photo_url || prev.avatar // Load seller photo from sellers table
              };
              console.log('🔍 Updated profile being set:', {
                businessName: updatedProfile.businessName,
                address: updatedProfile.address,
                businessHours: updatedProfile.businessHours,
                phone: updatedProfile.phone
              });
              setProfile(prevProfile => {
                const newProfile = {
                  ...prevProfile,
                  businessName: sellerDetails.business_name || prevProfile.businessName,
                  address: sellerDetails.address || prevProfile.address,
                  businessHours: sellerDetails.hours || prevProfile.businessHours,
                  specialty: sellerDetails.specialty || prevProfile.specialty,
                  description: sellerDetails.description || "",
                  isAvailable: sellerDetails.is_available || false,
                  rating: sellerDetails.rating_average || 0,
                  reviewCount: sellerDetails.rating_count || 0,
                  phone: sellerDetails.phone || prevProfile.phone,
                  avatar: sellerDetails.photo_url || prevProfile.avatar,
                  coordinates: sellerDetails.latitude && sellerDetails.longitude ? {
                    latitude: parseFloat(sellerDetails.latitude),
                    longitude: parseFloat(sellerDetails.longitude)
                  } : prevProfile.coordinates
                };
                console.log('🔍 Final profile state after functional update:', {
                  businessName: newProfile.businessName,
                  address: newProfile.address,
                  businessHours: newProfile.businessHours,
                  phone: newProfile.phone
                });
                return newProfile;
              });
              console.log('✅ Profile updated with business hours:', updatedProfile.businessHours);
              console.log('🔍 Full profile state after update:', {
                businessName: updatedProfile.businessName,
                address: updatedProfile.address,
                businessHours: updatedProfile.businessHours,
                phone: updatedProfile.phone
              });

              // Load seller analytics
              await loadSellerAnalytics(user.id);
            } else {
              setSellerProfileExists(false);
              console.warn('⚠️ No seller details found in database for user:', user.id);
              console.log('🔍 This might indicate the seller profile was not created properly');
            }
          } catch (error) {
            console.warn('Failed to load seller details:', error);
          }
        } else if (user.userType === 'buyer') {
          try {
            const buyerProfile = await BuyerService.getBuyerProfile(user.id);
            if (buyerProfile) {
              setBuyerStats(buyerProfile.stats);
              // Update profile with any additional buyer data
              setProfile(prev => ({
                ...prev,
                name: buyerProfile.user.name || prev.name,
                email: buyerProfile.user.email || prev.email,
                phone: buyerProfile.user.phone || prev.phone,
                avatar: buyerProfile.user.avatar_url || prev.avatar
              }));
            }
          } catch (error) {
            console.warn('Failed to load buyer details:', error);
          }
        }
      }

      // Mark profile data as loaded
      setProfileDataLoaded(true);
    };

    loadProfileData();
  }, [user]);

  // Check if seller profile is complete
  const isSellerProfileComplete = () => {
    if (user?.userType !== 'seller') return true;
    const isComplete = !!(
      profile.businessName &&
      profile.businessName.trim() &&
      profile.address &&
      profile.address.trim() &&
      profile.businessHours &&
      profile.businessHours.trim() &&
      profile.businessHours !== 'null' && // Handle string 'null'
      profile.phone &&
      profile.phone.trim()
    );
    if (!isComplete) {
      console.log('🔍 Profile completeness check failed:', {
        businessName: !!profile.businessName?.trim(),
        address: !!profile.address?.trim(),
        businessHours: !!profile.businessHours?.trim(),
        businessHoursValue: profile.businessHours,
        phone: !!profile.phone?.trim(),
        profileDataLoaded,
        sellerProfileExists
      });
    }
    return isComplete;
  };

  // Get missing information for incomplete profiles
  const getMissingInfo = () => {
    if (user?.userType !== 'seller') return [];
    const missing = [];
    if (!profile.businessName || !profile.businessName.trim()) missing.push('Business name');
    if (!profile.address || !profile.address.trim()) missing.push('Business address');
    if (!profile.businessHours || !profile.businessHours.trim() || profile.businessHours === 'null') {
      console.log('🔍 Business hours missing check:', {
        businessHours: profile.businessHours,
        businessHoursTrimmed: profile.businessHours?.trim(),
        isNull: profile.businessHours === 'null',
        profileDataLoaded,
        userBusinessHours: user?.businessHours
      });
      missing.push('Business hours');
    }
    if (!profile.phone || !profile.phone.trim()) missing.push('Phone number');
    return missing;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate phone number if provided
    if (profile.phone.trim()) {
      const cleanPhone = profile.phone.replace(/[\s\-\(\)\+]/g, '');
      if (!/^\d{10,14}$/.test(cleanPhone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be 10-14 digits",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (user.userType === 'buyer') {
        // For buyers, update user profile directly
        await BuyerService.updateBuyerProfile(user.id, {
          name: profile.name,
          phone: profile.phone,
          avatar_url: profile.avatar
        });

        // Also update the user context
        await updateUser({
          name: profile.name,
          phone: profile.phone,
          profileImage: profile.avatar
        });
      } else {
        // For sellers, update both user profile and seller-specific fields
        await updateUser({
          name: profile.name,
          phone: profile.phone,
          profileImage: profile.avatar
        });

        console.log('💾 Saving business hours:', profile.businessHours);
        await SellerService.updateSellerProfile(user.id, {
          name: profile.name, // Use the person's actual name, not business name
          business_name: profile.businessName,
          address: profile.address,
          latitude: profile.coordinates?.latitude,
          longitude: profile.coordinates?.longitude,
          hours: profile.businessHours,
          specialty: profile.specialty,
          phone: profile.phone,
          description: profile.description
        });
        console.log('✅ Business hours saved successfully');
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || user.userType !== 'seller') return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const photoUrl = await SellerService.uploadSellerPhoto(user.id, file);

      // Add cache-busting parameter to ensure fresh image load
      const cacheBustedUrl = `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;

      // Update local state immediately
      setProfile(prev => ({
        ...prev,
        avatar: cacheBustedUrl
      }));

      // Update user context with the new photo URL
      await updateUser({
        profileImage: cacheBustedUrl,
        photo_url: cacheBustedUrl // Also update photo_url field
      });

      toast({
        title: "Photo uploaded",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Show loading if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const stats = user.userType === 'seller' ? [
    { label: "Profile Views", value: sellerStats.profileViews.toString(), icon: User },
    { label: "Contact Requests", value: sellerStats.contactRequests.toString(), icon: Phone },
    { label: "Menu Items", value: sellerStats.menuItems.toString(), icon: Coffee },
  ] : [
    { label: "Orders Placed", value: (buyerStats?.totalOrders || 0).toString(), icon: ShoppingBag },
    { label: "Favorites", value: (buyerStats?.favoriteCount || 0).toString(), icon: Heart },
    { label: "Reviews", value: (buyerStats?.reviewCount || 0).toString(), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher
              variant="ghost"
              size="sm"
              showText={false}
            />
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            <UserMenu variant="desktop" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Profile Incomplete Alert */}
        {user?.userType === 'seller' && profileDataLoaded && (sellerProfileExists === false || !isSellerProfileComplete()) && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Seller Profile</h3>
                <p className="text-yellow-700 text-sm mb-3">
                  Your profile is missing some important information. Complete it to start appearing in search results and accepting orders.
                </p>
                <div className="text-xs text-yellow-600 mb-3">
                  <strong>Missing:</strong> {sellerProfileExists === false ? 'Complete seller profile setup' : getMissingInfo().join(', ')}
                </div>
                <Button
                  onClick={() => navigate('/complete-profile')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  Complete Profile Now
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Header */}
        <Card className="p-8 bg-gradient-to-r from-matcha-50 to-coffee-50 border-0 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl" key={profile.avatar}>
                <AvatarImage src={profile.avatar} key={profile.avatar} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-matcha-600 to-coffee-600 text-white">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Photo upload button for sellers */}
              {user?.userType === 'seller' && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </label>
                </>
              )}

              {user?.userType === 'seller' && (
                <div className="absolute -bottom-2 -right-2 bg-matcha-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  <Coffee className="w-3 h-3 inline mr-1" />
                  Seller
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.name || 'User'}</h2>
              <p className="text-gray-600 text-lg mb-4">{profile.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full">
                  <User className="w-4 h-4 text-matcha-600" />
                  <span className="text-gray-700">Member since {profile.memberSince}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Verified User</span>
                </div>
                {user?.userType === 'seller' && profile.rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-gray-700">{profile.rating.toFixed(1)} ({profile.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {user?.userType === 'seller' && loadingAnalytics ? '...' : stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Profile Information */}
        <Card className="p-8 shadow-lg border-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-matcha-500 to-matcha-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-12 border-gray-300 focus:border-matcha-500 focus:ring-matcha-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <User className="w-5 h-5 text-matcha-600" />
                  <span className="text-gray-800 font-medium">{profile.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <Mail className="w-5 h-5 text-matcha-600" />
                <span className="text-gray-800 font-medium">{profile.email}</span>
                <span className="text-xs text-gray-500 ml-auto">Cannot be changed</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            {/* Business Address - Only for sellers */}
            {user?.userType === 'seller' && (
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                {isEditing ? (
                  <AddressInput
                    value={profile.address}
                    coordinates={profile.coordinates}
                    onChange={(address, coordinates) => {
                      setProfile(prev => ({
                        ...prev,
                        address,
                        coordinates: coordinates || null
                      }));
                    }}
                    placeholder="Enter your business address"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.address || "No address set"}</span>
                  </div>
                )}
              </div>
            )}

            {/* Seller-specific fields */}
            {user.userType === 'seller' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  {isEditing ? (
                    <Input
                      id="businessName"
                      value={profile.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Enter your business name (e.g., Café Central, Bean & Brew)"
                    />
                  ) : (
                    <div className={`flex items-center gap-2 p-2 rounded-md ${
                      profile.businessName
                        ? 'bg-muted/50'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <Coffee className={`w-4 h-4 ${
                        profile.businessName
                          ? 'text-muted-foreground'
                          : 'text-yellow-600'
                      }`} />
                      <span className={profile.businessName ? '' : 'text-yellow-800 font-medium'}>
                        {profile.businessName || "⚠️ Business name required"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours</Label>
                  {isEditing ? (
                    <BusinessHoursInput
                      value={profile.businessHours}
                      onChange={(value) => handleInputChange("businessHours", value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.businessHours || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  {isEditing ? (
                    <select
                      id="specialty"
                      value={profile.specialty}
                      onChange={(e) => handleInputChange("specialty", e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="coffee">Coffee</option>
                      <option value="matcha">Matcha</option>
                      <option value="both">Both</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      {profile.specialty === 'matcha' ? (
                        <Leaf className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{profile.specialty}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  {isEditing ? (
                    <textarea
                      id="description"
                      value={profile.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Tell customers about your business..."
                      className="w-full p-2 border border-input rounded-md bg-background min-h-[80px] resize-none"
                    />
                  ) : (
                    <div className="p-2 rounded-md bg-muted/50 min-h-[60px]">
                      <span className="text-sm">{profile.description || "No description provided"}</span>
                    </div>
                  )}
                </div>

                {/* Seller Status */}
                <div className="space-y-2">
                  <Label>Business Status</Label>
                  <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium">
                        {profile.isAvailable ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {profile.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({profile.reviewCount} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="space-y-2">
                  <Label>Profile Status</Label>
                  <div className={`p-3 rounded-md border ${isSellerProfileComplete() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center gap-2">
                      {isSellerProfileComplete() ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">Profile Complete</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-yellow-800">Profile Incomplete</span>
                        </>
                      )}
                    </div>
                    {!isSellerProfileComplete() && (
                      <div className="mt-2">
                        <p className="text-xs text-yellow-700 mb-2">Missing information:</p>
                        <ul className="text-xs text-yellow-600 space-y-1">
                          {getMissingInfo().map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => navigate('/complete-profile')}
                          size="sm"
                          className="mt-2"
                          variant="outline"
                        >
                          Complete Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user.userType === 'seller' ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/seller-dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Seller Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/add-listing")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => user && loadSellerAnalytics(user.id)}
                  disabled={loadingAnalytics}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                  Refresh Analytics
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Order History
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              App Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/help")}
            >
              <User className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
