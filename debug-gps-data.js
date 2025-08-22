// Quick script to check GPS data in the database
import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGPSData() {
  console.log('🔍 Checking GPS data in sellers table...');
  
  try {
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('id, business_name, address, latitude, longitude')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching sellers:', error);
      return;
    }

    console.log(`📊 Found ${sellers.length} sellers:`);
    
    sellers.forEach((seller, index) => {
      console.log(`\n${index + 1}. ${seller.business_name}`);
      console.log(`   Address: ${seller.address}`);
      console.log(`   GPS: ${seller.latitude ? `${seller.latitude}, ${seller.longitude}` : 'Not set'}`);
      
      if (seller.latitude && seller.longitude) {
        console.log(`   ✅ Has GPS coordinates`);
      } else {
        console.log(`   ⚠️  Missing GPS coordinates`);
      }
    });

    const withGPS = sellers.filter(s => s.latitude && s.longitude);
    const withoutGPS = sellers.filter(s => !s.latitude || !s.longitude);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Sellers with GPS: ${withGPS.length}`);
    console.log(`   Sellers without GPS: ${withoutGPS.length}`);
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run the check
checkGPSData();
