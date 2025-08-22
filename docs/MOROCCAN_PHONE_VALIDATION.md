# 🇲🇦 Moroccan Phone Number Validation System

This system provides comprehensive validation and normalization of Moroccan phone numbers for WhatsApp API integration.

## 📋 Overview

The phone validation system handles various input formats from Moroccan users and normalizes them to the E.164 format required by WhatsApp API.

### WhatsApp Requirements
- **Format**: `+212XXXXXXXXX`
- **Structure**: Always starts with `+212`, followed by exactly 9 digits
- **Mobile prefixes**: Must start with `6` or `7` after the country code
- **No leading zero**: After country code (212), there should be no leading 0

## 🔧 Implementation

### Core Files
- `src/utils/moroccanPhoneValidation.ts` - Main validation logic
- `src/components/ui/moroccan-phone-input.tsx` - Reusable input component
- `src/pages/PhoneValidationDemo.tsx` - Demo and testing page
- `src/utils/__tests__/moroccanPhoneValidation.test.ts` - Unit tests

### Integration Points
- `src/utils/whatsapp.ts` - Updated to use Moroccan validation
- `src/pages/CompleteProfile.tsx` - Enhanced phone input with validation
- `src/utils/sellerProfileValidation.ts` - Updated validation rules

## 📱 Supported Input Formats

| Input Format | Description | Example | Normalized Output |
|--------------|-------------|---------|-------------------|
| `212606060606` | International (correct) | `212606060606` | `+212606060606` |
| `2120606060606` | International with leading 0 | `2120606060606` | `+212606060606` |
| `0606060606` | Local with leading 0 | `0606060606` | `+212606060606` |
| `606060606` | Local without leading 0 | `606060606` | `+212606060606` |
| `+212 606 060 606` | Formatted international | `+212 606 060 606` | `+212606060606` |

## 🛠️ API Reference

### `validateAndNormalizeMoroccanPhone(phoneNumber: string)`

Main validation function that returns comprehensive validation results.

```typescript
interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber: string; // E.164 format: +212XXXXXXXXX
  cleanNumber: string; // Without + prefix: 212XXXXXXXXX
  displayNumber: string; // Formatted: +212 6XX XXX XXX
  errorMessage?: string;
  inputFormat: 'local' | 'local_with_zero' | 'international' | 'international_with_zero' | 'invalid';
}
```

**Example:**
```typescript
const result = validateAndNormalizeMoroccanPhone('0606060606');
// Returns:
// {
//   isValid: true,
//   normalizedNumber: '+212606060606',
//   cleanNumber: '212606060606',
//   displayNumber: '+212 60 606 0606',
//   inputFormat: 'local_with_zero'
// }
```

### Quick Helper Functions

```typescript
// Boolean validation
isValidMoroccanPhone('0606060606') // true

// Get E.164 format
normalizeMoroccanPhoneForWhatsApp('0606060606') // '+212606060606'

// Get clean number for API
getMoroccanPhoneForWhatsAppAPI('0606060606') // '212606060606'

// Get formatted display
formatMoroccanPhoneForDisplay('212606060606') // '+212 60 606 0606'

// Get validation error
getMoroccanPhoneValidationError('invalid') // 'Error message'
```

## 🎯 Validation Rules

### Step-by-Step Normalization Process

1. **Input Sanitization**: Remove all non-digit characters
2. **Format Detection & Normalization**:
   - If starts with `2120` → Remove the 0 → `212XXXXXXXXX`
   - If starts with `212` → Keep as is → `212XXXXXXXXX`
   - If starts with `0` → Replace with `212` → `212XXXXXXXXX`
   - Otherwise → Prepend `212` → `212XXXXXXXXX`
3. **Validation**: Check against regex `/^212[6-7]\d{8}$/`
4. **Length Check**: Must be exactly 12 digits total

### Validation Criteria
- ✅ Must be exactly 12 digits after normalization
- ✅ Must start with `212` (Morocco country code)
- ✅ Next digit must be `6` or `7` (mobile prefixes)
- ✅ Followed by exactly 8 more digits
- ❌ Cannot start with `5`, `8`, `9` after country code
- ❌ Cannot be shorter or longer than required

## 🧪 Testing

### Run Unit Tests
```bash
npm test moroccanPhoneValidation
```

### Interactive Testing
Visit `/phone-validation-demo` page to test various input formats interactively.

### Console Testing
```javascript
// In browser console
testMoroccanPhoneValidation()
```

### Test Cases
```typescript
const testCases = [
  { input: '212606060606', expected: true },    // ✅ International
  { input: '2120606060606', expected: true },   // ✅ International with 0
  { input: '0606060606', expected: true },      // ✅ Local with 0
  { input: '606060606', expected: true },       // ✅ Local without 0
  { input: '0706060606', expected: true },      // ✅ Starts with 7
  { input: '212506060606', expected: false },   // ❌ Starts with 5
  { input: '21260606060', expected: false },    // ❌ Too short
  { input: '2126060606066', expected: false },  // ❌ Too long
];
```

## 🎨 UI Components

### MoroccanPhoneInput Component

Reusable phone input component with built-in validation and formatting.

```tsx
<MoroccanPhoneInput
  value={phoneNumber}
  onChange={setPhoneNumber}
  label="Phone Number"
  required
  showValidationFeedback
  showFormattedPreview
  onValidationChange={(isValid, normalized) => {
    console.log('Valid:', isValid, 'Normalized:', normalized);
  }}
/>
```

**Features:**
- 📱 Real-time validation feedback
- 🎨 Visual success/error states
- 📋 Formatted preview for valid numbers
- 🔍 Helpful input format examples
- ♿ Full accessibility support
- 📱 Mobile-optimized touch targets

## 🔗 WhatsApp Integration

The validation system is integrated with the WhatsApp messaging functionality:

```typescript
// Updated sendWhatsAppMessage function
sendWhatsAppMessage(phoneNumber, message);
// Automatically normalizes Moroccan numbers for WhatsApp API
```

**Benefits:**
- ✅ Ensures all phone numbers work with WhatsApp
- ✅ Prevents failed message attempts
- ✅ Consistent formatting across the application
- ✅ Better user experience with clear validation feedback

## 🚀 Usage Examples

### In Forms
```tsx
const [phone, setPhone] = useState('');
const [isValidPhone, setIsValidPhone] = useState(false);

<MoroccanPhoneInput
  value={phone}
  onChange={setPhone}
  onValidationChange={(valid) => setIsValidPhone(valid)}
  required
/>
```

### For WhatsApp Messaging
```typescript
const handleSendMessage = () => {
  const normalizedPhone = normalizeMoroccanPhoneForWhatsApp(userPhone);
  if (normalizedPhone) {
    sendWhatsAppMessage(normalizedPhone, message);
  }
};
```

### In Validation
```typescript
const validateSellerProfile = (profile) => {
  const phoneValidation = validateAndNormalizeMoroccanPhone(profile.phone);
  if (!phoneValidation.isValid) {
    return { error: phoneValidation.errorMessage };
  }
  // Continue with other validations...
};
```

## 🔧 Configuration

The validation system is designed specifically for Moroccan mobile numbers but can be extended:

- **Country Code**: `212` (Morocco)
- **Mobile Prefixes**: `6`, `7`
- **Total Length**: 12 digits (including country code)
- **Display Format**: `+212 XX XXX XXXX`

## 📈 Benefits

1. **User Experience**: Users can enter phone numbers in any familiar format
2. **WhatsApp Compatibility**: All numbers are guaranteed to work with WhatsApp API
3. **Error Prevention**: Clear validation prevents failed messaging attempts
4. **Consistency**: Standardized phone number handling across the application
5. **Accessibility**: Full screen reader and keyboard navigation support
6. **Mobile Optimized**: Touch-friendly inputs with proper validation feedback
