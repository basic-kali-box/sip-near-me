// Category migration utility to fix existing drinks with old category values

import { supabase } from '@/lib/supabase';
import { migrateCategoryValue, needsCategoryMigration, isValidCategory } from './categories';

export interface MigrationResult {
  success: boolean;
  totalDrinks: number;
  migratedDrinks: number;
  errors: string[];
  details: Array<{
    id: string;
    name: string;
    oldCategory: string;
    newCategory: string;
  }>;
}

// Check which drinks need category migration
export const checkDrinksNeedingMigration = async (): Promise<{
  needsMigration: Array<{
    id: string;
    name: string;
    category: string;
    suggestedCategory: string;
  }>;
  totalChecked: number;
}> => {
  try {
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('id, name, category')
      .not('category', 'is', null);

    if (error) throw error;

    const needsMigration = drinks
      ?.filter(drink => drink.category && needsCategoryMigration(drink.category))
      .map(drink => ({
        id: drink.id,
        name: drink.name,
        category: drink.category!,
        suggestedCategory: migrateCategoryValue(drink.category!)
      })) || [];

    return {
      needsMigration,
      totalChecked: drinks?.length || 0
    };
  } catch (error) {
    console.error('Error checking drinks for migration:', error);
    throw error;
  }
};

// Migrate categories for all drinks that need it
export const migrateDrinkCategories = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    totalDrinks: 0,
    migratedDrinks: 0,
    errors: [],
    details: []
  };

  try {
    console.log('🔍 Checking drinks for category migration...');
    
    // Get all drinks with categories
    const { data: drinks, error: fetchError } = await supabase
      .from('drinks')
      .select('id, name, category')
      .not('category', 'is', null);

    if (fetchError) {
      result.errors.push(`Failed to fetch drinks: ${fetchError.message}`);
      return result;
    }

    result.totalDrinks = drinks?.length || 0;
    console.log(`📊 Found ${result.totalDrinks} drinks to check`);

    if (!drinks || drinks.length === 0) {
      result.success = true;
      return result;
    }

    // Find drinks that need migration
    const drinksToMigrate = drinks.filter(drink => 
      drink.category && needsCategoryMigration(drink.category)
    );

    console.log(`🔄 Found ${drinksToMigrate.length} drinks needing category migration`);

    if (drinksToMigrate.length === 0) {
      result.success = true;
      return result;
    }

    // Migrate each drink
    for (const drink of drinksToMigrate) {
      try {
        const oldCategory = drink.category!;
        const newCategory = migrateCategoryValue(oldCategory);

        console.log(`🔄 Migrating "${drink.name}": ${oldCategory} -> ${newCategory}`);

        const { error: updateError } = await supabase
          .from('drinks')
          .update({ 
            category: newCategory,
            updated_at: new Date().toISOString()
          })
          .eq('id', drink.id);

        if (updateError) {
          result.errors.push(`Failed to migrate drink "${drink.name}": ${updateError.message}`);
          continue;
        }

        result.details.push({
          id: drink.id,
          name: drink.name,
          oldCategory,
          newCategory
        });

        result.migratedDrinks++;
      } catch (error) {
        result.errors.push(`Error migrating drink "${drink.name}": ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    console.log(`✅ Migration completed: ${result.migratedDrinks}/${drinksToMigrate.length} drinks migrated`);

    if (result.errors.length > 0) {
      console.warn('⚠️ Migration completed with errors:', result.errors);
    }

    return result;
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    console.error('❌ Category migration failed:', error);
    return result;
  }
};

// Validate all drink categories
export const validateAllDrinkCategories = async (): Promise<{
  valid: number;
  invalid: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  total: number;
}> => {
  try {
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('id, name, category');

    if (error) throw error;

    const total = drinks?.length || 0;
    const invalid = drinks
      ?.filter(drink => drink.category && !isValidCategory(drink.category))
      .map(drink => ({
        id: drink.id,
        name: drink.name,
        category: drink.category!
      })) || [];

    return {
      valid: total - invalid.length,
      invalid,
      total
    };
  } catch (error) {
    console.error('Error validating drink categories:', error);
    throw error;
  }
};
