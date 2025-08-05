# OpenRouteService Integration Setup

This guide explains how to set up OpenRouteService for real routing and navigation in the MapView component.

## 🚀 Quick Start

### 1. Get Your API Key

1. Visit [OpenRouteService Developer Portal](https://openrouteservice.org/dev/#/signup)
2. Create a free account
3. Generate your API key
4. Copy the API key for configuration

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# OpenRouteService API Key (Vite environment variable)
VITE_ORS_API_KEY=your_actual_api_key_here
```

### 3. Update Configuration

The API key will be automatically loaded from the environment variable in `src/config/openroute.ts`.

## 📊 API Limits (Free Tier)

- **Daily Requests**: 2,000 per day
- **Rate Limit**: 40 requests per minute
- **Routing Points**: Up to 50 coordinates per request

## 🗺️ Features Implemented

### Current Features

- ✅ **Real-time Routing**: Calculate actual routes between user and sellers
- ✅ **Distance & Duration**: Get accurate travel time and distance
- ✅ **Interactive Map**: Click/double-click sellers for directions
- ✅ **Route Visualization**: Visual route display on map
- ✅ **Location Services**: GPS-based user location
- ✅ **External Navigation**: Open routes in Google Maps/Apple Maps

### Map Interactions

1. **View Sellers**: Hover over seller pins to see details
2. **Get Directions**: Double-click any seller pin to calculate route
3. **Navigate**: Click "Navigate" button to open in external maps app
4. **Center Map**: Use "My Location" button to center on your position

## 🔧 Technical Implementation

### Routing Profiles Supported

- `driving-car` - Car routing (default)
- `foot-walking` - Walking directions
- `cycling-regular` - Bicycle routing
- `driving-hgv` - Heavy vehicle routing
- `wheelchair` - Wheelchair accessible routes

### API Endpoints Used

- **Directions API**: `/v2/directions/{profile}`
- **Geocoding**: `/geocode/search` (future enhancement)
- **Isochrones**: `/v2/isochrones/{profile}` (future enhancement)

## 🛠️ Customization

### Change Routing Profile

Edit `src/config/openroute.ts`:

```typescript
export const ORS_CONFIG = {
  PROFILE: 'foot-walking', // Change to walking directions
  // ... other config
};
```

### Adjust Rate Limiting

The app includes built-in rate limiting to respect API quotas:

```typescript
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 40,
  REQUESTS_PER_DAY: 2000,
};
```

## 🚨 Error Handling

The implementation includes comprehensive error handling:

- **Network Errors**: Automatic retry with user feedback
- **Rate Limiting**: Graceful degradation when limits exceeded
- **Invalid Routes**: Clear messaging when no route found
- **Location Errors**: Fallback to default location

## 🔮 Future Enhancements

### Planned Features

- [ ] **Isochrone Maps**: Show reachable areas within time/distance
- [ ] **Multiple Route Options**: Display alternative routes
- [ ] **Real-time Traffic**: Integration with traffic data
- [ ] **Route Optimization**: Multi-stop route planning
- [ ] **Offline Maps**: Cached map tiles for offline use

### Advanced Features

- [ ] **Geocoding**: Address search and reverse geocoding
- [ ] **POI Search**: Find nearby points of interest
- [ ] **Route Preferences**: Avoid highways, tolls, etc.
- [ ] **Elevation Profiles**: Show route elevation changes

## 📱 Mobile Optimization

The MapView is fully optimized for mobile devices:

- **Touch Gestures**: Pinch to zoom, drag to pan
- **Responsive Design**: Adapts to all screen sizes
- **Performance**: Optimized for mobile networks
- **Battery Efficient**: Minimal location polling

## 🔒 Security & Privacy

- **API Key Protection**: Environment variables keep keys secure
- **Location Privacy**: User location never stored permanently
- **HTTPS Only**: All API calls use secure connections
- **Rate Limiting**: Prevents API abuse and quota exhaustion

## 📞 Support

For issues with OpenRouteService integration:

1. Check the browser console for error messages
2. Verify your API key is correctly configured
3. Ensure you haven't exceeded rate limits
4. Check OpenRouteService status page for service issues

## 🌟 Pro Tips

1. **Cache Routes**: Store calculated routes to reduce API calls
2. **Batch Requests**: Calculate multiple routes efficiently
3. **Fallback Options**: Always have backup routing options
4. **User Feedback**: Provide clear loading and error states
5. **Performance**: Debounce rapid route requests

---

**Ready to navigate!** 🧭 Your MapView now has professional-grade routing capabilities powered by OpenRouteService.
