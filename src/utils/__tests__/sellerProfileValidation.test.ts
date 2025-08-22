import { validateSellerProfile, isSellerProfileComplete, getMissingFieldsSummary } from '../sellerProfileValidation';
import { Seller } from '@/lib/database.types';

// Mock seller profile data
const completeSeller: Seller['Row'] = {
  id: 'test-id',
  name: 'John Doe',
  business_name: 'Coffee Shop',
  address: '123 Main St',
  latitude: 40.7128,
  longitude: -74.0060,
  phone: '+1234567890',
  hours: 'Mon-Fri: 9AM-5PM',
  photo_url: null,
  specialty: 'coffee',
  is_available: true,
  rating_average: 4.5,
  rating_count: 10,
  description: 'Great coffee shop',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const incompleteSeller: Seller['Row'] = {
  ...completeSeller,
  business_name: '', // Missing business name
  phone: '', // Missing phone
  hours: null // Missing hours
};

describe('sellerProfileValidation', () => {
  describe('validateSellerProfile', () => {
    it('should return complete for a valid seller profile', () => {
      const result = validateSellerProfile(completeSeller);
      expect(result.isComplete).toBe(true);
      expect(result.missingFields).toHaveLength(0);
      expect(result.missingFieldsDetails).toHaveLength(0);
    });

    it('should return incomplete for null seller profile', () => {
      const result = validateSellerProfile(null);
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('business_name');
      expect(result.missingFields).toContain('address');
      expect(result.missingFields).toContain('phone');
      expect(result.missingFields).toContain('hours');
    });

    it('should identify missing fields correctly', () => {
      const result = validateSellerProfile(incompleteSeller);
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('business_name');
      expect(result.missingFields).toContain('phone');
      expect(result.missingFields).toContain('hours');
      expect(result.missingFields).not.toContain('address'); // Address is present
    });

    it('should validate phone number format', () => {
      const sellerWithInvalidPhone = {
        ...completeSeller,
        phone: '123' // Too short
      };
      const result = validateSellerProfile(sellerWithInvalidPhone);
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('phone');
    });

    it('should handle null hours correctly', () => {
      const sellerWithNullHours = {
        ...completeSeller,
        hours: 'null' // String 'null' should be invalid
      };
      const result = validateSellerProfile(sellerWithNullHours);
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('hours');
    });
  });

  describe('isSellerProfileComplete', () => {
    it('should return true for complete profile', () => {
      expect(isSellerProfileComplete(completeSeller)).toBe(true);
    });

    it('should return false for incomplete profile', () => {
      expect(isSellerProfileComplete(incompleteSeller)).toBe(false);
    });

    it('should return false for null profile', () => {
      expect(isSellerProfileComplete(null)).toBe(false);
    });
  });

  describe('getMissingFieldsSummary', () => {
    it('should return complete message for complete profile', () => {
      const result = validateSellerProfile(completeSeller);
      const summary = getMissingFieldsSummary(result);
      expect(summary).toBe('Profile is complete');
    });

    it('should return creation message for null profile', () => {
      const result = validateSellerProfile(null);
      const summary = getMissingFieldsSummary(result);
      expect(summary).toContain('Missing:');
    });

    it('should format single missing field correctly', () => {
      const sellerMissingPhone = {
        ...completeSeller,
        phone: ''
      };
      const result = validateSellerProfile(sellerMissingPhone);
      const summary = getMissingFieldsSummary(result);
      expect(summary).toBe('Missing: Phone Number');
    });

    it('should format multiple missing fields correctly', () => {
      const result = validateSellerProfile(incompleteSeller);
      const summary = getMissingFieldsSummary(result);
      expect(summary).toContain('Missing:');
      expect(summary).toContain('Business Name');
      expect(summary).toContain('Phone Number');
      expect(summary).toContain('Business Hours');
    });
  });
});
