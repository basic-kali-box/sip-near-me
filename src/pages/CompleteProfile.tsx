import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { SellerService } from '@/services/sellerService';
import { useUser } from '@/contexts/UserContext';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUser() as any;
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    // Seller-specific fields
    businessName: '',
    businessAddress: '',
    businessHours: '8:00 AM - 6:00 PM',
    specialty: 'coffee' as 'coffee' | 'matcha' | 'both'
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      // Pre-fill name from Google profile if available
      if (session.user.user_metadata?.full_name) {
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata.full_name
        }));
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('No authenticated user found');
      }

      // Update user profile with complete information
      const userProfile = await UserService.updateUserProfile(authUser.id, {
        name: formData.name,
        phone: formData.phone,
        user_type: userType
      });

      // If seller, create seller profile
      if (userType === 'seller') {
        await SellerService.createSellerProfile({
          id: authUser.id,
          business_name: formData.businessName,
          address: formData.businessAddress,
          phone: formData.phone,
          specialty: formData.specialty,
          hours: formData.businessHours
        });
      }

      setUser(userProfile);
      setIsAuthenticated(true);

      // Redirect based on user type
      if (userType === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      alert('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-matcha-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Just a few more details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('buyer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  userType === 'buyer'
                    ? 'border-coffee-500 bg-coffee-50 text-coffee-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">☕</div>
                <div className="font-medium">Find Drinks</div>
                <div className="text-sm text-gray-500">I'm a buyer</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('seller')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  userType === 'seller'
                    ? 'border-matcha-500 bg-matcha-50 text-matcha-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🏪</div>
                <div className="font-medium">Sell Drinks</div>
                <div className="text-sm text-gray-500">I'm a seller</div>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Seller-specific fields */}
          {userType === 'seller' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent"
                  placeholder="Your Coffee Shop Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent"
                >
                  <option value="coffee">Coffee</option>
                  <option value="matcha">Matcha</option>
                  <option value="both">Both Coffee & Matcha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessHours: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-matcha-500 focus:border-transparent"
                  placeholder="8:00 AM - 6:00 PM"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
              userType === 'seller'
                ? 'bg-matcha-600 hover:bg-matcha-700 text-white'
                : 'bg-coffee-600 hover:bg-coffee-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
