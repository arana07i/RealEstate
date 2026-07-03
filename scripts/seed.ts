#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const agencyId = '00000000-0000-0000-0000-000000000001';
  
  // Seed demo agency
  await supabase.from('agencies').upsert({
    id: agencyId,
    name: 'Himalayan Crest Realty',
    slug: 'himalayan-crest',
    email: 'hello@himalayancrestrealty.com',
    phone: '+91 1772 123 456',
    address: '42 Mall Road, Near GPO, Shimla, HP 171001',
    subscription_tier: 'enterprise',
    subscription_status: 'active',
  });

  // Seed demo listings
  await supabase.from('listings').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      agency_id: agencyId,
      title: 'The Pinecrest Estate',
      description: 'Colonial heritage bungalow with panoramic pine forest views.',
      price: 28500000,
      location: 'Chotta Shimla',
      status: 'active',
      bedrooms: 4,
      bathrooms: 3,
      area_sqft: 3200,
      featured: true,
      draft: false,
      image_urls: ['/images/listing-1.jpg', '/images/listing-2.jpg'],
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      agency_id: agencyId,
      title: 'Summit View Residences',
      description: 'Modern luxury apartment overlooking the Shimla valley.',
      price: 14500000,
      location: 'Mall Road',
      status: 'active',
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1850,
      featured: true,
      draft: false,
      image_urls: ['/images/listing-3.jpg', '/images/listing-4.jpg'],
    },
  ]);

  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});