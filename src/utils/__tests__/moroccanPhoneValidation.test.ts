import { 
  validateAndNormalizeMoroccanPhone, 
  isValidMoroccanPhone, 
  normalizeMoroccanPhoneForWhatsApp,
  getMoroccanPhoneForWhatsAppAPI,
  formatMoroccanPhoneForDisplay 
} from '../moroccanPhoneValidation';

describe('Moroccan Phone Validation', () => {
  describe('validateAndNormalizeMoroccanPhone', () => {
    it('should handle international format without leading 0', () => {
      const result = validateAndNormalizeMoroccanPhone('212606060606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212606060606');
      expect(result.cleanNumber).toBe('212606060606');
      expect(result.displayNumber).toBe('+212 60 606 0606');
      expect(result.inputFormat).toBe('international');
    });

    it('should normalize international format with leading 0', () => {
      const result = validateAndNormalizeMoroccanPhone('2120606060606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212606060606');
      expect(result.cleanNumber).toBe('212606060606');
      expect(result.inputFormat).toBe('international_with_zero');
    });

    it('should handle local format with leading 0', () => {
      const result = validateAndNormalizeMoroccanPhone('0606060606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212606060606');
      expect(result.cleanNumber).toBe('212606060606');
      expect(result.inputFormat).toBe('local_with_zero');
    });

    it('should handle local format without leading 0', () => {
      const result = validateAndNormalizeMoroccanPhone('606060606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212606060606');
      expect(result.cleanNumber).toBe('212606060606');
      expect(result.inputFormat).toBe('local');
    });

    it('should handle numbers starting with 7', () => {
      const result = validateAndNormalizeMoroccanPhone('0706060606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212706060606');
      expect(result.cleanNumber).toBe('212706060606');
    });

    it('should reject numbers starting with invalid digits', () => {
      const result = validateAndNormalizeMoroccanPhone('0506060606');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Must be a valid mobile number starting with 6 or 7');
    });

    it('should reject numbers that are too short', () => {
      const result = validateAndNormalizeMoroccanPhone('060606060');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid phone number length');
    });

    it('should reject numbers that are too long', () => {
      const result = validateAndNormalizeMoroccanPhone('06060606066');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid phone number length');
    });

    it('should handle formatted input with spaces and symbols', () => {
      const result = validateAndNormalizeMoroccanPhone('+212 606 060 606');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('+212606060606');
    });

    it('should reject empty input', () => {
      const result = validateAndNormalizeMoroccanPhone('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Phone number is required');
    });

    it('should reject non-string input', () => {
      const result = validateAndNormalizeMoroccanPhone(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Phone number is required');
    });

    it('should reject input with no digits', () => {
      const result = validateAndNormalizeMoroccanPhone('abc-def');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Phone number must contain digits');
    });
  });

  describe('isValidMoroccanPhone', () => {
    it('should return true for valid numbers', () => {
      expect(isValidMoroccanPhone('212606060606')).toBe(true);
      expect(isValidMoroccanPhone('0606060606')).toBe(true);
      expect(isValidMoroccanPhone('606060606')).toBe(true);
      expect(isValidMoroccanPhone('0706060606')).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidMoroccanPhone('212506060606')).toBe(false);
      expect(isValidMoroccanPhone('060606060')).toBe(false);
      expect(isValidMoroccanPhone('')).toBe(false);
      expect(isValidMoroccanPhone('abc')).toBe(false);
    });
  });

  describe('normalizeMoroccanPhoneForWhatsApp', () => {
    it('should return E.164 format for valid numbers', () => {
      expect(normalizeMoroccanPhoneForWhatsApp('0606060606')).toBe('+212606060606');
      expect(normalizeMoroccanPhoneForWhatsApp('212606060606')).toBe('+212606060606');
      expect(normalizeMoroccanPhoneForWhatsApp('2120606060606')).toBe('+212606060606');
    });

    it('should return empty string for invalid numbers', () => {
      expect(normalizeMoroccanPhoneForWhatsApp('212506060606')).toBe('');
      expect(normalizeMoroccanPhoneForWhatsApp('')).toBe('');
      expect(normalizeMoroccanPhoneForWhatsApp('abc')).toBe('');
    });
  });

  describe('getMoroccanPhoneForWhatsAppAPI', () => {
    it('should return clean number without + for valid numbers', () => {
      expect(getMoroccanPhoneForWhatsAppAPI('0606060606')).toBe('212606060606');
      expect(getMoroccanPhoneForWhatsAppAPI('212606060606')).toBe('212606060606');
    });

    it('should return empty string for invalid numbers', () => {
      expect(getMoroccanPhoneForWhatsAppAPI('212506060606')).toBe('');
      expect(getMoroccanPhoneForWhatsAppAPI('')).toBe('');
    });
  });

  describe('formatMoroccanPhoneForDisplay', () => {
    it('should format normalized numbers correctly', () => {
      expect(formatMoroccanPhoneForDisplay('212606060606')).toBe('+212 60 606 0606');
      expect(formatMoroccanPhoneForDisplay('212706060606')).toBe('+212 70 606 0606');
    });

    it('should return original for invalid input', () => {
      expect(formatMoroccanPhoneForDisplay('invalid')).toBe('invalid');
      expect(formatMoroccanPhoneForDisplay('12345')).toBe('12345');
    });
  });
});
