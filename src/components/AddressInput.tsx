import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LocationPicker } from './LocationPicker';
import { searchAddresses, type Coordinates, type GeocodeResult } from '@/utils/geocoding';

interface AddressInputProps {
  value: string;
  onChange: (address: string, coordinates?: Coordinates) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  coordinates?: Coordinates;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your business address",
  error,
  required = false,
  className = '',
  coordinates
}) => {
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle search with debouncing
  const handleSearch = async (query: string) => {
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
      console.error('Address search failed:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleSearch(inputValue);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Handle result selection
  const handleResultSelect = (result: GeocodeResult) => {
    onChange(result.formattedAddress, result.coordinates);
    setShowResults(false);
    inputRef.current?.blur();
  };

  // Handle location picker selection
  const handleLocationPickerSelect = (address: string, coords: Coordinates) => {
    onChange(address, coords);
    setShowLocationPicker(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Address Input */}
        <div className="relative flex-1 z-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder={placeholder}
            required={required}
            className={`pl-10 pr-4 h-12 sm:h-10 text-base ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-coffee-400'}`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-500"></div>
            </div>
          )}
        </div>

        {/* Location Picker Button */}
        <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="px-4 h-12 sm:px-3 sm:h-10 border-gray-300 hover:border-coffee-400 whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 sm:mr-0 mr-2" />
              <span className="sm:hidden">Choose on Map</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Select Business Location</DialogTitle>
            </DialogHeader>
            <LocationPicker
              initialAddress={value}
              initialCoordinates={coordinates}
              onLocationSelect={handleLocationPickerSelect}
              onCancel={() => setShowLocationPicker(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <Card
          ref={resultsRef}
          className="absolute z-[9999] w-full mt-1 max-h-60 sm:max-h-48 overflow-y-auto bg-white border shadow-xl rounded-lg"
          style={{ top: '100%' }}
        >
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

      {/* Coordinates Display */}
      {coordinates && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            <Navigation className="w-3 h-3 mr-1" />
            {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </Badge>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          </span>
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        Start typing to search for addresses, or click <MapPin className="w-3 h-3 inline mx-1" /> to use the map picker
      </p>
    </div>
  );
};
