# Interactive Location Picker Implementation

This document describes the implementation of the interactive location picker using OpenRouteService (ORS) for accurate seller business location selection.

## Overview

The location picker system consists of several components that work together to provide sellers with an accurate way to specify their exact business location:

1. **Enhanced Geocoding Service** - ORS integration for address search and validation
2. **LocationPicker Component** - Interactive map-based location selection
3. **AddressInput Component** - Smart address input with autocomplete
4. **Integration with CompleteProfile** - Seamless seller onboarding experience

## Components

### 1. Enhanced Geocoding Service (`src/utils/geocoding.ts`)

**New Functions:**
- `geocodeAddress()` - Convert address to coordinates using ORS
- `searchAddresses()` - Autocomplete address search
- `reverseGeocode()` - Convert coordinates to address

**Features:**
- Real ORS API integration with fallback to default coordinates
- Error handling and rate limiting awareness
- Proper coordinate validation

### 2. LocationPicker Component (`src/components/LocationPicker.tsx`)

**Features:**
- Address search with autocomplete
- Current location detection
- Interactive map placeholder (ready for real map integration)
- Coordinate display and validation
- Reverse geocoding for map clicks

**Props:**
```typescript
interface LocationPickerProps {
  initialAddress?: string;
  initialCoordinates?: Coordinates;
  onLocationSelect: (address: string, coordinates: Coordinates) => void;
  onCancel?: () => void;
  className?: string;
}
```

### 3. AddressInput Component (`src/components/AddressInput.tsx`)

**Features:**
- Real-time address search with debouncing
- Dropdown results with coordinates
- Map picker integration via dialog
- Coordinate display badge
- Error handling and validation

**Props:**
```typescript
interface AddressInputProps {
  value: string;
  onChange: (address: string, coordinates?: Coordinates) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  coordinates?: Coordinates;
}
```

## Integration

### CompleteProfile Page Updates

The seller profile completion now includes:
- Enhanced address input with ORS integration
- Coordinate storage in form state
- Accurate coordinate saving to database
- Fallback to default coordinates if ORS fails

**Key Changes:**
```typescript
// Form state now includes coordinates
const [formData, setFormData] = useState({
  // ... other fields
  businessAddress: '',
  businessCoordinates: null as Coordinates | null,
});

// Address input with coordinate handling
<AddressInput
  value={formData.businessAddress}
  coordinates={formData.businessCoordinates}
  onChange={(address, coordinates) => {
    setFormData(prev => ({ 
      ...prev, 
      businessAddress: address,
      businessCoordinates: coordinates || null
    }));
  }}
  // ... other props
/>
```

## OpenRouteService Configuration

### Environment Variables
```env
VITE_ORS_API_KEY=your_ors_api_key_here
```

### API Endpoints Used
- **Geocoding**: `https://api.openrouteservice.org/geocode/search`
- **Autocomplete**: `https://api.openrouteservice.org/geocode/autocomplete`
- **Reverse Geocoding**: `https://api.openrouteservice.org/geocode/reverse`

### Rate Limits (Free Tier)
- 2000 requests per day
- 40 requests per minute

## Usage Examples

### Basic Address Input
```tsx
import { AddressInput } from '@/components/AddressInput';

function MyForm() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  return (
    <AddressInput
      value={address}
      coordinates={coordinates}
      onChange={(addr, coords) => {
        setAddress(addr);
        setCoordinates(coords || null);
      }}
      placeholder="Enter business address"
      required
    />
  );
}
```

### Standalone Location Picker
```tsx
import { LocationPicker } from '@/components/LocationPicker';

function LocationDialog() {
  const [showPicker, setShowPicker] = useState(false);

  const handleLocationSelect = (address: string, coordinates: Coordinates) => {
    console.log('Selected:', address, coordinates);
    setShowPicker(false);
  };

  return (
    <Dialog open={showPicker} onOpenChange={setShowPicker}>
      <DialogContent>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowPicker(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Testing

### Manual Testing
1. Open the seller profile completion page
2. Try typing an address in the business address field
3. Verify autocomplete suggestions appear
4. Click the map icon to open the location picker
5. Test current location detection
6. Verify coordinates are displayed and saved

### Programmatic Testing
```typescript
import { testGeocoding } from '@/utils/test-geocoding';

// Run in browser console
testGeocoding();
```

## Future Enhancements

### Real Map Integration
The current implementation uses a map placeholder. To integrate a real map:

1. **Leaflet Integration**:
```bash
npm install leaflet react-leaflet @types/leaflet
```

2. **Google Maps Integration**:
```bash
npm install @googlemaps/react-wrapper
```

3. **Mapbox Integration**:
```bash
npm install mapbox-gl react-map-gl
```

### Enhanced Features
- **Drag-and-drop pin positioning**
- **Satellite/street view toggle**
- **Nearby business detection**
- **Address validation with postal service APIs**
- **Bulk location import for multiple locations**

## Troubleshooting

### Common Issues

1. **No autocomplete results**
   - Check ORS API key is valid
   - Verify network connectivity
   - Check browser console for API errors

2. **Coordinates not saving**
   - Ensure form state includes coordinates
   - Check database schema supports latitude/longitude fields
   - Verify coordinate validation logic

3. **Rate limit exceeded**
   - Implement request caching
   - Add debouncing to search inputs
   - Consider upgrading ORS plan

### Error Handling
The system includes comprehensive error handling:
- Fallback to default coordinates if ORS fails
- User-friendly error messages
- Graceful degradation when API is unavailable

## Security Considerations

- ORS API key is exposed in frontend (normal for client-side geocoding)
- Consider implementing server-side geocoding for sensitive applications
- Rate limiting is handled by ORS, but implement client-side throttling
- Validate coordinates on backend before saving to database
