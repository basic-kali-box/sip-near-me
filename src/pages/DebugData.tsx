import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { UserDataDebug } from '@/components/UserDataDebug';
import { useUser } from '@/contexts/UserContext';
import { cleanupAllDuplicateUsers, checkDatabaseIntegrity, fixCommonDatabaseIssues } from "@/utils/databaseCleanup";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const DebugData: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [integrityResults, setIntegrityResults] = useState<any>(null);

  const handleCheckIntegrity = async () => {
    try {
      setIsFixing(true);
      const results = await checkDatabaseIntegrity();
      setIntegrityResults(results);

      toast({
        title: "Database Integrity Check Complete",
        description: `Found ${results?.duplicateUsers || 0} duplicate users`,
      });
    } catch (error) {
      toast({
        title: "Integrity Check Failed",
        description: "Could not check database integrity",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixDuplicates = async () => {
    try {
      setIsFixing(true);
      const result = await cleanupAllDuplicateUsers();

      toast({
        title: result.success ? "Cleanup Successful" : "Cleanup Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      // Refresh integrity check
      if (result.success) {
        await handleCheckIntegrity();
      }
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Could not clean up duplicate users",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixAllIssues = async () => {
    try {
      setIsFixing(true);
      const results = await fixCommonDatabaseIssues();

      toast({
        title: "Database Fix Complete",
        description: `Fixed ${results.duplicateUsersFixed} duplicate users`,
      });

      // Refresh integrity check
      await handleCheckIntegrity();
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: "Could not fix database issues",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-bold mb-4">Debug Data</h1>
          <p className="text-muted-foreground mb-4">Please sign in to access debug tools.</p>
          <Button onClick={() => navigate('/signin')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Debug Data</h1>
                <p className="text-sm text-muted-foreground">Fix user data synchronization issues</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Data Synchronization Issues</h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Common Issues Found:</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li><strong>Phone Number Missing:</strong> User context not loading phone from database</li>
                  <li><strong>Seller Data Empty:</strong> Seller table missing phone and business hours</li>
                  <li><strong>Cache Issues:</strong> localStorage storing outdated user essentials</li>
                  <li><strong>Duplicate Users:</strong> Multiple user records causing "JSON object requested, multiple rows returned" errors</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">How to Fix:</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li><strong>Fix Context:</strong> Clears cache and reloads user data from database</li>
                  <li><strong>Sync Seller:</strong> Updates seller table with correct phone and hours</li>
                  <li><strong>Refresh Data:</strong> Shows current state of all data sources</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">After Fixing:</h3>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  <li>Phone number will show correctly in profile</li>
                  <li>Business hours will be properly saved</li>
                  <li>All data will stay synchronized</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Debug Component */}
          <UserDataDebug />

          {/* Database Cleanup Tools */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Database Cleanup Tools</h2>

            {integrityResults && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Database Status:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total Users: {integrityResults.totalUsers}</div>
                  <div>Total Sellers: {integrityResults.totalSellers}</div>
                  <div className={integrityResults.duplicateUsers > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    Duplicate Users: {integrityResults.duplicateUsers}
                  </div>
                  <div className={integrityResults.orphanedSellers > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                    Orphaned Sellers: {integrityResults.orphanedSellers}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCheckIntegrity}
                variant="outline"
                disabled={isFixing}
              >
                {isFixing ? 'Checking...' : 'Check Database Integrity'}
              </Button>

              <Button
                onClick={handleFixDuplicates}
                variant="outline"
                disabled={isFixing || !integrityResults?.duplicateUsers}
                className={integrityResults?.duplicateUsers > 0 ? 'border-red-300 text-red-700' : ''}
              >
                {isFixing ? 'Fixing...' : 'Fix Duplicate Users'}
              </Button>

              <Button
                onClick={handleFixAllIssues}
                variant="outline"
                disabled={isFixing}
                className="border-blue-300 text-blue-700"
              >
                {isFixing ? 'Fixing...' : 'Fix All Issues'}
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Note:</strong> These tools help fix database integrity issues like duplicate user records that can cause "multiple rows returned" errors.</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
              >
                Go to Profile
              </Button>
              <Button 
                onClick={() => navigate('/complete-profile')}
                variant="outline"
              >
                Complete Profile
              </Button>
              {user.userType === 'seller' && (
                <Button 
                  onClick={() => navigate('/seller-dashboard')}
                  variant="outline"
                >
                  Seller Dashboard
                </Button>
              )}
              <Button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                variant="destructive"
                size="sm"
              >
                Clear All Data & Reload
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DebugData;
