import { Seller } from "@/data/mockSellers";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface OrderDetails {
  items: OrderItem[];
  total: number;
  customerName?: string;
  customerPhone?: string;
  pickupTime?: string;
  specialInstructions?: string;
}

/**
 * Formats an order for WhatsApp message
 */
export const formatOrderMessage = (seller: Seller, order: OrderDetails): string => {
  const lines = [
    `🍵 *Order from BrewNear*`,
    ``,
    `📍 *Seller:* ${seller.name}`,
    `📞 *Business:* ${seller.phone}`,
    ``,
    `📋 *Order Details:*`,
  ];

  // Add order items
  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} Dh`);
    if (item.notes) {
      lines.push(`   _Note: ${item.notes}_`);
    }
  });

  lines.push(``);
  lines.push(`💰 *Total: ${order.total.toFixed(2)} Dh*`);

  if (order.customerName) {
    lines.push(`👤 *Customer:* ${order.customerName}`);
  }

  if (order.customerPhone) {
    lines.push(`📱 *Phone:* ${order.customerPhone}`);
  }

  if (order.pickupTime) {
    lines.push(`⏰ *Pickup Time:* ${order.pickupTime}`);
  }

  if (order.specialInstructions) {
    lines.push(``);
    lines.push(`📝 *Special Instructions:*`);
    lines.push(order.specialInstructions);
  }

  lines.push(``);
  lines.push(`_Sent via BrewNear - Coffee & Matcha Marketplace_`);

  return lines.join('\n');
};

/**
 * Opens WhatsApp with pre-filled message
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
  // Clean phone number (remove non-digits)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
};

/**
 * Creates a quick contact message for browsing customers
 */
export const createQuickContactMessage = (seller: Seller, customerName?: string): string => {
  const lines = [
    `👋 Hi! I found your ${seller.specialty} business on BrewNear.`,
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
  lines.push(`_Sent via BrewNear_`);

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
  lines.push(`_Sent via BrewNear_`);

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
  lines.push(`_Sent via BrewNear_`);

  return lines.join('\n');
};

/**
 * Validates phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
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
    `⏰ Hi! I found your ${seller.specialty} business on BrewNear.`,
    ``,
    `Could you please share your current business hours and availability?`,
    ``,
    `Thanks!`,
    `_Sent via BrewNear_`
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
    `_Sent via BrewNear_`
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
    source: 'brewnear_app'
  };
  
  // Store locally for now (in real app, send to analytics service)
  const existingContacts = JSON.parse(localStorage.getItem('brewnear_contacts') || '[]');
  existingContacts.push(contactData);
  localStorage.setItem('brewnear_contacts', JSON.stringify(existingContacts));
  
  console.log('Contact attempt tracked:', contactData);
};
