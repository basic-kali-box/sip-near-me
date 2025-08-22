/**
 * Moroccan Phone Number Validation and Normalization Utility
 * 
 * This utility handles Moroccan phone numbers and normalizes them for WhatsApp API
 * WhatsApp requires E.164 format: +212XXXXXXXXX (always starts with +212, followed by 9 digits)
 * 
 * Supported input formats:
 * - 212606060606 (with country code, no leading 0)
 * - 2120606060606 (with country code and leading 0 - needs normalization)
 * - 0606060606 (local format with leading 0)
 * - 606060606 (local format without leading 0)
 */

/**
 * Validation result interface
 */
export interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber: string; // E.164 format: +212XXXXXXXXX
  cleanNumber: string; // Without + prefix: 212XXXXXXXXX
  displayNumber: string; // Formatted for display: +212 6XX XXX XXX
  errorMessage?: string;
  inputFormat: 'local' | 'local_with_zero' | 'international' | 'international_with_zero' | 'invalid';
}

/**
 * Normalizes Moroccan phone number to WhatsApp E.164 format
 * 
 * @param phoneNumber - Raw phone number input
 * @returns PhoneValidationResult with validation status and normalized number
 */
export const validateAndNormalizeMoroccanPhone = (phoneNumber: string): PhoneValidationResult => {
  // Initialize result object
  const result: PhoneValidationResult = {
    isValid: false,
    normalizedNumber: '',
    cleanNumber: '',
    displayNumber: '',
    inputFormat: 'invalid'
  };

  // Step 1: Basic input validation
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    result.errorMessage = 'Phone number is required';
    return result;
  }

  // Step 2: Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  if (!digitsOnly) {
    result.errorMessage = 'Phone number must contain digits';
    return result;
  }

  // Step 3: Apply normalization rules
  let normalizedDigits = '';

  if (digitsOnly.startsWith('2120')) {
    // Rule 2: If starts with 2120, remove the 0 → becomes 212XXXXXXXXX
    normalizedDigits = '212' + digitsOnly.substring(4);
    result.inputFormat = 'international_with_zero';
  } else if (digitsOnly.startsWith('212')) {
    // Rule 4: If already starts with 212, keep as is
    normalizedDigits = digitsOnly;
    result.inputFormat = 'international';
  } else if (digitsOnly.startsWith('0')) {
    // Rule 3: If starts with 0, replace with 212
    normalizedDigits = '212' + digitsOnly.substring(1);
    result.inputFormat = 'local_with_zero';
  } else {
    // Rule 5: Otherwise, assume local number and prepend 212
    normalizedDigits = '212' + digitsOnly;
    result.inputFormat = 'local';
  }

  // Step 4: Validate final format
  const whatsappRegex = /^212[6-7]\d{8}$/;
  
  if (!whatsappRegex.test(normalizedDigits)) {
    result.errorMessage = 'Invalid Moroccan phone number. Must be a valid mobile number starting with 6 or 7';
    return result;
  }

  // Step 5: Ensure exactly 12 digits (212 + 9 digits)
  if (normalizedDigits.length !== 12) {
    result.errorMessage = 'Invalid phone number length. Moroccan mobile numbers should have 9 digits after country code';
    return result;
  }

  // Step 6: Success - populate result
  result.isValid = true;
  result.cleanNumber = normalizedDigits;
  result.normalizedNumber = '+' + normalizedDigits;
  result.displayNumber = formatMoroccanPhoneForDisplay(normalizedDigits);

  return result;
};

/**
 * Formats a normalized Moroccan phone number for display
 * 
 * @param normalizedDigits - 12-digit normalized number (212XXXXXXXXX)
 * @returns Formatted display string (+212 6XX XXX XXX)
 */
export const formatMoroccanPhoneForDisplay = (normalizedDigits: string): string => {
  if (normalizedDigits.length !== 12 || !normalizedDigits.startsWith('212')) {
    return normalizedDigits;
  }

  const countryCode = normalizedDigits.substring(0, 3); // 212
  const firstPart = normalizedDigits.substring(3, 4);   // 6 or 7
  const secondPart = normalizedDigits.substring(4, 6);  // XX
  const thirdPart = normalizedDigits.substring(6, 9);   // XXX
  const fourthPart = normalizedDigits.substring(9, 12); // XXX

  return `+${countryCode} ${firstPart}${secondPart} ${thirdPart} ${fourthPart}`;
};

/**
 * Quick validation function - returns boolean only
 * 
 * @param phoneNumber - Raw phone number input
 * @returns true if valid Moroccan mobile number
 */
export const isValidMoroccanPhone = (phoneNumber: string): boolean => {
  const result = validateAndNormalizeMoroccanPhone(phoneNumber);
  return result.isValid;
};

/**
 * Quick normalization function - returns E.164 format or empty string
 * 
 * @param phoneNumber - Raw phone number input
 * @returns E.164 formatted number (+212XXXXXXXXX) or empty string if invalid
 */
export const normalizeMoroccanPhoneForWhatsApp = (phoneNumber: string): string => {
  const result = validateAndNormalizeMoroccanPhone(phoneNumber);
  return result.isValid ? result.normalizedNumber : '';
};

/**
 * Get clean number for WhatsApp API (without + prefix)
 * 
 * @param phoneNumber - Raw phone number input
 * @returns Clean number (212XXXXXXXXX) or empty string if invalid
 */
export const getMoroccanPhoneForWhatsAppAPI = (phoneNumber: string): string => {
  const result = validateAndNormalizeMoroccanPhone(phoneNumber);
  return result.isValid ? result.cleanNumber : '';
};

/**
 * Validates phone number and returns user-friendly error message
 * 
 * @param phoneNumber - Raw phone number input
 * @returns Error message or null if valid
 */
export const getMoroccanPhoneValidationError = (phoneNumber: string): string | null => {
  const result = validateAndNormalizeMoroccanPhone(phoneNumber);
  return result.isValid ? null : (result.errorMessage || 'Invalid phone number');
};

/**
 * Test cases for validation (useful for debugging)
 */
export const testMoroccanPhoneValidation = () => {
  const testCases = [
    '212606060606',    // Valid international format
    '2120606060606',   // International with leading 0 (should normalize)
    '0606060606',      // Local with leading 0
    '606060606',       // Local without leading 0
    '0706060606',      // Local with 7 prefix
    '212506060606',    // Invalid - starts with 5
    '21260606060',     // Invalid - too short
    '2126060606066',   // Invalid - too long
    '123456789',       // Invalid format
    '',                // Empty
    'abc123',          // Invalid characters
  ];

  console.log('🧪 Testing Moroccan Phone Validation:');
  testCases.forEach(testCase => {
    const result = validateAndNormalizeMoroccanPhone(testCase);
    console.log(`Input: "${testCase}" → Valid: ${result.isValid}, Normalized: "${result.normalizedNumber}", Display: "${result.displayNumber}", Format: ${result.inputFormat}`);
    if (!result.isValid) {
      console.log(`  Error: ${result.errorMessage}`);
    }
  });
};

// Make test function available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testMoroccanPhoneValidation = testMoroccanPhoneValidation;
}
