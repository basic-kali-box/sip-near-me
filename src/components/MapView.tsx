import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Locate, Route, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSellers, Seller } from "@/data/mockSellers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ORS_CONFIG, ORS_ERRORS } from "@/config/openroute";

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

  const [hoveredSeller, setHoveredSeller] = useState<Seller | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access Denied",
            description: "Using default location. Enable location access for better experience.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

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

  const handleGetDirections = async (seller: Seller) => {
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

    // Mock seller coordinates (in a real app, these would come from the seller data)
    const sellerCoords: [number, number] = [
      userLocation.lng + (Math.random() - 0.5) * 0.02, // Random nearby location
      userLocation.lat + (Math.random() - 0.5) * 0.02
    ];

    const route = await getRoute(
      [userLocation.lng, userLocation.lat],
      sellerCoords
    );

    if (route) {
      setRouteInfo(route);
      toast({
        title: "Route Calculated",
        description: `${route.distance.toFixed(1)}km • ${Math.round(route.duration)} min drive`,
      });
    }

    setIsLoadingRoute(false);
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      toast({
        title: "Location Updated",
        description: "Map centered on your current location.",
      });
    } else {
      toast({
        title: "Location Unavailable",
        description: "Unable to access your current location.",
        variant: "destructive",
      });
    }
  };

  // Enhanced map implementation with OpenRouteService integration
  const MapPlaceholder = () => (
    <div className="relative w-full h-full bg-gradient-fresh rounded-lg border border-border/50 overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
      
      {/* Street grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-muted-foreground/10" />
          ))}
        </div>
      </div>

      {/* Seller pins */}
      {mockSellers.map((seller, index) => (
        <div
          key={seller.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index % 3) * 20}%`,
          }}
          onMouseEnter={() => setHoveredSeller(seller)}
          onMouseLeave={() => setHoveredSeller(null)}
          onClick={() => navigate(`/seller/${seller.id}`)}
          onDoubleClick={() => handleGetDirections(seller)}
        >
          <div className={`relative transition-all duration-200 ${
            hoveredSeller?.id === seller.id ? 'scale-110' : ''
          }`}>
            <div className="w-8 h-8 bg-primary rounded-full border-2 border-background shadow-floating flex items-center justify-center animate-pulse-glow">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            {/* Pin label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-card border border-border/50">
                {seller.name}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* User location */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-background shadow-lg animate-pulse" />
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
      </div>

      {/* Enhanced Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm hover:bg-primary/10"
          onClick={handleCenterOnUser}
          disabled={!userLocation}
        >
          <Locate className="w-4 h-4" />
        </Button>
        {selectedSeller && (
          <Button
            size="sm"
            variant="outline"
            className="bg-background/80 backdrop-blur-sm hover:bg-primary/10"
            onClick={() => {
              setRouteInfo(null);
              setSelectedSeller(null);
            }}
          >
            <Route className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Route visualization */}
      {routeInfo && routeInfo.coordinates.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
          <polyline
            points={routeInfo.coordinates.map((coord, index) => {
              const x = 50 + (index / routeInfo.coordinates.length) * 30;
              const y = 50 + Math.sin(index * 0.5) * 10;
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="3"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Mock street labels */}
      <div className="absolute top-12 left-8 text-xs text-muted-foreground font-medium bg-background/60 px-2 py-1 rounded">
        Main Street
      </div>
      <div className="absolute bottom-20 right-12 text-xs text-muted-foreground font-medium bg-background/60 px-2 py-1 rounded rotate-90">
        Broadway
      </div>

      {/* Instructions */}
      {!selectedSeller && (
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/30">
          💡 Double-click a seller pin to get directions
        </div>
      )}
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Map Controls Header */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {mockSellers.length} sellers nearby
          </Badge>
          {userLocation && (
            <Badge variant="secondary" className="text-xs">
              <Locate className="w-3 h-3 mr-1" />
              Location enabled
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
                  // Open in external maps app
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSeller.name}`;
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

      {/* Map area */}
      <div className="flex-1 p-4">
        <MapPlaceholder />
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