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

export const UserCreateSchema = z.object({
  email: z.string().email('Valid email is required'),
  full_name: z.string().optional().nullable(),
  role: z.enum(['agency_admin', 'agent', 'viewer']),
  agency_id: z.string().uuid().optional().nullable(),
});

export const UserRoleSchema = z.object({
  role: z.enum(['super_admin', 'agency_admin', 'agent', 'viewer']),
});

export const LeadCreateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required').optional().nullable(),
  phone: z.string().min(10, 'Valid phone number is required').optional().nullable(),
  status: z.enum(['new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('new'),
  source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'other']).optional().nullable(),
  value: z.number().nonnegative('Value must be non-negative').optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export const LeadUpdateSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
  status: z.enum(['new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'other']).optional().nullable(),
  value: z.number().nonnegative().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const LeadFiltersSchema = z.object({
  status: z.array(z.enum(['new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])).optional(),
  source: z.array(z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'other'])).optional(),
  tags: z.array(z.string().uuid()).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional(),
  date_range: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
  value_min: z.number().nonnegative().optional(),
  value_max: z.number().nonnegative().optional(),
});

export const LeadNoteCreateSchema = z.object({
  lead_id: z.string().uuid('Invalid lead ID'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
});

export const LeadNoteUpdateSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
});

export const SavedSearchCreateSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(200, 'Name must be 200 characters or less'),
  filters: z.object({
    location: z.string().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    status: z.enum(['active', 'sold']).optional(),
    featured: z.boolean().optional(),
  }).optional(),
  alert_enabled: z.boolean().optional(),
  alert_frequency: z.enum(['instant', 'daily', 'weekly']).optional(),
});

export const SavedSearchUpdateSchema = SavedSearchCreateSchema.partial().extend({
  id: z.string().uuid('Invalid saved search ID'),
});

export const SavedSearchDeleteSchema = z.object({
  id: z.string().uuid('Invalid saved search ID'),
});

export type ListingInput = z.infer<typeof ListingSchema>;
export type InquiryInput = z.infer<typeof InquirySchema>;
export type InquiryStatusInput = z.infer<typeof InquiryStatusSchema>;
export type AgencySettingsInput = z.infer<typeof AgencySettingsSchema>;
export type StripeCheckoutInput = z.infer<typeof StripeCheckoutSchema>;
export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserRoleInput = z.infer<typeof UserRoleSchema>;
export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>;
export type LeadFiltersInput = z.infer<typeof LeadFiltersSchema>;
export type LeadNoteCreateInput = z.infer<typeof LeadNoteCreateSchema>;
export type LeadNoteUpdateInput = z.infer<typeof LeadNoteUpdateSchema>;
export type SavedSearchCreateInput = z.infer<typeof SavedSearchCreateSchema>;
export type SavedSearchUpdateInput = z.infer<typeof SavedSearchUpdateSchema>;
export type SavedSearchDeleteInput = z.infer<typeof SavedSearchDeleteSchema>;

export const ReviewCreateSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000, 'Comment too long').optional().nullable(),
});

export const ReviewDeleteSchema = z.object({
  id: z.string().uuid('Invalid review ID'),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;
export type ReviewDeleteInput = z.infer<typeof ReviewDeleteSchema>;

export function validateAgencyId(agencyId: string | null): string {
  if (!agencyId) {
    throw new Error('Agency context required');
  }
  return agencyId;
}