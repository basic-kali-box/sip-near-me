import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { SellerService } from '@/services/sellerService';
import { getDefaultCoordinates, type Coordinates } from '@/utils/geocoding';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { UserMenu } from '@/components/UserMenu';
import { AddressInput } from '@/components/AddressInput';
import { validateSellerProfile, getMissingFieldsSummary, type SellerProfileValidationResult } from '@/utils/sellerProfileValidation';
import { validateAndNormalizeMoroccanPhone, formatMoroccanPhoneForDisplay } from '@/utils/moroccanPhoneValidation';


const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userContext = useUser();

  if (!userContext) {
    throw new Error('CompleteProfile must be used within UserProvider');
  }

  const { user, updateUser } = userContext;
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);
  const [sellerValidationResult, setSellerValidationResult] = useState<SellerProfileValidationResult | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    // Seller-specific fields
    businessName: '',
    businessAddress: '',
    businessCoordinates: null as Coordinates | null,
    specialty: 'coffee' as 'coffee' | 'matcha' | 'both',
    description: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      // Load validation result from sessionStorage if available
      const storedValidation = sessionStorage.getItem('sellerProfileValidation');
      if (storedValidation) {
        try {
          const validationResult = JSON.parse(storedValidation) as SellerProfileValidationResult;
          setSellerValidationResult(validationResult);
          console.log('📋 Loaded seller validation result:', validationResult);
          // Clear it from sessionStorage after loading
          sessionStorage.removeItem('sellerProfileValidation');
        } catch (error) {
          console.warn('Failed to parse seller validation result:', error);
        }
      }

      // If user is already set from registration, use their type and pre-fill data
      if (user) {
        setUserType(user.userType);

        // Pre-populate basic user data
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          phone: user.phone || ''
        }));

        // If seller, try to load existing seller profile data
        if (user.userType === 'seller') {
          try {
            const sellerProfile = await SellerService.getSellerById(user.id);
            const validationResult = validateSellerProfile(sellerProfile);

            // Update validation result state
            setSellerValidationResult(validationResult);

            if (validationResult.isComplete) {
              console.log('🔄 Profile already complete, will redirect to seller dashboard...');
              toast({
                title: "Welcome back!",
                description: "Your seller profile is already set up. Redirecting to dashboard...",
              });
              setShouldRedirectToDashboard(true);
            } else {
              // Pre-populate form with existing seller data
              if (sellerProfile) {
                setFormData(prev => ({
                  ...prev,
                  name: user.name || sellerProfile.name || '',
                  phone: user.phone || sellerProfile.phone || '',
                  businessName: sellerProfile.business_name || '',
                  businessAddress: sellerProfile.address || '',
                  specialty: sellerProfile.specialty || prev.specialty,
                  description: sellerProfile.description || ''
                }));
              }
              console.log('✅ Pre-populated form with existing seller data');
              console.log('📋 Missing fields:', getMissingFieldsSummary(validationResult));
            }
          } catch (error) {
            console.log('ℹ️ Error loading seller profile:', error);
            // Set validation result for new seller (all fields missing)
            setSellerValidationResult(validateSellerProfile(null));
          }
        }
      }

      // Pre-fill data from auth metadata if available (e.g., Google profile)
      if (session.user.user_metadata) {
        const metadata = session.user.user_metadata;
        setFormData(prev => ({
          ...prev,
          name: metadata.full_name || metadata.name || prev.name,
          phone: metadata.phone_number || metadata.phone || prev.phone
        }));
      }
    };

    checkAuth().finally(() => {
      setIsCheckingProfile(false);
    });
  }, [navigate, user, toast]);

  // Handle redirect to dashboard for complete seller profiles
  useEffect(() => {
    if (shouldRedirectToDashboard) {
      const timer = setTimeout(() => {
        navigate('/seller-dashboard');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirectToDashboard, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (userType === 'seller') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = 'Business address is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = '📞 Phone number is mandatory for sellers - customers need to contact you!';
      } else {
        // Validate Moroccan phone number format for WhatsApp
        const phoneValidation = validateAndNormalizeMoroccanPhone(formData.phone);
        if (!phoneValidation.isValid) {
          newErrors.phone = `📱 ${phoneValidation.errorMessage || 'Please enter a valid Moroccan mobile number (06XXXXXXXX or 07XXXXXXXX)'}`;
        }
      }

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔄 Starting profile completion for user type:', userType);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('No authenticated user found');
      }

      console.log('✅ Auth user found:', authUser.id);

      // Check if user profile exists first
      console.log('🔍 Checking if user profile exists...');
      let existingProfile = await UserService.getUserProfileById(authUser.id);

      if (!existingProfile) {
        console.log('👤 No user profile found, will be created during update');
      } else {
        console.log('✅ User profile exists:', existingProfile.id);
        // Clean up any duplicate user records
        console.log('🧹 Cleaning up any duplicate user records...');
        await UserService.cleanupDuplicateUsers(authUser.id);
      }

      // Update/create user profile with complete information
      console.log('🔄 Updating/creating user profile...');
      const userProfile = await UserService.updateUserProfile(authUser.id, {
        name: formData.name,
        phone: formData.phone,
        user_type: userType
      });

      console.log('✅ User profile updated successfully');

      // If seller, create seller profile
      if (userType === 'seller') {
        console.log('🔄 Creating seller profile...');
        console.log('🔄 Form data for seller profile:', {
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          phone: formData.phone,
          specialty: formData.specialty
        });

        // Validate required fields before creating seller profile
        if (!formData.businessName?.trim()) {
          throw new Error('Business name is required');
        }
        if (!formData.businessAddress?.trim()) {
          throw new Error('Business address is required');
        }
        if (!formData.phone?.trim()) {
          throw new Error('Phone number is required');
        }

        try {
          await SellerService.createSellerProfile({
            id: authUser.id,
            name: formData.name.trim(), // Use the person's actual name, not business name
            business_name: formData.businessName.trim(),
            address: formData.businessAddress.trim(),
            phone: formData.phone.trim(),
            specialty: formData.specialty,
            hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat-Sun: 9:00 AM - 5:00 PM',
            description: formData.description?.trim() || null,
            is_available: true, // Start as available
            rating_average: 0,
            rating_count: 0,
            // Use coordinates from address input or fallback to geocoding
            latitude: formData.businessCoordinates?.latitude || getDefaultCoordinates(formData.businessAddress).latitude,
            longitude: formData.businessCoordinates?.longitude || getDefaultCoordinates(formData.businessAddress).longitude,
            photo_url: null
          });
          console.log('✅ Seller profile created successfully');
        } catch (sellerError) {
          console.error('⚠️ Seller profile creation failed:', sellerError);
          throw sellerError; // Don't continue if seller profile creation fails
        }
      }

      // Update user with the new profile information (only user table fields)
      await updateUser({
        name: userProfile.name,
        phone: userProfile.phone || '',
        userType: userProfile.user_type,
        profileImage: userProfile.avatar_url || undefined
      });

      console.log('✅ Profile completion successful, redirecting...');

      // Show success message
      toast({
        title: "Profile completed successfully!",
        description: `Welcome to Machroub${userType === 'seller' ? ' as a seller' : ''}! Your profile has been set up.`,
      });

      // Small delay to show the toast before navigation
      setTimeout(() => {
        // Redirect sellers to add listing page, buyers to app
        if (userType === 'seller') {
          navigate('/add-listing');
        } else {
          navigate('/app');
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ Profile completion error:', error);

      let errorMessage = error.message || 'Failed to complete profile. Please try again.';

      // Handle specific database errors
      if (error.message?.includes('multiple') && error.message?.includes('rows')) {
        errorMessage = 'Database synchronization issue detected. Please try again in a moment.';

        // Attempt to clean up and retry once
        try {
          console.log('🔄 Attempting to clean up and retry...');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await UserService.cleanupDuplicateUsers(authUser.id);
          }
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      } else if (error.message?.includes('JSON object requested')) {
        errorMessage = 'Data format issue. Please refresh the page and try again.';
      }

      setErrors({ general: errorMessage });

      toast({
        title: "Profile completion failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking profile completeness
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-matcha-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking Profile...</h2>
          <p className="text-gray-600">Please wait while we verify your profile status.</p>
        </div>
      </div>
    );
  }

  // Show redirect loading state
  if (shouldRedirectToDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-matcha-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Redirecting to your seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-matcha-50">
      {/* Header with User Menu */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">☕</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Complete Profile</h1>
              <p className="text-xs text-gray-600">Step 2 of 3</p>
            </div>
          </div>
          <UserMenu variant="desktop" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-coffee-600 to-matcha-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">Just a few more details to get started on Machroub</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                ✓
              </div>
              <div className="w-16 h-1 bg-green-500 rounded"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                2
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-semibold">
                3
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Step 2 of 3: Profile Information</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* User Type Selection - Only show if not already determined */}
          {!user && (
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-4 sm:mb-6">
                I want to:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() => setUserType('buyer')}
                  className={`min-h-[64px] sm:min-h-[72px] p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 touch-manipulation ${
                    userType === 'buyer'
                      ? 'border-coffee-500 bg-coffee-50 text-coffee-700 shadow-md scale-[1.02] ring-2 ring-coffee-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99] focus:ring-2 focus:ring-coffee-200 focus:border-coffee-300'
                  }`}
                  aria-label="Select buyer account type to find and order drinks"
                >
                  <div className="text-4xl sm:text-3xl mb-2 sm:mb-3">☕</div>
                  <div className="font-semibold text-lg sm:text-base">Find Drinks</div>
                  <div className="text-sm sm:text-xs text-gray-500 mt-1 sm:mt-2">I'm a buyer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('seller')}
                  className={`min-h-[64px] sm:min-h-[72px] p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 touch-manipulation ${
                    userType === 'seller'
                      ? 'border-matcha-500 bg-matcha-50 text-matcha-700 shadow-md scale-[1.02] ring-2 ring-matcha-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99] focus:ring-2 focus:ring-matcha-200 focus:border-matcha-300'
                  }`}
                  aria-label="Select seller account type to sell drinks and manage your business"
                >
                  <div className="text-4xl sm:text-3xl mb-2 sm:mb-3">🏪</div>
                  <div className="font-semibold text-lg sm:text-base">Sell Drinks</div>
                  <div className="text-sm sm:text-xs text-gray-500 mt-1 sm:mt-2">I'm a seller</div>
                </button>
              </div>
            </div>
          )}

          {/* Show selected user type if already determined */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 text-sm">
                Completing profile as: <strong>{userType === 'seller' ? 'Seller' : 'Buyer'}</strong>
              </p>
            </div>
          )}

          {/* Show missing fields for sellers */}
          {userType === 'seller' && sellerValidationResult && !sellerValidationResult.isComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 mb-2">
                    Complete Your Seller Profile
                  </h3>
                  <p className="text-amber-700 text-sm mb-3">
                    {getMissingFieldsSummary(sellerValidationResult)}
                  </p>
                  {sellerValidationResult.missingFieldsDetails.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-amber-700 text-sm font-medium">Required fields:</p>
                      <ul className="space-y-1">
                        {sellerValidationResult.missingFieldsDetails.map((field) => (
                          <li key={field.field} className="flex items-start gap-2 text-sm text-amber-700">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <div>
                              <span className="font-medium">{field.label}</span>
                              <span className="text-amber-600 ml-1">- {field.description}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-coffee-500'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number {userType === 'seller' && <span className="text-red-500">*</span>}
              {userType === 'seller' && <span className="text-xs text-gray-500 ml-1">(Required for customer contact)</span>}
            </label>
            <input
              type="tel"
              required={userType === 'seller'}
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                errors.phone
                  ? 'border-red-400 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-coffee-500'
              }`}
              placeholder={userType === 'seller' ? "0606060606 or 212606060606" : "+1 (555) 123-4567"}
            />
            {/* Show formatted phone number preview for valid input */}
            {userType === 'seller' && formData.phone && !errors.phone && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  📱 WhatsApp format: <span className="font-mono font-semibold">{formatMoroccanPhoneForDisplay(validateAndNormalizeMoroccanPhone(formData.phone).cleanNumber)}</span>
                </p>
              </div>
            )}
            {errors.phone && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{errors.phone}</p>
              </div>
            )}
            {userType === 'seller' && !errors.phone && formData.phone && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
                Customers will contact you via WhatsApp using this number
              </p>
            )}
          </div>

          {/* Seller-specific fields */}
          {userType === 'seller' && (
            <>
              <div className="bg-gradient-to-br from-matcha-50 to-matcha-100 border border-matcha-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-matcha-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏪</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-matcha-800">Business Information</h3>
                    <p className="text-sm text-matcha-600">Help customers find and connect with you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, businessName: e.target.value }));
                        if (errors.businessName) setErrors(prev => ({ ...prev, businessName: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
                        errors.businessName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-matcha-500'
                      }`}
                      placeholder="e.g., Café Central, Bean & Brew, The Coffee Corner"
                    />
                    {errors.businessName && <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address *
                    </label>
                    <AddressInput
                      value={formData.businessAddress}
                      coordinates={formData.businessCoordinates}
                      onChange={(address, coordinates) => {
                        setFormData(prev => ({
                          ...prev,
                          businessAddress: address,
                          businessCoordinates: coordinates || null
                        }));
                        if (errors.businessAddress) setErrors(prev => ({ ...prev, businessAddress: '' }));
                      }}
                      placeholder="Enter your exact business address"
                      error={errors.businessAddress}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent bg-white"
                    >
                      <option value="coffee">☕ Coffee</option>
                      <option value="matcha">🍵 Matcha</option>
                      <option value="both">🌟 Both Coffee & Matcha</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent resize-none"
                      placeholder="Tell customers about your business, specialties, or what makes you unique..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                  </div>

                  {/* Seller Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips for Success</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use a clear, descriptive business name</li>
                      <li>• Include your full address for accurate location</li>
                      <li>• <strong>📞 Phone number is mandatory</strong> - customers need to contact you for orders</li>
                      <li>• Set realistic hours that you can maintain</li>
                      <li>• Write a compelling description to attract customers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
              userType === 'seller'
                ? 'bg-gradient-to-r from-matcha-600 to-matcha-700 hover:from-matcha-700 hover:to-matcha-800 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white shadow-lg hover:shadow-xl'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing Profile...
              </div>
            ) : (
              `Complete ${userType === 'seller' ? 'Seller' : 'Buyer'} Profile`
            )}
          </button>
        </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? <a href="mailto:mehdibenlekhale@gmail.com" className="text-coffee-600 hover:text-coffee-700 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
