export interface Drink {
  name: string;
  description: string;
  price: string;
  image?: string;
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
}

export const mockSellers: Seller[] = [
  {
    id: 1,
    name: "Sarah's Fresh Juices",
    location: { lat: 40.7128, lng: -74.0060, address: "123 Main St, New York" },
    drinks: [
      { name: "Green Smoothie", description: "Spinach, apple, banana blend", price: "$5" },
      { name: "Orange Carrot Ginger", description: "Fresh pressed immunity boost", price: "$6" },
      { name: "Tropical Paradise", description: "Mango, pineapple, coconut", price: "$7" }
    ],
    phone: "+1234567890",
    hours: "9AM-6PM",
    photo_url: "/placeholder.svg",
    rating: 4.5,
    reviewCount: 23,
    distance: "0.3 mi",
    specialty: "Cold-pressed juices"
  },
  {
    id: 2,
    name: "Mike's Kombucha Corner",
    location: { lat: 40.7589, lng: -73.9851, address: "456 Park Ave, New York" },
    drinks: [
      { name: "Ginger Lemon Kombucha", description: "Probiotic powerhouse", price: "$4" },
      { name: "Berry Hibiscus", description: "Antioxidant-rich fermented tea", price: "$5" },
      { name: "Cucumber Mint", description: "Refreshing and cooling", price: "$4" }
    ],
    phone: "+1234567891",
    hours: "8AM-8PM",
    photo_url: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 47,
    distance: "0.7 mi",
    specialty: "Artisan kombucha"
  },
  {
    id: 3,
    name: "Luna's Smoothie Bowls",
    location: { lat: 40.7505, lng: -73.9934, address: "789 Broadway, New York" },
    drinks: [
      { name: "Acai Power Bowl", description: "Acai, granola, fresh berries", price: "$8" },
      { name: "Chocolate Peanut Butter", description: "Protein-packed indulgence", price: "$7" },
      { name: "Dragon Fruit Special", description: "Pink pitaya superfood blend", price: "$9" }
    ],
    phone: "+1234567892",
    hours: "7AM-3PM",
    photo_url: "/placeholder.svg",
    rating: 4.3,
    reviewCount: 31,
    distance: "1.2 mi",
    specialty: "Smoothie bowls"
  },
  {
    id: 4,
    name: "Carlos' Coffee & Shakes",
    location: { lat: 40.7282, lng: -74.0776, address: "321 West St, New York" },
    drinks: [
      { name: "Iced Vanilla Latte", description: "Cold brew with vanilla syrup", price: "$4" },
      { name: "Protein Shake", description: "Banana, peanut butter, protein", price: "$6" },
      { name: "Matcha Frappé", description: "Japanese green tea blend", price: "$5" }
    ],
    phone: "+1234567893",
    hours: "6AM-9PM",
    photo_url: "/placeholder.svg",
    rating: 4.1,
    reviewCount: 18,
    distance: "1.8 mi",
    specialty: "Coffee & protein shakes"
  },
  {
    id: 5,
    name: "Emma's Herbal Teas",
    location: { lat: 40.7614, lng: -73.9776, address: "555 5th Ave, New York" },
    drinks: [
      { name: "Chamomile Honey", description: "Soothing evening blend", price: "$3" },
      { name: "Turmeric Ginger", description: "Anti-inflammatory wellness tea", price: "$4" },
      { name: "Peppermint Fresh", description: "Cooling digestive aid", price: "$3" }
    ],
    phone: "+1234567894",
    hours: "10AM-7PM",
    photo_url: "/placeholder.svg",
    rating: 4.6,
    reviewCount: 52,
    distance: "2.1 mi",
    specialty: "Herbal wellness teas"
  }
];