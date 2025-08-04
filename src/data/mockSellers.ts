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
      { name: "Ceremonial Matcha Latte", description: "Premium ceremonial grade matcha with oat milk", price: "$7.50", category: "matcha", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop&crop=center" },
      { name: "Iced Matcha Cloud", description: "Cold brew matcha with vanilla foam", price: "$8.00", category: "matcha", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&crop=center" },
      { name: "Matcha Tiramisu", description: "Traditional tiramisu with matcha twist", price: "$9.50", category: "pastry", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop&crop=center" },
      { name: "Hojicha Latte", description: "Roasted green tea with steamed milk", price: "$6.50", category: "specialty", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center" }
    ],
    phone: "+1 (555) 123-4567",
    hours: "7AM - 8PM",
    photo_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=400&fit=crop&crop=center",
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
      { name: "Single Origin Pour Over", description: "Ethiopian Yirgacheffe, light roast", price: "$6.00", category: "coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center" },
      { name: "Maple Cortado", description: "Double shot with maple syrup and steamed milk", price: "$5.50", category: "coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&crop=center" },
      { name: "Cold Brew Concentrate", description: "24-hour slow extraction", price: "$4.50", category: "coffee", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop&crop=center" },
      { name: "Affogato", description: "Vanilla gelato drowned in espresso", price: "$8.00", category: "specialty", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center" }
    ],
    phone: "+1 (555) 234-5678",
    hours: "6AM - 6PM",
    photo_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=400&fit=crop&crop=center",
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
      { name: "Matcha Cappuccino", description: "Espresso and matcha blend with microfoam", price: "$7.00", category: "specialty", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&crop=center" },
      { name: "Dalgona Matcha", description: "Whipped matcha over iced oat milk", price: "$6.50", category: "matcha", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center" },
      { name: "Coffee Matcha Swirl", description: "Half coffee, half matcha latte", price: "$7.50", category: "specialty", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center" },
      { name: "Matcha Croissant", description: "Buttery croissant with matcha cream", price: "$5.00", category: "pastry", image: "https://images.unsplash.com/photo-1555507036-ab794f4afe5e?w=400&h=300&fit=crop&crop=center" }
    ],
    phone: "+1 (555) 345-6789",
    hours: "7AM - 7PM",
    photo_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=400&fit=crop&crop=center",
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
      { name: "Scandinavian Light Roast", description: "Bright, acidic notes with floral finish", price: "$5.50", category: "coffee", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop&crop=center" },
      { name: "Cardamom Latte", description: "Nordic spice blend with espresso", price: "$6.00", category: "coffee", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop&crop=center" },
      { name: "Flat White", description: "Double ristretto with microfoam", price: "$5.00", category: "coffee", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=300&fit=crop&crop=center" },
      { name: "Cinnamon Bun", description: "Traditional Swedish kanelbulle", price: "$4.50", category: "pastry", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center" }
    ],
    phone: "+1 (555) 456-7890",
    hours: "6:30AM - 5PM",
    photo_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=400&fit=crop&crop=center",
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
      { name: "Moon Dust Matcha", description: "Ceremonial matcha with coconut cloud foam", price: "$8.50", category: "matcha", image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400&h=300&fit=crop&crop=center" },
      { name: "Strawberry Matcha", description: "Seasonal strawberry and matcha blend", price: "$9.00", category: "matcha", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center" },
      { name: "White Chocolate Matcha", description: "Creamy white chocolate matcha latte", price: "$8.00", category: "matcha", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&crop=center" },
      { name: "Matcha Mochi", description: "Traditional Japanese sweet treat", price: "$3.50", category: "pastry", image: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400&h=300&fit=crop&crop=center" }
    ],
    phone: "+1 (555) 567-8901",
    hours: "8AM - 9PM",
    photo_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500&h=400&fit=crop&crop=center",
    rating: 4.9,
    reviewCount: 94,
    distance: "2.1 mi",
    specialty: "Premium Matcha Experience",
    isVerified: true,
    deliveryTime: "25-35 min",
    minimumOrder: "$12"
  }
];