import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

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
  name: siteConfig.name,
  url: siteConfig.seo.ogImage?.replace('/images/og-image.jpg', 'https://propertyhub.com') ?? 'https://propertyhub.com',
  logo: `${siteConfig.seo.ogImage?.replace('/images/og-image.jpg', '') ?? 'https://propertyhub.com'}/images/logo.png`,
  image: siteConfig.seo.ogImage ?? 'https://propertyhub.com/images/hero.jpg',
  description: siteConfig.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address,
    addressLocality: 'Your City',
    addressCountry: 'US',
  },
  telephone: siteConfig.phone,
  email: siteConfig.email,
  areaServed: ['Global'],
  priceRange: '$$$',
  sameAs: [
    siteConfig.socialLinks.twitter,
    siteConfig.socialLinks.linkedin,
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
      priceCurrency: 'USD',
      price: listing.price,
      availability: 'https://schema.org/Available',
      businessFunction: 'https://schema.org/Sell',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location,
      addressCountry: 'US',
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