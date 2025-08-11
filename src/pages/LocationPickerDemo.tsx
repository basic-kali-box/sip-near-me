import React, { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddressInput } from '@/components/AddressInput';
import { LocationPicker } from '@/components/LocationPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { testGeocoding } from '@/utils/test-geocoding';
import { runDeploymentTests, printTestResults, type DeploymentTestResult } from '@/utils/deployment-test';
import { type Coordinates } from '@/utils/geocoding';

const LocationPickerDemo: React.FC = () => {
  const [address1, setAddress1] = useState('');
  const [coordinates1, setCoordinates1] = useState<Coordinates | null>(null);
  const [address2, setAddress2] = useState('1600 Amphitheatre Parkway, Mountain View, CA');
  const [coordinates2, setCoordinates2] = useState<Coordinates | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [deploymentResults, setDeploymentResults] = useState<DeploymentTestResult[]>([]);

  const handleLocationSelect = (address: string, coordinates: Coordinates) => {
    setAddress2(address);
    setCoordinates2(coordinates);
    setShowLocationPicker(false);
  };

  const runGeocodingTest = async () => {
    setTestResults('Running tests...');
    const success = await testGeocoding();
    setTestResults(success ? 'Tests completed successfully! Check console for details.' : 'Tests failed. Check console for errors.');
  };

  const runDeploymentTest = async () => {
    setDeploymentResults([]);
    setTestResults('Running deployment verification...');
    try {
      const results = await runDeploymentTests();
      setDeploymentResults(results);
      printTestResults(results);
      setTestResults('Deployment tests completed! Check results below and console for details.');
    } catch (error) {
      setTestResults('Deployment tests failed. Check console for errors.');
      console.error('Deployment test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Location Picker Demo</h1>
                <p className="text-sm text-gray-600">OpenRouteService Integration</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/30">
            <h2 className="text-lg font-semibold mb-3">Interactive Location Picker</h2>
            <p className="text-gray-600 mb-4">
              This demo showcases the new location picker implementation using OpenRouteService (ORS) 
              for accurate address geocoding and location selection.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Search className="w-3 h-3 mr-1" />
                Address Autocomplete
              </Badge>
              <Badge variant="secondary">
                <MapPin className="w-3 h-3 mr-1" />
                Interactive Map
              </Badge>
              <Badge variant="secondary">
                <Navigation className="w-3 h-3 mr-1" />
                GPS Location
              </Badge>
            </div>
          </Card>

          {/* Address Input Demo */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/30">
            <h3 className="text-lg font-semibold mb-4">1. Smart Address Input</h3>
            <p className="text-gray-600 mb-4">
              Type an address to see autocomplete suggestions powered by OpenRouteService.
            </p>
            
            <div className="space-y-4">
              <AddressInput
                value={address1}
                coordinates={coordinates1}
                onChange={(address, coordinates) => {
                  setAddress1(address);
                  setCoordinates1(coordinates || null);
                }}
                placeholder="Try typing 'Starbucks New York' or any address..."
                className="w-full"
              />
              
              {coordinates1 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Selected Location:</h4>
                  <p className="text-sm text-green-700 mb-1">{address1}</p>
                  <p className="text-xs text-green-600">
                    Coordinates: {coordinates1.latitude.toFixed(6)}, {coordinates1.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Location Picker Demo */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/30">
            <h3 className="text-lg font-semibold mb-4">2. Interactive Location Picker</h3>
            <p className="text-gray-600 mb-4">
              Open the full location picker dialog for advanced location selection.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <AddressInput
                  value={address2}
                  coordinates={coordinates2}
                  onChange={(address, coordinates) => {
                    setAddress2(address);
                    setCoordinates2(coordinates || null);
                  }}
                  placeholder="Address with location picker..."
                  className="flex-1"
                />
                
                <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="px-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      Open Picker
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Business Location</DialogTitle>
                    </DialogHeader>
                    <LocationPicker
                      initialAddress={address2}
                      initialCoordinates={coordinates2}
                      onLocationSelect={handleLocationSelect}
                      onCancel={() => setShowLocationPicker(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              {coordinates2 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Selected Location:</h4>
                  <p className="text-sm text-blue-700 mb-1">{address2}</p>
                  <p className="text-xs text-blue-600">
                    Coordinates: {coordinates2.latitude.toFixed(6)}, {coordinates2.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* API Testing */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/30">
            <h3 className="text-lg font-semibold mb-4">3. API Testing & Deployment Verification</h3>
            <p className="text-gray-600 mb-4">
              Test the OpenRouteService integration and verify deployment readiness.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={runGeocodingTest} variant="outline">
                  Run Geocoding Tests
                </Button>
                <Button onClick={runDeploymentTest} variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
                  Verify Deployment
                </Button>
              </div>

              {testResults && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">{testResults}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Check the browser console for detailed test results.
                  </p>
                </div>
              )}

              {/* Deployment Test Results */}
              {deploymentResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Deployment Test Results:</h4>
                  {deploymentResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.status === 'pass' ? 'bg-green-50 border-green-200' :
                      result.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
                        </span>
                        <span className="font-medium text-sm">{result.test}</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Implementation Notes */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/30">
            <h3 className="text-lg font-semibold mb-4">Implementation Notes</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-coffee-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Interactive Map:</strong> Real Leaflet map integration with click-to-select functionality and OpenStreetMap tiles.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-matcha-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Address Autocomplete:</strong> Uses ORS geocoding API with debounced search for real-time suggestions.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-coffee-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Coordinate Accuracy:</strong> Provides exact latitude/longitude coordinates for precise business location.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-matcha-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Reverse Geocoding:</strong> Automatically converts map clicks to readable addresses using ORS API.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-coffee-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>GPS Integration:</strong> One-click current location detection with automatic map centering.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerDemo;
