// Script to update existing sellers with GPS coordinates based on their addresses
import { supabase } from '../lib/supabase';
import { getDefaultCoordinates } from '../utils/geocoding';

interface Seller {
  id: string;
  business_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export async function updateSellersWithGPS() {
  console.log('🔄 Starting GPS coordinate update for sellers...');
  
  try {
    // Get all sellers that don't have GPS coordinates
    const { data: sellers, error: fetchError } = await supabase
      .from('sellers')
      .select('id, business_name, address, latitude, longitude')
      .or('latitude.is.null,longitude.is.null');

    if (fetchError) {
      console.error('❌ Error fetching sellers:', fetchError);
      return;
    }

    if (!sellers || sellers.length === 0) {
      console.log('✅ All sellers already have GPS coordinates!');
      return;
    }

    console.log(`📊 Found ${sellers.length} sellers without GPS coordinates`);

    let updated = 0;
    let failed = 0;

    for (const seller of sellers) {
      try {
        console.log(`🔄 Updating ${seller.business_name}...`);
        
        // Get coordinates based on address
        const coordinates = getDefaultCoordinates(seller.address);
        
        const { error: updateError } = await supabase
          .from('sellers')
          .update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', seller.id);

        if (updateError) {
          console.error(`❌ Failed to update ${seller.business_name}:`, updateError);
          failed++;
        } else {
          console.log(`✅ Updated ${seller.business_name} with coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Exception updating ${seller.business_name}:`, error);
        failed++;
      }
    }

    console.log('\n📈 Update Summary:');
    console.log(`   Successfully updated: ${updated} sellers`);
    console.log(`   Failed updates: ${failed} sellers`);
    console.log(`   Total processed: ${sellers.length} sellers`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the update if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateSellersWithGPS();
}
