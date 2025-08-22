import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, Phone, Heart, ShoppingBag, Coffee, Star, Camera, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/userService";
import { SellerService } from "@/services/sellerService";
import { BuyerService } from "@/services/buyerService";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { MoroccanPhoneInput } from "@/components/ui/moroccan-phone-input";
import { validateAndNormalizeMoroccanPhone, normalizeMoroccanPhoneForWhatsApp } from "@/utils/moroccanPhoneValidation";

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [sellerProfileExists, setSellerProfileExists] = useState<boolean | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Form Data for editing
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    address: "",
    businessHours: "",
    specialty: "coffee" as "coffee" | "matcha" | "both",
    description: ""
  });

  // Phone validation state
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    normalizedNumber: "",
    errorMessage: ""
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
        await loadSellerProfile(user.id);
      } else if (user.userType === 'buyer') {
        await loadBuyerProfile(user.id);
      }
      
      // Mark profile data as loaded
      setProfileDataLoaded(true);
    };

    loadProfileData();
  }, [user, initializeProfile, loadSellerProfile, loadBuyerProfile]);

  // Check if seller profile is complete
  const isSellerProfileComplete = useCallback(() => {
    if (user?.userType !== 'seller') return true;
    const isComplete = !!(
      profile.businessName?.trim() &&
      profile.address?.trim() &&
      profile.businessHours?.trim() &&
      profile.businessHours !== 'null' &&
      profile.phone?.trim()
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
  }, [profile, user, profileDataLoaded, sellerProfileExists]);

  // Get missing information for incomplete profiles
  const getMissingInfo = useCallback(() => {
    if (user?.userType !== 'seller') return [];
    const missing = [];
    if (!profile.businessName?.trim()) missing.push('Business name');
    if (!profile.address?.trim()) missing.push('Business address');
    if (!profile.businessHours?.trim() || profile.businessHours === 'null') {
      console.log('🔍 Business hours missing check:', {
        businessHours: profile.businessHours,
        businessHoursTrimmed: profile.businessHours?.trim(),
        isNull: profile.businessHours === 'null',
        profileDataLoaded,
        userBusinessHours: user?.businessHours
      });
      missing.push('Business hours');
    }
    if (!profile.phone?.trim()) missing.push('Phone number');
    return missing;
  }, [profile, user, profileDataLoaded]);



  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      let photoUrl: string;

      if (user.userType === 'seller') {
        photoUrl = await SellerService.uploadSellerPhoto(user.id, file);
      } else {
        photoUrl = await UserService.uploadAvatar(user.id, file);
      }

      setProfile(prev => ({ ...prev, avatar: photoUrl }));
      await updateUser({ profileImage: photoUrl });

      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      businessName: profile.businessName,
      address: profile.address,
      businessHours: profile.businessHours,
      specialty: profile.specialty,
      description: profile.description
    });
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      phone: "",
      businessName: "",
      address: "",
      businessHours: "",
      specialty: "coffee",
      description: ""
    });
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate phone number before saving
    if (formData.phone.trim()) {
      const phoneValidationResult = validateAndNormalizeMoroccanPhone(formData.phone);
      if (!phoneValidationResult.isValid) {
        toast({
          title: "Invalid Phone Number",
          description: phoneValidationResult.errorMessage || "Please enter a valid Moroccan mobile number",
          variant: "destructive",
        });
        return;
      }
      // Use normalized phone number for saving
      formData.phone = phoneValidationResult.normalizedNumber;
    }

    setIsSaving(true);
    try {
      if (user.userType === 'seller') {
        // Update seller profile
        await SellerService.updateSellerProfile(user.id, {
          name: formData.name,
          business_name: formData.businessName,
          address: formData.address,
          phone: formData.phone,
          hours: formData.businessHours,
          specialty: formData.specialty,
          description: formData.description
        });

        // Update local profile state
        setProfile(prev => ({
          ...prev,
          name: formData.name,
          phone: formData.phone,
          businessName: formData.businessName,
          address: formData.address,
          businessHours: formData.businessHours,
          specialty: formData.specialty,
          description: formData.description
        }));

        // Update user context
        await updateUser({
          name: formData.name,
          phone: formData.phone,
          businessName: formData.businessName,
          businessAddress: formData.address,
          businessHours: formData.businessHours,
          specialty: formData.specialty
        });
      } else {
        // Update buyer profile
        await BuyerService.updateBuyerProfile(user.id, {
          name: formData.name,
          phone: formData.phone
        });

        // Update local profile state
        setProfile(prev => ({
          ...prev,
          name: formData.name,
          phone: formData.phone
        }));

        // Update user context
        await updateUser({
          name: formData.name,
          phone: formData.phone
        });
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };



  // Stats for display
  const stats = user?.userType === 'seller' ? [
    { label: "Profile Views", value: sellerStats.profileViews.toString(), icon: User },
    { label: "Contact Requests", value: sellerStats.contactRequests.toString(), icon: Phone },
    { label: "Menu Items", value: sellerStats.menuItems.toString(), icon: Coffee },
  ] : [
    { label: "Orders Placed", value: buyerStats.totalOrders.toString(), icon: ShoppingBag },
    { label: "Favorites", value: buyerStats.favoriteCount.toString(), icon: Heart },
    { label: "Reviews", value: buyerStats.reviewCount.toString(), icon: User },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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
        <Card className="p-6 bg-gradient-to-r from-matcha-50 to-coffee-50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </div>
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

        {/* Profile Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Profile Information</h3>
            {!isEditing ? (
              <Button
                onClick={handleEditClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-gray-900 mt-1">{profile.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900 mt-1">{profile.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-gray-900 mt-1">
                    {profile.phone ? (
                      <span className="flex items-center gap-2">
                        <span className="font-mono">{
                          validateAndNormalizeMoroccanPhone(profile.phone).isValid
                            ? validateAndNormalizeMoroccanPhone(profile.phone).displayNumber
                            : profile.phone
                        }</span>
                        {validateAndNormalizeMoroccanPhone(profile.phone).isValid && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            WhatsApp Ready
                          </span>
                        )}
                      </span>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
                {user?.userType === 'seller' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                      <p className="text-gray-900 mt-1">{profile.businessName || 'Not set'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Business Address</Label>
                      <p className="text-gray-900 mt-1">{profile.address || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Business Hours</Label>
                      <p className="text-gray-900 mt-1">{profile.businessHours || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Specialty</Label>
                      <p className="text-gray-900 mt-1 capitalize">{profile.specialty}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-gray-900 mt-1">{profile.description || 'No description provided'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <MoroccanPhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    onValidationChange={(isValid, normalizedNumber) => {
                      setPhoneValidation({
                        isValid,
                        normalizedNumber,
                        errorMessage: isValid ? "" : "Invalid phone number format"
                      });
                    }}
                    label="Phone Number"
                    placeholder="0606060606 or 212606060606"
                    required={user?.userType === 'seller'}
                    disabled={isSaving}
                    showValidationFeedback={true}
                    showFormattedPreview={true}
                    size="default"
                  />
                </div>
                {user?.userType === 'seller' && (
                  <>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Your business name"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select
                        value={formData.specialty}
                        onValueChange={(value: "coffee" | "matcha" | "both") =>
                          setFormData(prev => ({ ...prev, specialty: value }))
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coffee">☕ Coffee</SelectItem>
                          <SelectItem value="matcha">🍵 Matcha</SelectItem>
                          <SelectItem value="both">☕🍵 Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Your business address"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <Input
                        id="businessHours"
                        value={formData.businessHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessHours: e.target.value }))}
                        placeholder="e.g., Mon-Fri: 8:00 AM - 6:00 PM, Sat-Sun: 9:00 AM - 5:00 PM"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell customers about your business..."
                        rows={3}
                        disabled={isSaving}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default Profile;
