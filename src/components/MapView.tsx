import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Locate, Route, Clock, AlertCircle, MapPinIcon, Coffee, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SellerService } from "@/services/sellerService";
import { subscribeToSellerAvailability, subscribeToNewSellers } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ORS_CONFIG, ORS_ERRORS } from "@/config/openroute";
import { getCurrentLocation, type Coordinates } from "@/utils/geocoding";

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

interface MapViewProps {
  className?: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

interface UserLocation {
  lat: number;
  lng: number;
}

// OpenRouteService integration with proper configuration

export const MapView = ({ className }: MapViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  type MapSeller = {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    photo_url?: string | null;
    latitude: number;
    longitude: number;
    rating?: number;
    reviewCount?: number;
  };

  const [sellers, setSellers] = useState<MapSeller[]>([]);
  const [hoveredSeller, setHoveredSeller] = useState<MapSeller | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<MapSeller | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable'>('loading');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [sellerMarkers, setSellerMarkers] = useState<any[]>([]);
  const [routePolyline, setRoutePolyline] = useState<any>(null);

  // Enhanced geolocation with better error handling
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationStatus('unavailable');
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support location services. Using default location.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setLocationStatus('granted');
          toast({
            title: "Location Found",
            description: `Located at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          });
        },
        (error) => {
          let errorMessage = "Unable to get your location. Using default location.";
          let errorTitle = "Location Error";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationStatus('denied');
              errorTitle = "Location Access Denied";
              errorMessage = "Please enable location access in your browser settings for better experience.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorTitle = "Location Unavailable";
              errorMessage = "Location information is unavailable. Check your GPS or network connection.";
              break;
            case error.TIMEOUT:
              errorTitle = "Location Timeout";
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorTitle = "Unknown Location Error";
              errorMessage = "An unknown error occurred while retrieving location.";
              break;
          }

          console.error('Geolocation error:', error);
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive",
          });

          // Set a default location (New York City)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setMapCenter(defaultLocation);
        },
        options
      );
    };

    getUserLocation();
  }, [toast]);

  // Load sellers when location or component mounts
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // If we have user location, use it; otherwise default to NYC
        const lat = userLocation?.lat ?? 40.7128;
        const lng = userLocation?.lng ?? -74.0060;
        const results = await SellerService.getNearbySellers(lat, lng, { radiusKm: 25, isAvailable: true });
        if (!mounted) return;
        const mapped = (results || []).map((s: any) => ({
          id: s.id,
          name: s.business_name,
          specialty: s.specialty,
          phone: s.phone,
          photo_url: s.photo_url,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          rating: Number(s.rating_average || 0),
          reviewCount: Number(s.rating_count || 0)
        }));
        setSellers(mapped);
      } catch (e) {
        console.error('Failed to load sellers for map', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userLocation]);

  // Real-time: refresh sellers on availability changes and new seller inserts
  useEffect(() => {
    const refreshSellers = async () => {
      try {
        const lat = userLocation?.lat ?? 40.7128;
        const lng = userLocation?.lng ?? -74.0060;
        const results = await SellerService.getNearbySellers(lat, lng, { radiusKm: 25, isAvailable: true });
        const mapped = (results || []).map((s: any) => ({
          id: s.id,
          name: s.business_name,
          specialty: s.specialty,
          phone: s.phone,
          photo_url: s.photo_url,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          rating: Number(s.rating_average || 0),
          reviewCount: Number(s.rating_count || 0)
        }));
        setSellers(mapped);
      } catch (e) {
        console.error('Failed to refresh sellers for map', e);
      }
    };

    const availability = subscribeToSellerAvailability(() => {
      refreshSellers();
    });

    const newSellers = subscribeToNewSellers(() => {
      refreshSellers();
    });

    return () => {
      try { availability.unsubscribe?.(); } catch {}
      try { newSellers.unsubscribe?.(); } catch {}
    };
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance || typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        const leaflet = await initializeLeaflet();
        if (!leaflet || !mapRef.current) return;

        // Create map instance
        const map = leaflet.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], 13);

        // Add tile layer (OpenStreetMap)
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        setMapInstance(map);
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
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
        setMapReady(false);
      }
    };
  }, []);

  // Update map center when user location changes
  useEffect(() => {
    if (mapInstance && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 13);
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [mapInstance, userLocation]);

  // Add seller markers to map
  useEffect(() => {
    if (!mapInstance || !L) return;

    // Clear existing markers
    sellerMarkers.forEach(marker => {
      mapInstance.removeLayer(marker);
    });

    // Add new markers
    const newMarkers = sellers.map(seller => {
      // Create custom icon based on specialty
      const iconColor = seller.specialty === 'matcha' ? '#10b981' : '#f59e0b'; // green for matcha, amber for coffee
      const iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${iconColor};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-seller-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([seller.latitude, seller.longitude], { icon: customIcon })
        .addTo(mapInstance);

      // Add popup with seller info
      const popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">${seller.name}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: capitalize;">${seller.specialty} specialist</p>
          ${seller.rating ? `<p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">⭐ ${seller.rating.toFixed(1)} (${seller.reviewCount || 0} reviews)</p>` : ''}
          <div style="display: flex; gap: 8px;">
            <button onclick="window.location.href='/seller/${seller.id}'" style="
              padding: 4px 8px;
              background-color: #3b82f6;
              color: white;
              font-size: 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">View Details</button>
            <button onclick="window.location.href='tel:${seller.phone}'" style="
              padding: 4px 8px;
              background-color: #10b981;
              color: white;
              font-size: 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">Call</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add event handlers
      marker.on('click', () => {
        setSelectedSeller(seller);
      });

      marker.on('mouseover', () => {
        setHoveredSeller(seller);
      });

      marker.on('mouseout', () => {
        setHoveredSeller(null);
      });

      return marker;
    });

    setSellerMarkers(newMarkers);
  }, [mapInstance, sellers, L]);

  // Add user location marker
  useEffect(() => {
    if (!mapInstance || !L || !userLocation) return;

    // Create user location marker
    const userIconHtml = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -10px;
          left: -10px;
          width: 40px;
          height: 40px;
          background-color: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-location-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapInstance)
      .bindPopup('<div style="padding: 8px; text-align: center;"><strong>Your Location</strong></div>');

    return () => {
      if (userMarker) {
        mapInstance.removeLayer(userMarker);
      }
    };
  }, [mapInstance, userLocation, L]);

  // OpenRouteService API functions
  const getRoute = async (start: [number, number], end: [number, number]): Promise<RouteInfo | null> => {
    if (!ORS_CONFIG.API_KEY) {
      toast({
        title: "Configuration Error",
        description: ORS_ERRORS.NO_API_KEY,
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch(`${ORS_CONFIG.BASE_URL}/directions/${ORS_CONFIG.PROFILE}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': ORS_CONFIG.API_KEY,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          coordinates: [start, end],
          format: 'geojson'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const route = data.features[0];

      return {
        distance: route.properties.segments[0].distance / 1000, // Convert to km
        duration: route.properties.segments[0].duration / 60, // Convert to minutes
        coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]) // Swap lng,lat to lat,lng
      };
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: "Routing Error",
        description: "Unable to calculate route. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleGetDirections = async (seller: MapSeller) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access to get directions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingRoute(true);
    setSelectedSeller(seller);

    if (seller.latitude == null || seller.longitude == null) {
      toast({ title: 'No coordinates for seller', description: 'This seller has no location set.' });
      setIsLoadingRoute(false);
      return;
    }
    const sellerCoords: [number, number] = [seller.longitude, seller.latitude];

    const route = await getRoute(
      [userLocation.lng, userLocation.lat],
      sellerCoords
    );

    if (route) {
      setRouteInfo(route);

      // Draw route on map
      if (mapInstance && L) {
        // Remove existing route
        if (routePolyline) {
          mapInstance.removeLayer(routePolyline);
        }

        // Convert coordinates to Leaflet format [lat, lng]
        const leafletCoords = route.coordinates.map(coord => [coord[1], coord[0]]);

        // Create polyline
        const polyline = L.polyline(leafletCoords, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(mapInstance);

        setRoutePolyline(polyline);

        // Fit map to show entire route
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [seller.latitude, seller.longitude]
        ]);
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      }

      toast({
        title: "Route Calculated",
        description: `${route.distance.toFixed(1)}km • ${Math.round(route.duration)} min drive`,
      });
    }

    setIsLoadingRoute(false);
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 15);
      toast({
        title: "Location Updated",
        description: "Map centered on your current location.",
      });
    } else if (!userLocation) {
      // Try to get location again
      if (navigator.geolocation) {
        toast({
          title: "Getting Location",
          description: "Attempting to locate you...",
        });

        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000 // 1 minute cache
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setMapCenter(location);
            toast({
              title: "Location Found",
              description: "Map centered on your current location.",
            });
          },
          (error) => {
            toast({
              title: "Location Unavailable",
              description: "Unable to access your current location. Please check your browser settings.",
              variant: "destructive",
            });
          },
          options
        );
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your browser doesn't support location services.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFitAllSellers = () => {
    if (mapInstance && L && sellers.length > 0) {
      const bounds = L.latLngBounds(sellers.map(seller => [seller.latitude, seller.longitude]));

      // Include user location if available
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }

      mapInstance.fitBounds(bounds, { padding: [20, 20] });

      toast({
        title: "View Updated",
        description: `Showing all ${sellers.length} nearby sellers`,
      });
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Add custom CSS for map markers and z-index fixes */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .custom-seller-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: white;
        }
        /* Ensure Leaflet map doesn't interfere with mobile sidebar */
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-control-container {
          z-index: 2 !important;
        }
        .leaflet-popup-pane {
          z-index: 3 !important;
        }
        /* Ensure mobile sidebar appears above everything */
        [data-mobile="true"] {
          z-index: 9999 !important;
        }
      `}</style>
      {/* Map Controls Header */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {sellers.length} sellers nearby
          {/* Real-time tags could be added here if needed */}
          </Badge>
          {locationStatus === 'granted' && userLocation && (
            <Badge variant="secondary" className="text-xs">
              <Locate className="w-3 h-3 mr-1" />
              Location enabled
            </Badge>
          )}
          {locationStatus === 'denied' && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Location blocked
            </Badge>
          )}
          {locationStatus === 'unavailable' && (
            <Badge variant="outline" className="text-xs">
              <MapPinIcon className="w-3 h-3 mr-1" />
              Default location
            </Badge>
          )}
          {isLoadingRoute && (
            <Badge variant="outline" className="text-xs animate-pulse">
              <Route className="w-3 h-3 mr-1" />
              Calculating route...
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCenterOnUser}
            disabled={!userLocation}
            className="text-xs"
          >
            <Locate className="w-4 h-4 mr-1" />
            My Location
          </Button>
        </div>
      </div>

      {/* Route Information Panel */}
      {routeInfo && selectedSeller && (
        <div className="p-4 bg-gradient-matcha/10 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-matcha rounded-lg flex items-center justify-center">
                <Route className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Route to {selectedSeller.name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {routeInfo.distance.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.round(routeInfo.duration)} min
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open in external maps app with exact coordinates
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSeller.latitude},${selectedSeller.longitude}`;
                  window.open(url, '_blank');
                }}
                className="text-xs"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Navigate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear route from map
                  if (routePolyline && mapInstance) {
                    mapInstance.removeLayer(routePolyline);
                    setRoutePolyline(null);
                  }
                  setRouteInfo(null);
                  setSelectedSeller(null);
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Help Panel */}
      {locationStatus === 'denied' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Enable Location Access</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                To get accurate directions and find nearby sellers, please enable location access:
              </p>
              <div className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                <p>• Click the location icon (🔒) in your browser's address bar</p>
                <p>• Select "Allow" for location permissions</p>
                <p>• Refresh the page to apply changes</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 p-4">
        <div className="relative w-full h-full rounded-lg border border-border/50 overflow-hidden">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full"
          />

          {/* Loading Overlay */}
          {!mapReady && (
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading interactive map...</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          {mapReady && (
            <div className="absolute top-4 right-4 space-y-2 z-10">
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80 backdrop-blur-sm hover:bg-primary/10"
                onClick={handleCenterOnUser}
                disabled={!userLocation}
                title="Center on your location"
              >
                <Locate className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80 backdrop-blur-sm hover:bg-primary/10"
                onClick={handleFitAllSellers}
                disabled={sellers.length === 0}
                title="Show all sellers"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Instructions */}
          {mapReady && !selectedSeller && (
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/30 z-10">
              💡 Click a seller marker to view details
            </div>
          )}
        </div>
      </div>

      {/* Hovered seller preview */}
      {hoveredSeller && (
        <div className="absolute bottom-24 md:bottom-8 left-4 right-4 z-20">
          <Card className="p-4 bg-background/95 backdrop-blur-md border-border/50 shadow-floating">
            <div className="flex gap-3 items-center">
              <img
                src={hoveredSeller.photo_url}
                alt={hoveredSeller.name}
                className="w-12 h-12 rounded-lg object-cover bg-gradient-fresh"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {hoveredSeller.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {hoveredSeller.specialty} • {hoveredSeller.distance}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    hoveredSeller && handleGetDirections(hoveredSeller);
                  }}
                  disabled={!userLocation || isLoadingRoute}
                  className="text-xs"
                >
                  {isLoadingRoute ? (
                    <AlertCircle className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => hoveredSeller && navigate(`/seller/${hoveredSeller.id}`)}
                  className="bg-gradient-matcha"
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-4" />

    </div>
  );
};