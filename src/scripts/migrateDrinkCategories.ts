// Script to migrate drink categories from old values to new values
// Run this script if you have existing drinks with old category values

import { migrateDrinkCategories, checkDrinksNeedingMigration, validateAllDrinkCategories } from '../utils/categoryMigration';

async function runCategoryMigration() {
  console.log('🚀 Starting drink category migration...');
  console.log('=====================================');

  try {
    // Step 1: Check current state
    console.log('\n📊 Step 1: Checking current category state...');
    const validation = await validateAllDrinkCategories();
    console.log(`Total drinks: ${validation.total}`);
    console.log(`Valid categories: ${validation.valid}`);
    console.log(`Invalid categories: ${validation.invalid.length}`);

    if (validation.invalid.length > 0) {
      console.log('\n❌ Drinks with invalid categories:');
      validation.invalid.forEach(drink => {
        console.log(`  - "${drink.name}" (${drink.id}): "${drink.category}"`);
      });
    }

    // Step 2: Check what needs migration
    console.log('\n🔍 Step 2: Checking drinks needing migration...');
    const migrationCheck = await checkDrinksNeedingMigration();
    console.log(`Drinks needing migration: ${migrationCheck.needsMigration.length}`);

    if (migrationCheck.needsMigration.length > 0) {
      console.log('\n📋 Migration plan:');
      migrationCheck.needsMigration.forEach(drink => {
        console.log(`  - "${drink.name}": "${drink.category}" → "${drink.suggestedCategory}"`);
      });

      // Step 3: Run migration
      console.log('\n🔄 Step 3: Running migration...');
      const result = await migrateDrinkCategories();

      console.log('\n📈 Migration Results:');
      console.log(`Total drinks checked: ${result.totalDrinks}`);
      console.log(`Drinks migrated: ${result.migratedDrinks}`);
      console.log(`Success: ${result.success}`);

      if (result.details.length > 0) {
        console.log('\n✅ Successfully migrated:');
        result.details.forEach(detail => {
          console.log(`  - "${detail.name}": "${detail.oldCategory}" → "${detail.newCategory}"`);
        });
      }

      if (result.errors.length > 0) {
        console.log('\n❌ Errors during migration:');
        result.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }
    } else {
      console.log('\n✅ No drinks need category migration!');
    }

    // Step 4: Final validation
    console.log('\n🔍 Step 4: Final validation...');
    const finalValidation = await validateAllDrinkCategories();
    console.log(`Final state - Valid: ${finalValidation.valid}, Invalid: ${finalValidation.invalid.length}`);

    if (finalValidation.invalid.length === 0) {
      console.log('\n🎉 All drink categories are now valid!');
    } else {
      console.log('\n⚠️ Some drinks still have invalid categories:');
      finalValidation.invalid.forEach(drink => {
        console.log(`  - "${drink.name}": "${drink.category}"`);
      });
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('\n=====================================');
  console.log('✅ Category migration completed!');
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runCategoryMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runCategoryMigration };
