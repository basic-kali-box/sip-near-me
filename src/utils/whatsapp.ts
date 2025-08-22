import { Seller } from "@/data/mockSellers";
import { getMoroccanPhoneForWhatsAppAPI, validateAndNormalizeMoroccanPhone } from "./moroccanPhoneValidation";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}



/**
 * Opens WhatsApp with pre-filled message
 * Now uses Moroccan phone validation for proper E.164 formatting
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
  // Normalize phone number for WhatsApp API (Moroccan format)
  const cleanPhone = getMoroccanPhoneForWhatsAppAPI(phoneNumber);

  if (!cleanPhone) {
    console.error('Invalid phone number for WhatsApp:', phoneNumber);
    // Fallback to old behavior for non-Moroccan numbers
    const fallbackClean = phoneNumber.replace(/\D/g, '');
    if (fallbackClean.length >= 10) {
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${fallbackClean}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
    return;
  }

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp URL with properly formatted Moroccan number
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates a quick contact message for browsing customers
 */
export const createQuickContactMessage = (seller: Seller, customerName?: string): string => {
  const lines = [
    `👋 Hi! I found your ${seller.specialty} business on Machroub.`,
    ``,
    `I'm interested in your drinks menu. Could you please share more details about:`,
    `• Available drinks and prices`,
    `• Pickup/delivery options`,
    `• Current availability`,
    ``,
  ];

  if (customerName) {
    lines.push(`My name is ${customerName}.`);
    lines.push(``);
  }

  lines.push(`Thanks!`);
  lines.push(`_Sent via Machroub_`);

  return lines.join('\n');
};

/**
 * Creates a product interest message for specific items
 */
export const createProductInterestMessage = (
  productName: string,
  price: number,
  sellerSpecialty: string,
  customerName?: string
): string => {
  const lines = [
    `🍵 Hi! I'm interested in ordering "${productName}" (${price.toFixed(2)} Dh) from your ${sellerSpecialty} business.`,
    ``,
    `Could you please confirm:`,
    `• Current availability`,
    `• Pickup/delivery options`,
    `• Estimated preparation time`,
    ``,
  ];

  if (customerName) {
    lines.push(`My name is ${customerName}.`);
    lines.push(``);
  }

  lines.push(`Thanks!`);
  lines.push(`_Sent via Machroub_`);

  return lines.join('\n');
};

/**
 * Creates an order inquiry message
 */
export const createOrderInquiryMessage = (seller: Seller, drinkName: string, customerName?: string): string => {
  const lines = [
    `🍵 Hi! I'd like to order from your ${seller.specialty} business.`,
    ``,
    `📋 *Interested in:* ${drinkName}`,
    ``,
    `Could you please confirm:`,
    `• Price and availability`,
    `• Pickup time and location`,
    `• Payment method`,
    ``,
  ];

  if (customerName) {
    lines.push(`👤 *Customer:* ${customerName}`);
    lines.push(``);
  }

  lines.push(`Thank you!`);
  lines.push(`_Sent via Machroub_`);

  return lines.join('\n');
};

/**
 * Validates phone number format (now uses Moroccan validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const result = validateAndNormalizeMoroccanPhone(phone);
  return result.isValid;
};

/**
 * Formats phone number for display (now uses Moroccan formatting)
 */
export const formatPhoneNumber = (phone: string): string => {
  const result = validateAndNormalizeMoroccanPhone(phone);

  if (result.isValid) {
    return result.displayNumber;
  }

  // Fallback to original formatting for non-Moroccan numbers
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }

  return phone; // Return original if can't format
};

/**
 * Creates a business hours inquiry message
 */
export const createBusinessHoursInquiry = (seller: Seller): string => {
  return [
    `⏰ Hi! I found your ${seller.specialty} business on Machroub.`,
    ``,
    `Could you please share your current business hours and availability?`,
    ``,
    `Thanks!`,
    `_Sent via Machroub_`
  ].join('\n');
};

/**
 * Creates a location/directions inquiry message
 */
export const createLocationInquiry = (seller: Seller): string => {
  return [
    `📍 Hi! I'm interested in visiting your ${seller.specialty} business.`,
    ``,
    `Could you please share:`,
    `• Exact pickup location/address`,
    `• Any specific directions or landmarks`,
    `• Best time to visit`,
    ``,
    `Thank you!`,
    `_Sent via Machroub_`
  ].join('\n');
};

/**
 * Tracks contact attempts for analytics
 */
export const trackContactAttempt = (sellerId: string, contactType: 'whatsapp' | 'phone' | 'inquiry'): void => {
  // In a real app, this would send analytics to backend
  const contactData = {
    sellerId,
    contactType,
    timestamp: new Date().toISOString(),
    source: 'machroub_app'
  };

  // Store locally for now (in real app, send to analytics service)
  const existingContacts = JSON.parse(localStorage.getItem('machroub_contacts') || '[]');
  existingContacts.push(contactData);
  localStorage.setItem('machroub_contacts', JSON.stringify(existingContacts));

  console.log('Contact attempt tracked:', contactData);
};


