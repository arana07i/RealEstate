import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price in USD */
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${Math.round(price / 1000)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export const GENERIC_LOCATIONS = [
  'All Locations',
  'Downtown',
  'City Center',
  'Business District',
  'Waterfront',
  'Suburban Area',
  'Financial District',
  'Residential Community',
  'Historic District',
  'Urban Center',
  'Coastal Area',
  'Premium Neighborhood',
  'Green Community',
] as const;

export const PLACEHOLDER_IMAGE = '/images/placeholder-property.svg';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[+]?[\d\s-]{10,}$/.test(phone);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);
}

export function sanitizeEmail(email: string): string {
  return email
    .replace(/[<>"']/g, '')
    .trim()
    .toLowerCase()
    .slice(0, 254);
}