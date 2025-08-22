// Category management utilities for drinks

export interface CategoryInfo {
  value: string;
  label: string;
  emoji: string;
  description?: string;
}

// Valid categories that match backend validation
export const VALID_CATEGORIES: CategoryInfo[] = [
  {
    value: 'hot-drinks',
    label: 'Hot Drinks',
    emoji: '☕',
    description: 'Coffee, tea, hot chocolate, and other warm beverages'
  },
  {
    value: 'cold-drinks',
    label: 'Cold Drinks',
    emoji: '🧊',
    description: 'Iced coffee, cold brew, smoothies, and refreshing beverages'
  },
  {
    value: 'snacks',
    label: 'Snacks',
    emoji: '🍪',
    description: 'Pastries, cookies, sandwiches, and light bites'
  },
  {
    value: 'desserts',
    label: 'Desserts',
    emoji: '🧁',
    description: 'Cakes, muffins, sweet treats, and desserts'
  },
  {
    value: 'other',
    label: 'Other',
    emoji: '📦',
    description: 'Other food and beverage items'
  }
];

// Get all valid category values
export const getValidCategoryValues = (): string[] => {
  return VALID_CATEGORIES.map(cat => cat.value);
};

// Get category info by value
export const getCategoryInfo = (value: string): CategoryInfo | undefined => {
  return VALID_CATEGORIES.find(cat => cat.value === value);
};

// Get category display name
export const getCategoryDisplayName = (value: string): string => {
  const category = getCategoryInfo(value);
  return category ? category.label : value;
};

// Get category emoji
export const getCategoryEmoji = (value: string): string => {
  const category = getCategoryInfo(value);
  return category ? category.emoji : '📦';
};

// Format category for display with emoji
export const formatCategoryDisplay = (value: string): string => {
  const category = getCategoryInfo(value);
  if (!category) return value;
  return `${category.emoji} ${category.label}`;
};

// Validate if a category is valid
export const isValidCategory = (value: string): boolean => {
  return getValidCategoryValues().includes(value);
};

// Migration helper: Map old category values to new ones
export const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  // Old frontend categories -> new backend categories
  'hot': 'hot-drinks',
  'iced': 'cold-drinks',
  'coffee': 'hot-drinks',
  'matcha': 'hot-drinks',
  'tea': 'hot-drinks',
  'cold-brew': 'cold-drinks',
  'specialty': 'hot-drinks',
  'seasonal': 'hot-drinks',
  'espresso': 'hot-drinks',
  'latte': 'hot-drinks',
  'cappuccino': 'hot-drinks',
  'americano': 'hot-drinks',
  'traditional': 'hot-drinks',
  'bubble tea': 'cold-drinks',
  'dessert': 'desserts',
  'pastries': 'snacks',
  'smoothies': 'cold-drinks'
};

// Migrate old category to new category
export const migrateCategoryValue = (oldValue: string): string => {
  return CATEGORY_MIGRATION_MAP[oldValue] || oldValue;
};

// Check if category needs migration
export const needsCategoryMigration = (value: string): boolean => {
  return !isValidCategory(value) && value in CATEGORY_MIGRATION_MAP;
};
