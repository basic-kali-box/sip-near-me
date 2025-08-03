export interface Drink {
  name: string;
  description: string;
  price: string;
  image?: string;
  category: "coffee" | "matcha" | "specialty" | "pastry";
}

export interface Seller {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  drinks: Drink[];
  phone: string;
  hours: string;
  photo_url: string;
  rating: number;
  reviewCount: number;
  distance?: string;
  specialty?: string;
  isVerified?: boolean;
  deliveryTime?: string;
  minimumOrder?: string;
}

export const mockSellers: Seller[] = [
  {
    id: 1,
    name: "Zen Matcha Studio",
    location: { lat: 40.7128, lng: -74.0060, address: "123 Greene St, SoHo" },
    drinks: [
      { name: "Ceremonial Matcha Latte", description: "Premium ceremonial grade matcha with oat milk", price: "$7.50", category: "matcha" },
      { name: "Iced Matcha Cloud", description: "Cold brew matcha with vanilla foam", price: "$8.00", category: "matcha" },
      { name: "Matcha Tiramisu", description: "Traditional tiramisu with matcha twist", price: "$9.50", category: "pastry" },
      { name: "Hojicha Latte", description: "Roasted green tea with steamed milk", price: "$6.50", category: "specialty" }
    ],
    phone: "+1 (555) 123-4567",
    hours: "7AM - 8PM",
    photo_url: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 127,
    distance: "0.3 mi",
    specialty: "Authentic Japanese Matcha",
    isVerified: true,
    deliveryTime: "15-25 min",
    minimumOrder: "$12"
  },
  {
    id: 2,
    name: "Artisan Coffee Collective",
    location: { lat: 40.7589, lng: -73.9851, address: "456 West Village, NYC" },
    drinks: [
      { name: "Single Origin Pour Over", description: "Ethiopian Yirgacheffe, light roast", price: "$6.00", category: "coffee" },
      { name: "Maple Cortado", description: "Double shot with maple syrup and steamed milk", price: "$5.50", category: "coffee" },
      { name: "Cold Brew Concentrate", description: "24-hour slow extraction", price: "$4.50", category: "coffee" },
      { name: "Affogato", description: "Vanilla gelato drowned in espresso", price: "$8.00", category: "specialty" }
    ],
    phone: "+1 (555) 234-5678",
    hours: "6AM - 6PM",
    photo_url: "/placeholder.svg",
    rating: 4.6,
    reviewCount: 89,
    distance: "0.7 mi",
    specialty: "Third Wave Coffee",
    isVerified: true,
    deliveryTime: "10-20 min",
    minimumOrder: "$10"
  },
  {
    id: 3,
    name: "Green & Bean Fusion",
    location: { lat: 40.7505, lng: -73.9934, address: "789 Broadway, Union Sq" },
    drinks: [
      { name: "Matcha Cappuccino", description: "Espresso and matcha blend with microfoam", price: "$7.00", category: "specialty" },
      { name: "Dalgona Matcha", description: "Whipped matcha over iced oat milk", price: "$6.50", category: "matcha" },
      { name: "Coffee Matcha Swirl", description: "Half coffee, half matcha latte", price: "$7.50", category: "specialty" },
      { name: "Matcha Croissant", description: "Buttery croissant with matcha cream", price: "$5.00", category: "pastry" }
    ],
    phone: "+1 (555) 345-6789",
    hours: "7AM - 7PM",
    photo_url: "/placeholder.svg",
    rating: 4.4,
    reviewCount: 156,
    distance: "1.2 mi",
    specialty: "Coffee & Matcha Fusion",
    isVerified: true,
    deliveryTime: "20-30 min",
    minimumOrder: "$15"
  },
  {
    id: 4,
    name: "Nordic Coffee Roasters",
    location: { lat: 40.7282, lng: -74.0776, address: "321 Tribeca, NYC" },
    drinks: [
      { name: "Scandinavian Light Roast", description: "Bright, acidic notes with floral finish", price: "$5.50", category: "coffee" },
      { name: "Cardamom Latte", description: "Nordic spice blend with espresso", price: "$6.00", category: "coffee" },
      { name: "Flat White", description: "Double ristretto with microfoam", price: "$5.00", category: "coffee" },
      { name: "Cinnamon Bun", description: "Traditional Swedish kanelbulle", price: "$4.50", category: "pastry" }
    ],
    phone: "+1 (555) 456-7890",
    hours: "6:30AM - 5PM",
    photo_url: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 203,
    distance: "1.8 mi",
    specialty: "Nordic Coffee Culture",
    isVerified: true,
    deliveryTime: "15-25 min",
    minimumOrder: "$8"
  },
  {
    id: 5,
    name: "Matcha Moon Café",
    location: { lat: 40.7614, lng: -73.9776, address: "555 Upper East Side, NYC" },
    drinks: [
      { name: "Moon Dust Matcha", description: "Ceremonial matcha with coconut cloud foam", price: "$8.50", category: "matcha" },
      { name: "Strawberry Matcha", description: "Seasonal strawberry and matcha blend", price: "$9.00", category: "matcha" },
      { name: "White Chocolate Matcha", description: "Creamy white chocolate matcha latte", price: "$8.00", category: "matcha" },
      { name: "Matcha Mochi", description: "Traditional Japanese sweet treat", price: "$3.50", category: "pastry" }
    ],
    phone: "+1 (555) 567-8901",
    hours: "8AM - 9PM",
    photo_url: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 94,
    distance: "2.1 mi",
    specialty: "Premium Matcha Experience",
    isVerified: true,
    deliveryTime: "25-35 min",
    minimumOrder: "$12"
  }
];