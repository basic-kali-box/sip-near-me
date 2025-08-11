import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { reverseGeocode, getCurrentLocation, type Coordinates } from '@/utils/geocoding';

// Dynamic import for Leaflet to ensure it only loads in browser
let L: any = null;

// Initialize Leaflet only in browser environment
const initializeLeaflet = async () => {
  if (typeof window !== 'undefined' && !L) {
    L = await import('leaflet');

    // Fix for default markers in Leaflet with Vite/Vercel
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
  return L;
};

interface InteractiveMapProps {
  center: Coordinates;
  zoom?: number;
  selectedLocation?: Coordinates | null;
  onLocationSelect: (coordinates: Coordinates) => void;
  className?: string;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  zoom = 13,
  selectedLocation,
  onLocationSelect,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        const leaflet = await initializeLeaflet();
        if (!leaflet || !mapRef.current) return;

        // Create map instance
        const map = leaflet.map(mapRef.current).setView([center.latitude, center.longitude], zoom);

        // Add tile layer (OpenStreetMap)
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Handle map clicks
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;
          const coordinates: Coordinates = { latitude: lat, longitude: lng };

          // Update marker position
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = leaflet.marker([lat, lng]).addTo(map);
          }

          // Call the callback
          onLocationSelect(coordinates);

          // Optional: Show address in popup
          try {
            setIsLoading(true);
            const address = await reverseGeocode(lat, lng);
            if (address && markerRef.current) {
              markerRef.current.bindPopup(address).openPopup();
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          } finally {
            setIsLoading(false);
          }
        });

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        toast({
          title: "Map Error",
          description: "Failed to load interactive map. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.latitude, center.longitude], zoom);
    }
  }, [center, zoom]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedLocation) {
      if (markerRef.current) {
        markerRef.current.setLatLng([selectedLocation.latitude, selectedLocation.longitude]);
      } else {
        markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
          .addTo(mapInstanceRef.current);
      }
      
      // Center map on selected location
      mapInstanceRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], zoom);
    } else if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [selectedLocation, zoom]);

  // Center map on user's current location
  const handleCenterOnUser = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
      }
      
      toast({
        title: "Location Found",
        description: "Map centered on your current location",
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-300 overflow-hidden"
        style={{ height }}
      />

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCenterOnUser}
          disabled={isLoading}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md h-10 w-10 sm:h-8 sm:w-8 p-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-500"></div>
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-md text-xs sm:text-sm py-2 px-3">
          <Crosshair className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="hidden sm:inline">Click on the map to select your exact business location</span>
          <span className="sm:hidden">Tap to select location</span>
        </Badge>
      </div>

      {/* Selected Coordinates Display */}
      {selectedLocation && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 max-w-[calc(100%-6rem)] sm:max-w-none">
          <Badge variant="secondary" className="bg-green-100/90 backdrop-blur-sm border-green-300 text-green-800 shadow-md text-xs py-1 px-2">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </span>
          </Badge>
        </div>
      )}
    </div>
  );
};
