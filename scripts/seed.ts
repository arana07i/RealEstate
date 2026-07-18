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
    name: 'PropertyHub Realty',
    slug: 'propertyhub-realty',
    email: 'contact@propertyhub.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Avenue, Business District',
    subscription_tier: 'enterprise',
    subscription_status: 'active',
  });

  // Seed demo listings
  await supabase.from('listings').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      agency_id: agencyId,
      title: 'Luxury Family Villa',
      description: 'Modern luxury villa with premium amenities.',
      price: 3200000,
      location: 'Downtown',
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
      title: 'Premium Penthouse',
      description: 'Modern luxury apartment in the city center.',
      price: 1850000,
      location: 'City Center',
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