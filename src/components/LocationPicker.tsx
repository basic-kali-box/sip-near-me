import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Locate, Check, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { InteractiveMap } from './InteractiveMap';
import {
  searchAddresses,
  reverseGeocode,
  getCurrentLocation,
  isValidCoordinates,
  formatCoordinates,
  type Coordinates,
  type GeocodeResult
} from '@/utils/geocoding';

interface LocationPickerProps {
  initialAddress?: string;
  initialCoordinates?: Coordinates;
  onLocationSelect: (address: string, coordinates: Coordinates) => void;
  onCancel?: () => void;
  className?: string;
}

interface MapMarker {
  coordinates: Coordinates;
  address: string;
  isUserSelected: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress = '',
  initialCoordinates,
  onLocationSelect,
  onCancel,
  className = ''
}) => {
  const { toast } = useToast();
  
  // State
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapMarker | null>(
    initialCoordinates ? {
      coordinates: initialCoordinates,
      address: initialAddress,
      isUserSelected: true
    } : null
  );
  const [mapCenter, setMapCenter] = useState<Coordinates>(
    initialCoordinates || { latitude: 40.7128, longitude: -74.0060 }
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAddresses(query, 5);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search for addresses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Handle search input with debouncing
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Handle search result selection
  const handleResultSelect = async (result: GeocodeResult) => {
    setSelectedLocation({
      coordinates: result.coordinates,
      address: result.formattedAddress,
      isUserSelected: true
    });
    setMapCenter(result.coordinates);
    setSearchQuery(result.formattedAddress);
    setShowResults(false);
  };

  // Handle map click (simulated - in real implementation this would be from map component)
  const handleMapClick = async (coordinates: Coordinates) => {
    if (!isValidCoordinates(coordinates.latitude, coordinates.longitude)) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location on the map.",
        variant: "destructive",
      });
      return;
    }

    try {
      const address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
      
      setSelectedLocation({
        coordinates,
        address: address || `${formatCoordinates(coordinates.latitude, coordinates.longitude)}`,
        isUserSelected: true
      });
      
      if (address) {
        setSearchQuery(address);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setSelectedLocation({
        coordinates,
        address: `${formatCoordinates(coordinates.latitude, coordinates.longitude)}`,
        isUserSelected: true
      });
    }
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      const marker: MapMarker = {
        coordinates: location,
        address: address || `Current Location (${formatCoordinates(location.latitude, location.longitude)})`,
        isUserSelected: true
      };
      
      setSelectedLocation(marker);
      setMapCenter(location);
      if (address) {
        setSearchQuery(address);
      }
      
      toast({
        title: "Location Found",
        description: "Using your current location",
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please search for an address or click on the map.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (!selectedLocation) {
      toast({
        title: "No Location Selected",
        description: "Please select a location before confirming.",
        variant: "destructive",
      });
      return;
    }

    onLocationSelect(selectedLocation.address, selectedLocation.coordinates);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Section */}
      <div className="space-y-2 relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for an address..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="pl-10 h-12 text-base" // Larger touch target for mobile
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-500"></div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="px-4 h-12 sm:px-3 sm:h-10 whitespace-nowrap" // Larger on mobile
          >
            {isLoadingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-500"></div>
            ) : (
              <>
                <Locate className="w-4 h-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Use Current Location</span>
              </>
            )}
          </Button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-[9999] w-full max-h-60 overflow-y-auto bg-white border shadow-xl" style={{ top: '100%' }}>
            <div className="p-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  className="w-full text-left p-3 hover:bg-matcha-50 active:bg-matcha-100 rounded-lg transition-colors border border-transparent hover:border-matcha-200 mb-1 last:mb-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-matcha-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {result.formattedAddress}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.coordinates.latitude.toFixed(4)}, {result.coordinates.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Interactive Map */}
      <InteractiveMap
        center={mapCenter}
        zoom={13}
        selectedLocation={selectedLocation?.coordinates || null}
        onLocationSelect={handleMapClick}
        height="min(400px, 50vh)" // Responsive height for mobile
        className="rounded-lg overflow-hidden"
      />

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800">Selected Location</h4>
              <p className="text-sm text-green-700 mt-1">{selectedLocation.address}</p>
              <p className="text-xs text-green-600 mt-1">
                {formatCoordinates(selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-12 sm:h-10 order-2 sm:order-1" // Larger on mobile, cancel second on mobile
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="bg-gradient-to-r from-coffee-500 to-matcha-500 hover:from-coffee-600 hover:to-matcha-600 h-12 sm:h-10 order-1 sm:order-2" // Larger on mobile, confirm first on mobile
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm Location
        </Button>
      </div>
    </div>
  );
};
