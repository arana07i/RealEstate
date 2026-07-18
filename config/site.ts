export const siteConfig = {
  name: 'PropertyHub',
  description: 'Professional real estate platform for modern agencies and property seekers',
  companyName: 'PropertyHub Real Estate',
  email: 'contact@propertyhub.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Avenue, Business District',
  socialLinks: {
    twitter: 'https://twitter.com/propertyhub',
    linkedin: 'https://linkedin.com/company/propertyhub',
  },
  seo: {
    title: 'PropertyHub | Modern Real Estate Platform',
    keywords: ['real estate', 'property', 'housing', 'commercial', 'residential', 'agency', 'CRM', 'listings'],
    ogImage: '/og-image.png',
  },
} as const;

export type SiteConfig = typeof siteConfig;