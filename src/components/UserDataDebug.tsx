import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/userService';
import { SellerService } from '@/services/sellerService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const UserDataDebug: React.FC = () => {
  const { user, refreshUserData } = useUser();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userProfile, sellerProfile] = await Promise.all([
        UserService.getUserProfileById(user.id),
        user.userType === 'seller' ? SellerService.getSellerById(user.id) : null
      ]);

      setDebugData({
        userContext: user,
        userDatabase: userProfile,
        sellerDatabase: sellerProfile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-4 m-4 bg-yellow-50 border-yellow-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">User Data Debug</h3>
          <div className="flex gap-2">
            <Button
              onClick={fetchDebugData}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await refreshUserData();
                  await fetchDebugData();
                } catch (error) {
                  console.error('Refresh error:', error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              size="sm"
              variant="default"
            >
              Fix Context
            </Button>
            <Button
              onClick={async () => {
                if (!user || user.userType !== 'seller') return;
                setLoading(true);
                try {
                  // Sync seller data with user data
                  await SellerService.updateSellerProfile(user.id, {
                    phone: debugData?.userDatabase?.phone || user.phone,
                    hours: debugData?.userDatabase?.hours || 'Mon-Fri: 9:00 AM - 5:00 PM'
                  });
                  await fetchDebugData();
                } catch (error) {
                  console.error('Sync error:', error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !debugData}
              size="sm"
              variant="secondary"
            >
              Sync Seller
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-medium mb-2">User Context Data:</h4>
            <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify({
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                userType: user.userType,
                businessName: user.businessName,
                businessHours: user.businessHours
              }, null, 2)}
            </pre>
          </div>

          {debugData && (
            <>
              <div>
                <h4 className="font-medium mb-2">Database User Data:</h4>
                <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(debugData.userDatabase, null, 2)}
                </pre>
              </div>

              {debugData.sellerDatabase && (
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2">Database Seller Data:</h4>
                  <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                    {JSON.stringify(debugData.sellerDatabase, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-gray-600">
          <p><strong>Current Issues:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li className={user?.phone !== debugData?.userDatabase?.phone ? 'text-red-600 font-medium' : 'text-green-600'}>
              Phone: Context "{user?.phone}" vs DB "{debugData?.userDatabase?.phone}"
            </li>
            <li className={user?.name !== debugData?.userDatabase?.name ? 'text-red-600 font-medium' : 'text-green-600'}>
              Name: Context "{user?.name}" vs DB "{debugData?.userDatabase?.name}"
            </li>
            {user?.userType === 'seller' && debugData?.sellerDatabase && (
              <>
                <li className={!debugData.sellerDatabase.phone ? 'text-red-600 font-medium' : 'text-green-600'}>
                  Seller Phone: "{debugData.sellerDatabase.phone}" (should match user phone)
                </li>
                <li className={!debugData.sellerDatabase.hours ? 'text-red-600 font-medium' : 'text-green-600'}>
                  Business Hours: "{debugData.sellerDatabase.hours}" (should be set)
                </li>
              </>
            )}
          </ul>
          <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
            <p><strong>Actions:</strong></p>
            <p>1. Click "Fix Context" to refresh user data from database</p>
            <p>2. Click "Sync Seller" to update seller table with user data</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
