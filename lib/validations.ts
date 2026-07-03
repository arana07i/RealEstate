import { z } from 'zod';

export const ListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area_sqft: z.number().int().min(0).optional().nullable(),
  status: z.enum(['active', 'sold']).default('active'),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  image_urls: z.array(z.string().url()).min(1, 'At least one image is required'),
});

export const ListingUpdateSchema = ListingSchema.partial();

export const InquirySchema = z.object({
  agency_id: z.string().uuid('Invalid agency ID'),
  property_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
});

export const InquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed', 'spam']),
});

export const AgencySettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const StripeCheckoutSchema = z.object({
  tier: z.enum(['starter', 'professional', 'enterprise']),
});

export type ListingInput = z.infer<typeof ListingSchema>;
export type InquiryInput = z.infer<typeof InquirySchema>;
export type InquiryStatusInput = z.infer<typeof InquiryStatusSchema>;
export type AgencySettingsInput = z.infer<typeof AgencySettingsSchema>;
export type StripeCheckoutInput = z.infer<typeof StripeCheckoutSchema>;

export function validateAgencyId(agencyId: string | null): string {
  if (!agencyId) {
    throw new Error('Agency context required');
  }
  return agencyId;
}