import { useState, useRef } from "react";
import { ArrowLeft, Upload, TestTube, Database, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadDebug } from "@/utils/imageUploadDebug";
import { DrinkService } from "@/services/drinkService";

const ImageUploadDebugPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const results = await ImageUploadDebug.runFullDiagnostic();
      setDiagnosticResults(results);
      
      if (results.bucketAccess.success && results.uploadTest.success) {
        toast({
          title: "✅ Diagnostic Passed",
          description: "Image upload functionality is working correctly",
        });
      } else {
        toast({
          title: "❌ Issues Found",
          description: "There are problems with the image upload setup",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Diagnostic Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testRealUpload = async () => {
    if (!testFile) {
      toast({
        title: "No File Selected",
        description: "Please select an image file to test",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      // Create a test drink first
      const testDrink = await DrinkService.createDrink({
        seller_id: 'test-seller-id',
        name: 'Test Drink for Image Upload',
        description: 'This is a test drink for debugging image upload',
        price: 1.00,
        category: 'test',
        is_available: false, // Mark as unavailable so it doesn't show in real listings
      });

      // Test the complete upload flow
      const results = await ImageUploadDebug.testDrinkPhotoFlow(testDrink.id, testFile);
      setTestResults(results);

      if (results.success) {
        toast({
          title: "✅ Upload Test Passed",
          description: "Real image upload is working correctly",
        });
        
        // Clean up test drink
        await DrinkService.deleteDrink(testDrink.id);
      } else {
        toast({
          title: "❌ Upload Test Failed",
          description: results.error || "Unknown error during upload",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setTestFile(file);
    setTestResults(null);
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Image Upload Debug</h1>
              <p className="text-sm text-muted-foreground">
                Diagnose and test image upload functionality
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            Quick Diagnostic
          </h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Run a comprehensive test of the image upload system including bucket access, 
              upload permissions, and storage policies.
            </p>
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {isRunning ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
            </Button>
          </div>
        </Card>

        {/* Diagnostic Results */}
        {diagnosticResults && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              Diagnostic Results
            </h3>
            <div className="space-y-4">
              
              {/* Bucket Access */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <StatusIcon success={diagnosticResults.bucketAccess.success} />
                <div className="flex-1">
                  <h4 className="font-medium">Storage Bucket Access</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnosticResults.bucketAccess.success 
                      ? 'Successfully connected to drink-photos bucket'
                      : diagnosticResults.bucketAccess.error
                    }
                  </p>
                  {diagnosticResults.bucketAccess.buckets && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Available buckets:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {diagnosticResults.bucketAccess.buckets.map((bucket: string) => (
                          <Badge key={bucket} variant="outline" className="text-xs">
                            {bucket}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Test */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <StatusIcon success={diagnosticResults.uploadTest.success} />
                <div className="flex-1">
                  <h4 className="font-medium">Upload Test</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnosticResults.uploadTest.success 
                      ? 'Successfully uploaded and retrieved test image'
                      : diagnosticResults.uploadTest.error
                    }
                  </p>
                  {diagnosticResults.uploadTest.url && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Test URL: {diagnosticResults.uploadTest.url}
                    </p>
                  )}
                </div>
              </div>

              {/* Policy Check */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <StatusIcon success={diagnosticResults.policyCheck.success} />
                <div className="flex-1">
                  <h4 className="font-medium">Storage Policies</h4>
                  <p className="text-sm text-muted-foreground">
                    {diagnosticResults.policyCheck.success 
                      ? 'Storage policies are correctly configured'
                      : diagnosticResults.policyCheck.error
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Real Upload Test */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Real Upload Test
          </h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Test the complete upload flow with a real image file, including database updates.
            </p>
            
            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Test Image</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                {testFile && (
                  <span className="text-sm text-muted-foreground">
                    {testFile.name} ({(testFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>

            <Button 
              onClick={testRealUpload} 
              disabled={isRunning || !testFile}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isRunning ? 'Testing Upload...' : 'Test Real Upload'}
            </Button>
          </div>
        </Card>

        {/* Real Upload Results */}
        {testResults && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Upload Test Results
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusIcon success={testResults.success} />
                <span className="font-medium">
                  {testResults.success ? 'Upload Successful' : 'Upload Failed'}
                </span>
              </div>
              
              {testResults.error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm">{testResults.error}</p>
                </div>
              )}
              
              {testResults.url && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-green-700 text-sm">
                    <strong>Image URL:</strong> {testResults.url}
                  </p>
                </div>
              )}
              
              {testResults.steps && (
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Upload Steps:</h4>
                  {testResults.steps.map((step: string, index: number) => (
                    <div key={index} className="text-xs text-muted-foreground pl-4">
                      {index + 1}. {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Common Issues & Solutions
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Bucket Not Found</h4>
              <p className="text-muted-foreground">
                The 'drink-photos' storage bucket doesn't exist. Create it in your Supabase dashboard 
                under Storage → Buckets.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Upload Permission Denied</h4>
              <p className="text-muted-foreground">
                Missing storage policies. Add INSERT and SELECT policies for authenticated users 
                in Supabase Storage → Policies.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Database Update Failed</h4>
              <p className="text-muted-foreground">
                The image uploads but the database doesn't update. Check RLS policies on the 
                'drinks' table for UPDATE permissions.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ImageUploadDebugPage;
