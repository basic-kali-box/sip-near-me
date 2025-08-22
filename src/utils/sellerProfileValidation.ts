import { Seller } from '@/lib/database.types';

export interface SellerProfileValidationResult {
  isComplete: boolean;
  missingFields: string[];
  missingFieldsDetails: { field: string; label: string; description: string }[];
}

export interface SellerProfileField {
  field: keyof Seller['Row'];
  label: string;
  description: string;
  isRequired: boolean;
  validator?: (value: any) => boolean;
}

// Define required fields for a complete seller profile
export const SELLER_REQUIRED_FIELDS: SellerProfileField[] = [
  {
    field: 'business_name',
    label: 'Business Name',
    description: 'Your business or brand name that customers will see',
    isRequired: true,
    validator: (value: string) => !!value?.trim()
  },
  {
    field: 'address',
    label: 'Business Address',
    description: 'Your business location where customers can find you',
    isRequired: true,
    validator: (value: string) => !!value?.trim()
  },
  {
    field: 'phone',
    label: 'Phone Number',
    description: 'Contact number for customers to reach you via WhatsApp',
    isRequired: true,
    validator: (value: string) => {
      if (!value?.trim()) return false;
      // Use Moroccan phone validation for WhatsApp compatibility
      const { validateAndNormalizeMoroccanPhone } = require('./moroccanPhoneValidation');
      const result = validateAndNormalizeMoroccanPhone(value);
      return result.isValid;
    }
  }
  // Note: Business hours are now optional and auto-populated with defaults
];

/**
 * Validates a seller profile and returns detailed information about completeness
 * @param sellerProfile - The seller profile to validate
 * @returns SellerProfileValidationResult with completion status and missing fields
 */
export function validateSellerProfile(sellerProfile: Seller['Row'] | null): SellerProfileValidationResult {
  if (!sellerProfile) {
    return {
      isComplete: false,
      missingFields: SELLER_REQUIRED_FIELDS.map(field => field.field),
      missingFieldsDetails: SELLER_REQUIRED_FIELDS.map(field => ({
        field: field.field,
        label: field.label,
        description: field.description
      }))
    };
  }

  const missingFields: string[] = [];
  const missingFieldsDetails: { field: string; label: string; description: string }[] = [];

  for (const fieldConfig of SELLER_REQUIRED_FIELDS) {
    const fieldValue = sellerProfile[fieldConfig.field];
    const isValid = fieldConfig.validator 
      ? fieldConfig.validator(fieldValue)
      : !!fieldValue;

    if (!isValid) {
      missingFields.push(fieldConfig.field);
      missingFieldsDetails.push({
        field: fieldConfig.field,
        label: fieldConfig.label,
        description: fieldConfig.description
      });
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    missingFieldsDetails
  };
}

/**
 * Quick check if a seller profile is complete
 * @param sellerProfile - The seller profile to check
 * @returns boolean indicating if profile is complete
 */
export function isSellerProfileComplete(sellerProfile: Seller['Row'] | null): boolean {
  return validateSellerProfile(sellerProfile).isComplete;
}

/**
 * Get a human-readable summary of missing fields
 * @param validationResult - Result from validateSellerProfile
 * @returns string describing what's missing
 */
export function getMissingFieldsSummary(validationResult: SellerProfileValidationResult): string {
  if (validationResult.isComplete) {
    return 'Profile is complete';
  }

  if (validationResult.missingFieldsDetails.length === 0) {
    return 'Profile needs to be created';
  }

  const fieldLabels = validationResult.missingFieldsDetails.map(field => field.label);
  
  if (fieldLabels.length === 1) {
    return `Missing: ${fieldLabels[0]}`;
  } else if (fieldLabels.length === 2) {
    return `Missing: ${fieldLabels[0]} and ${fieldLabels[1]}`;
  } else {
    const lastField = fieldLabels.pop();
    return `Missing: ${fieldLabels.join(', ')}, and ${lastField}`;
  }
}
