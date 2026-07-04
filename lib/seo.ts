import { Metadata } from 'next';

export function generateOrganizationSchema(): Metadata {
  return {
    other: {
      '@type': ['application/ld+json'],
    },
  };
}

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Himalayan Crest Realty',
  url: 'https://himalayancrestrealty.com',
  logo: 'https://himalayancrestrealty.com/images/logo.png',
  image: 'https://himalayancrestrealty.com/images/hero.jpg',
  description: 'Shimla\'s premier real estate agency for luxury homes, heritage properties, and investment opportunities.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '42 Mall Road, Near GPO',
    addressLocality: 'Shimla',
    addressRegion: 'Himachal Pradesh',
    postalCode: '171001',
    addressCountry: 'IN',
  },
  telephone: '+91-1772-123-456',
  email: 'hello@himalayancrestrealty.com',
  areaServed: ['Shimla', 'Mashobra', 'Kufri', 'Summer Hill'],
  priceRange: '₹₹₹',
  sameAs: [
    'https://twitter.com/himalayancrest',
    'https://linkedin.com/company/himalayancrestrealty',
  ],
};

export function generatePropertySchema(listing: {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_urls: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqft?: number | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.image_urls,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: listing.price,
      availability: 'https://schema.org/Available',
      businessFunction: 'https://schema.org/Sell',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location,
      addressCountry: 'IN',
    },
    ...(listing.bedrooms && { numberOfRooms: listing.bedrooms }),
    ...(listing.bathrooms && { amenityFeature: [{ '@type': 'PropertyValue', name: 'Bathrooms', value: listing.bathrooms }] }),
    ...(listing.area_sqft && { floorSize: { '@type': 'PropertyValue', name: 'Area', value: listing.area_sqft, unitText: 'SQFT' } }),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}