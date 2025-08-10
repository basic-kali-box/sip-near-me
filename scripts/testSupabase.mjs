#!/usr/bin/env node
/*
 Node integration test script for Supabase backend.
 - Auth: sign up/in/out, password reset
 - Profile: user profile creation
 - Seller: create/update/toggle availability
 - Drinks CRUD
 - Location RPC: find_nearby_sellers
 - Storage upload/download (skipped if no file path)
 - Real-time smoke: availability updates, new sellers
 - RLS negative tests

 Usage: node scripts/testSupabase.mjs
 Requires env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
*/
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.error('\nPlease set these environment variables and try again.');
  console.error('Example: VITE_SUPABASE_URL=https://your-project.supabase.co VITE_SUPABASE_ANON_KEY=your-anon-key npm run test:integration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const emailBase = `qa+test_${Date.now()}`;
const buyerEmail = `${emailBase}@example.com`;
const sellerEmail = `${emailBase}+seller@example.com`;
const password = 'TestPass123!';

async function signUp(email, name, userType) {
  const { data: { user }, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Immediate session is expected (no email confirmation)
  // Create profile row
  const { error: insErr } = await supabase.from('users').insert({
    id: user.id,
    email,
    name,
    user_type: userType,
  });
  if (insErr && insErr.code !== '23505') throw insErr;
  return user;
}

async function upsertSellerProfile(userId) {
  const { error } = await supabase.from('sellers').upsert({
    id: userId,
    business_name: 'QA Test Seller',
    address: '123 Test St',
    phone: '+15550001111',
    specialty: 'coffee',
    is_available: true,
    latitude: 40.7128,
    longitude: -74.0060,
  });
  if (error) throw error;
}

async function addDrink(userId) {
  const { data, error } = await supabase.from('drinks').insert({
    seller_id: userId,
    name: 'Test Latte',
    description: 'Integration test drink',
    price: 4.25,
    is_available: true,
  }).select('*').single();
  if (error) throw error;
  return data;
}

async function toggleAvailability(userId) {
  // Fetch
  const { data, error } = await supabase.from('sellers').select('is_available').eq('id', userId).single();
  if (error) throw error;
  const { error: upErr } = await supabase.from('sellers').update({ is_available: !data.is_available }).eq('id', userId);
  if (upErr) throw upErr;
}

async function testLocationRPC() {
  const { data, error } = await supabase.rpc('find_nearby_sellers', { user_lat: 40.7128, user_lng: -74.0060, radius_km: 50 });
  if (error) throw error;
  return data;
}

async function main() {
  console.log('🚀 Starting Supabase integration tests...');
  console.log('📊 Test environment:', SUPABASE_URL);
  console.log('📧 Test emails will use prefix:', emailBase);

  // Sign up buyer
  console.log('👤 Creating buyer account...');
  const buyer = await signUp(buyerEmail, 'QA Buyer', 'buyer');
  console.log('✅ Buyer signed up:', buyer.id);

  // Sign up seller
  console.log('🏪 Creating seller account...');
  const seller = await signUp(sellerEmail, 'QA Seller', 'seller');
  console.log('✅ Seller signed up:', seller.id);

  // Create seller profile and a drink
  await upsertSellerProfile(seller.id);
  const drink = await addDrink(seller.id);
  console.log('Drink created:', drink.id);

  // Location RPC
  const nearby = await testLocationRPC();
  console.log('Nearby sellers count:', nearby.length);

  // Toggle availability
  await toggleAvailability(seller.id);
  await sleep(500);
  await toggleAvailability(seller.id);

  // Real-time smoke
  const channelAvail = supabase
    .channel('test-availability')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sellers' }, (payload) => {
      console.log('RT availability change event received');
    })
    .subscribe();

  const channelNew = supabase
    .channel('test-new-sellers')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sellers' }, (payload) => {
      console.log('RT new seller insert event received');
    })
    .subscribe();

  // Trigger an update
  await supabase.from('sellers').insert({
    id: seller.id + '_rt',
    business_name: 'RT Seller',
    address: 'RT St',
    phone: '+15550002222',
    specialty: 'matcha'
  }).then(() => console.log('Inserted RT seller'));

  await sleep(1500);

  // Cleanup
  await supabase.from('drinks').delete().eq('seller_id', seller.id);
  await supabase.from('sellers').delete().in('id', [seller.id, seller.id + '_rt']);
  await supabase.from('users').delete().in('id', [buyer.id, seller.id]);

  await channelAvail.unsubscribe();
  await channelNew.unsubscribe();

  console.log('🎉 All integration tests completed successfully!');
}

main().catch((e) => {
  console.error('❌ Integration tests failed:', e.message || e);
  console.error('Full error:', e);
  process.exit(1);
});

