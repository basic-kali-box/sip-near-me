# ItemCard Three-Action Implementation

## Overview

The ItemCard component now features three key actions per product, designed with mobile-first UX principles:

1. **Order via WhatsApp** (Primary action)
2. **View Shop** (Secondary action)
3. **See Location** (Secondary action)

## Design Strategy

### Layout Hierarchy

```
┌─────────────────────────────────┐
│         Product Info            │
│      (Image, Name, Price)       │
├─────────────────────────────────┤
│    [Order via WhatsApp]         │ ← Primary (full width)
├─────────────────┬───────────────┤
│   [View Shop]   │  [Location]   │ ← Secondary (half width each)
└─────────────────┴───────────────┘
```

### Mobile-First Approach

- **Primary Action**: WhatsApp button gets full width and prominent green styling
- **Secondary Actions**: Split into two columns below the primary action
- **Responsive Text**: Full text on desktop, abbreviated on mobile
- **Touch-Friendly**: Adequate button sizes for mobile interaction

## Features

### 1. WhatsApp Ordering

- **Color**: Official WhatsApp green (#25D366)
- **Icon**: Official WhatsApp logo SVG
- **Message**: Pre-filled with product details using `createProductInterestMessage()`
- **Tracking**: Contact attempts tracked via `trackContactAttempt()`

**Smart States:**
- Disabled when item is unavailable
- Disabled when seller has no phone number
- Visual feedback for disabled state

### 2. View Shop

- **Icon**: Store icon from Lucide React
- **Action**: Calls `onViewSeller` prop with seller ID
- **Responsive**: "View Shop" on desktop, "Shop" on mobile

### 3. See Location

- **Icon**: MapPin icon with external link indicator
- **Action**: Opens Google Maps with seller's precise location
- **GPS Priority**: Uses exact GPS coordinates when available, falls back to address-based location
- **URL Formats**:
  - With GPS: `https://www.google.com/maps/search/?api=1&query={latitude},{longitude}`
  - Fallback: `https://www.google.com/maps/search/?api=1&query={encodedAddress}`
- **Target**: Opens in new tab/window

**Smart States:**
- Hidden when seller has no address
- External link icon indicates it opens in new window
- Prioritizes precise GPS coordinates for better accuracy

## Implementation Details

### Component Props

```typescript
interface ItemCardProps {
  item: ItemCardItem;
  onAddToCart?: (item: ItemCardItem) => void;
  onViewSeller?: (sellerId: string) => void;
  className?: string;
}
```

### Key Functions

```typescript
// WhatsApp ordering with pre-filled message
const handleWhatsAppOrder = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (item.seller?.phone) {
    const message = createProductInterestMessage(
      item.name,
      item.price,
      item.seller.specialty
    );
    sendWhatsAppMessage(item.seller.phone, message);
    trackContactAttempt(item.seller.id, 'whatsapp');
  }
};

// Google Maps integration with GPS priority
const handleViewLocation = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (!item.seller) return;

  // Use exact coordinates if available, otherwise fall back to address
  if (item.seller.latitude && item.seller.longitude) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${item.seller.latitude},${item.seller.longitude}`;
    window.open(mapsUrl, '_blank');
  } else if (item.seller.address) {
    const encodedAddress = encodeURIComponent(item.seller.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }
};
```

### WhatsApp Message Template

The `createProductInterestMessage()` function generates:

```
🍵 Hi! I'm interested in ordering "Premium Matcha Latte" (45.00 Dh) from your matcha business.

Could you please confirm:
• Current availability
• Pickup/delivery options
• Estimated preparation time

Thanks!
_Sent via Machroub_
```

## Styling

### CSS Classes

- **Primary Button**: `bg-[#25D366] hover:bg-[#20BA5A]` (WhatsApp colors)
- **Secondary Buttons**: `variant="outline"` with hover effects
- **Responsive Grid**: `grid-cols-2 gap-2` for secondary actions
- **Mobile Text**: `hidden sm:inline` and `sm:hidden` for responsive text

### Accessibility

- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Clear visual hierarchy
- Disabled state indicators

## Testing

### Demo Page

Visit `/itemcard-demo` to see:
- All three actions in different states
- Mobile responsive behavior
- Error handling (no phone, no address, unavailable items)
- Visual feedback and interactions

### Test Cases

1. **Available Item with Full Data**: All three actions enabled
2. **Unavailable Item**: WhatsApp disabled, other actions available
3. **No Phone Number**: WhatsApp disabled
4. **No Address**: Location action hidden
5. **Mobile View**: Responsive text and layout

## Integration

### ListView Integration

The ListView component passes the appropriate handlers:

```typescript
<ItemCard
  key={item.id}
  item={item}
  onAddToCart={(item) => onStartOrder?.(item)}
  onViewSeller={(sellerId) => navigate(`/seller/${sellerId}`)}
  className="w-full"
/>
```

### Analytics Tracking

Contact attempts are tracked for analytics:

```typescript
trackContactAttempt(sellerId, 'whatsapp');
```

## Future Enhancements

1. **Floating Action Bar**: For item detail pages
2. **Quick Order Variants**: Size/customization options
3. **Favorite/Save**: Bookmark products
4. **Share Product**: Social sharing functionality
5. **Estimated Delivery**: Time and distance calculations

## Browser Compatibility

- **WhatsApp Links**: Supported on all modern browsers and mobile devices
- **Google Maps**: Universal support with fallback to web version
- **External Links**: Proper `_blank` target with security considerations
