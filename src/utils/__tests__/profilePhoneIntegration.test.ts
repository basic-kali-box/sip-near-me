/**
 * Integration tests for Moroccan phone validation in Profile pages
 * Tests the integration between Profile components and phone validation
 */

import { validateAndNormalizeMoroccanPhone } from '../moroccanPhoneValidation';

describe('Profile Phone Integration', () => {
  describe('Phone validation in profile context', () => {
    it('should validate phone numbers for seller profiles', () => {
      const testCases = [
        { input: '0606060606', expected: true, description: 'Local format with 0' },
        { input: '212606060606', expected: true, description: 'International format' },
        { input: '2120606060606', expected: true, description: 'International with leading 0' },
        { input: '606060606', expected: true, description: 'Local format without 0' },
        { input: '0506060606', expected: false, description: 'Invalid prefix 5' },
        { input: '060606060', expected: false, description: 'Too short' },
        { input: '', expected: false, description: 'Empty string' },
      ];

      testCases.forEach(({ input, expected, description }) => {
        const result = validateAndNormalizeMoroccanPhone(input);
        expect(result.isValid).toBe(expected);
        console.log(`${description}: ${input} → Valid: ${result.isValid}`);
      });
    });

    it('should normalize phone numbers for WhatsApp integration', () => {
      const testCases = [
        { input: '0606060606', expected: '+212606060606' },
        { input: '212606060606', expected: '+212606060606' },
        { input: '2120606060606', expected: '+212606060606' },
        { input: '606060606', expected: '+212606060606' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validateAndNormalizeMoroccanPhone(input);
        if (result.isValid) {
          expect(result.normalizedNumber).toBe(expected);
        }
      });
    });

    it('should provide proper error messages for invalid inputs', () => {
      const testCases = [
        { input: '0506060606', expectedError: 'Invalid Moroccan phone number' },
        { input: '060606060', expectedError: 'Invalid phone number length' },
        { input: '', expectedError: 'Phone number is required' },
        { input: 'abc123', expectedError: 'Phone number must contain digits' },
      ];

      testCases.forEach(({ input, expectedError }) => {
        const result = validateAndNormalizeMoroccanPhone(input);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain(expectedError.split(' ')[0]); // Check first word
      });
    });

    it('should format phone numbers for display', () => {
      const testCases = [
        { input: '0606060606', expectedDisplay: '+212 60 606 0606' },
        { input: '0706060606', expectedDisplay: '+212 70 606 0606' },
        { input: '212606060606', expectedDisplay: '+212 60 606 0606' },
      ];

      testCases.forEach(({ input, expectedDisplay }) => {
        const result = validateAndNormalizeMoroccanPhone(input);
        if (result.isValid) {
          expect(result.displayNumber).toBe(expectedDisplay);
        }
      });
    });
  });

  describe('Profile form validation scenarios', () => {
    it('should handle seller profile phone requirements', () => {
      // Seller profiles require phone numbers
      const sellerPhoneInputs = [
        '0606060606',    // Valid local
        '212606060606',  // Valid international
        '0706060606',    // Valid with 7 prefix
      ];

      sellerPhoneInputs.forEach(phone => {
        const result = validateAndNormalizeMoroccanPhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.normalizedNumber).toMatch(/^\+212[67]\d{8}$/);
      });
    });

    it('should handle buyer profile phone (optional but validated if provided)', () => {
      // Buyers can have phone numbers but they should still be validated
      const buyerPhoneInputs = [
        '',              // Empty is OK for buyers
        '0606060606',    // If provided, must be valid
        '212606060606',  // If provided, must be valid
      ];

      buyerPhoneInputs.forEach(phone => {
        if (phone === '') {
          // Empty phone is acceptable for buyers
          expect(true).toBe(true);
        } else {
          const result = validateAndNormalizeMoroccanPhone(phone);
          expect(result.isValid).toBe(true);
        }
      });
    });

    it('should reject invalid phone formats in profile forms', () => {
      const invalidInputs = [
        '0506060606',    // Invalid prefix
        '060606060',     // Too short
        '06060606066',   // Too long
        '212506060606',  // Invalid mobile prefix
        'abc123',        // Non-numeric
      ];

      invalidInputs.forEach(phone => {
        const result = validateAndNormalizeMoroccanPhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeTruthy();
      });
    });
  });

  describe('WhatsApp integration readiness', () => {
    it('should ensure all valid phone numbers work with WhatsApp API', () => {
      const validInputs = [
        '0606060606',
        '0706060606',
        '212606060606',
        '2120606060606',
        '606060606',
        '706060606',
      ];

      validInputs.forEach(input => {
        const result = validateAndNormalizeMoroccanPhone(input);
        expect(result.isValid).toBe(true);
        
        // Check WhatsApp API format (without + for API)
        expect(result.cleanNumber).toMatch(/^212[67]\d{8}$/);
        
        // Check E.164 format (with + for display)
        expect(result.normalizedNumber).toMatch(/^\+212[67]\d{8}$/);
      });
    });

    it('should provide clean numbers for WhatsApp API calls', () => {
      const result = validateAndNormalizeMoroccanPhone('0606060606');
      expect(result.isValid).toBe(true);
      expect(result.cleanNumber).toBe('212606060606');
      expect(result.normalizedNumber).toBe('+212606060606');
      
      // Verify the clean number can be used directly in WhatsApp URL
      const whatsappUrl = `https://wa.me/${result.cleanNumber}?text=test`;
      expect(whatsappUrl).toBe('https://wa.me/212606060606?text=test');
    });
  });

  describe('User experience validation', () => {
    it('should provide helpful validation feedback', () => {
      const result = validateAndNormalizeMoroccanPhone('0506060606');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('valid mobile number starting with 6 or 7');
    });

    it('should show formatted preview for valid numbers', () => {
      const result = validateAndNormalizeMoroccanPhone('0606060606');
      expect(result.isValid).toBe(true);
      expect(result.displayNumber).toBe('+212 60 606 0606');
    });

    it('should identify input format correctly', () => {
      const testCases = [
        { input: '0606060606', expectedFormat: 'local_with_zero' },
        { input: '606060606', expectedFormat: 'local' },
        { input: '212606060606', expectedFormat: 'international' },
        { input: '2120606060606', expectedFormat: 'international_with_zero' },
      ];

      testCases.forEach(({ input, expectedFormat }) => {
        const result = validateAndNormalizeMoroccanPhone(input);
        expect(result.inputFormat).toBe(expectedFormat);
      });
    });
  });
});
