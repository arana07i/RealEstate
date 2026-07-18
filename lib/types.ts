export type PricingTier = "starter" | "professional" | "enterprise";

export interface SupabaseRoleJoin {
  name: string;
}

export interface SupabaseUserRoleData {
  role_id: string;
  agency_id: string | null;
  roles: SupabaseRoleJoin | SupabaseRoleJoin[] | null;
}

export interface SupabaseRolePermissionRow {
  permissions: { name?: string | string[] } | null;
}

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';

export type UserRole = 'super_admin' | 'agency_admin' | 'agent' | 'viewer';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface Profile {
  id: string;
  agency_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  email_verified?: string | null;
}

export interface UserWithRole extends Profile {
  role: UserRole;
  permissions: string[];
}

export interface AuthenticatedRequest {
  user: UserWithRole;
  agencyId: string | null;
  isSuperAdmin: boolean;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
  subscription_tier: PricingTier;
  subscription_status: "active" | "trialing" | "past_due" | "canceled";
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
}

export type ListingStatus = "active" | "sold";
export type InquiryStatus = "new" | "contacted" | "closed" | "spam";

export interface Listing {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_urls: string[];
  status: ListingStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  featured: boolean;
  draft: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  verified?: boolean;
  premium?: boolean;
  previous_price?: number | null;
  property_score?: number | null;
  energy_rating?: 'A' | 'B' | 'C' | 'D' | null;
  nearby_schools_count?: number | null;
  distance_to_metro?: number | null; // in kilometers
  virtual_tour_url?: string | null;
  video_url?: string | null;
  agent_availability?: 'available' | 'unavailable' | 'by_appointment';
  agent_name?: string | null;
  agent_phone?: string | null;
  agent_avatar?: string | null;
  amenities?: string[];
  floor_plans?: Array<{ id: string; name: string; image: string; area?: string }>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ListingFormData {
  agency_id?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_urls: string[];
  status: ListingStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  featured: boolean;
  draft: boolean;
  verified?: boolean;
  premium?: boolean;
  previous_price?: number | null;
  property_score?: number | null;
  energy_rating?: 'A' | 'B' | 'C' | 'D' | null;
  nearby_schools_count?: number | null;
  distance_to_metro?: number | null;
  virtual_tour_url?: string | null;
  video_url?: string | null;
  agent_availability?: 'available' | 'unavailable' | 'by_appointment';
  agent_name?: string | null;
  agent_phone?: string | null;
  agent_avatar?: string | null;
  amenities?: string[];
  floor_plans?: Array<{ id: string; name: string; image: string; area?: string }>;
}

export interface ListingFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  featured?: boolean;
}

export interface Inquiry {
  id: string;
  agency_id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  property?: { title: string; location: string };
  created_by: string | null;
}

export interface InquiryFormData {
  property_id?: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// CRM Types
export type LeadStatus = "new" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export type LeadSource = "website" | "referral" | "social_media" | "email_campaign" | "cold_call" | "event" | "other";

export type ActivityType = "note" | "call" | "meeting" | "email" | "task" | "status_change";

export interface LeadTag {
  id: string;
  name: string;
  color: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  source?: LeadSource | null;
  tags: LeadTag[];
  assigned_to?: string | null;
  assigned_to_name?: string;
  value?: number | null;
  notes_count: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  next_task_date?: string;
  next_task_title?: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  lead_id: string;
  agent_id: string;
  agent_name?: string;
  direction: "incoming" | "outgoing";
  duration: number;
  notes: string | null;
  scheduled_at: string;
  completed_at: string | null;
  status: "scheduled" | "completed" | "missed" | "cancelled";
}

export interface Meeting {
  id: string;
  lead_id: string;
  agent_id: string;
  agent_name?: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduled_at: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  reminder_sent: boolean;
}

export interface LeadTask {
  id: string;
  lead_id: string;
  assigned_to: string;
  assigned_to_name?: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface EmailHistory {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  sent_at: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced";
  opened_at: string | null;
  clicked_at: string | null;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  timestamp: string;
  user_id: string | null;
  user_name?: string | null;
  metadata?: Record<string, unknown>;
}

export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  tags?: string[];
  assigned_to?: string[];
  search?: string;
  date_range?: "today" | "week" | "month" | "quarter" | "year";
  value_min?: number;
  value_max?: number;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status?: LeadStatus;
  source?: LeadSource;
  tag_ids?: string[];
  value?: number;
}

// Calendar Types
export type VisitStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type ReminderType = "email" | "sms";

export interface AgentAvailability {
  id: string;
  agent_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
}

export interface Visit {
  id: string;
  agency_id: string;
  property_id: string;
  lead_id: string;
  agent_id: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduled_at: string;
  duration: number; // in minutes
  status: VisitStatus;
  reminder_enabled: boolean;
  reminder_type: ReminderType;
  reminder_sent_at: string | null;
  google_calendar_event_id: string | null;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
  property?: { title: string; location: string; price: number };
  lead?: { first_name: string; last_name: string; email: string; phone: string };
  agent?: { full_name: string; email: string };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Visit;
}

export interface VisitFormData {
  property_id: string;
  lead_id: string;
  agent_id: string;
  scheduled_at: string;
  duration: number;
  reminder_type: ReminderType;
  location: string;
  notes: string;
}

export interface CalendarFilters {
  agent_id?: string;
  status?: VisitStatus[];
  date_range?: {
    start: string;
    end: string;
  };
}

// Messaging Types
export type MessageStatus = "sent" | "delivered" | "read";
export type AttachmentType = "image" | "document";
export type UserPresence = "online" | "offline" | "away";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
  mime_type: string;
}

export interface QuickReplyTemplate {
  id: string;
  title: string;
  content: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  participant_presence: UserPresence;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  property?: {
    id: string;
    title: string;
  };
  property_inquiry?: string;
}

// Notification Types
export type NotificationType = "inquiry" | "lead" | "listing" | "visit" | "message" | "system" | "billing" | "user";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  user_id: string;
  agency_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  sound_enabled: boolean;
  push_enabled: boolean;
  email_digest: boolean;
  types: {
    inquiry: boolean;
    lead: boolean;
    listing: boolean;
    visit: boolean;
    message: boolean;
    system: boolean;
    billing: boolean;
    user: boolean;
  };
}

export interface NotificationFilters {
  search?: string;
  type?: NotificationType[];
  priority?: NotificationPriority[];
  read?: boolean;
  date_range?: "today" | "week" | "month" | "all";
}

// User Profile Types
export type ThemePreference = "light" | "dark" | "system";

export interface UserProfile extends Profile {
  phone?: string | null;
  timezone?: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string | null;
  last_password_change?: string | null;
  email_verified?: string | null;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  location?: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  listing_id: string;
  listing?: {
    title: string;
    location: string;
    price: number;
    image_urls: string[];
    status: ListingStatus;
  };
  created_at: string;
  notes?: string | null;
}

export interface RecentlyViewedProperty {
  id: string;
  user_id: string;
  listing_id: string;
  listing?: {
    title: string;
    location: string;
    price: number;
    image_urls: string[];
  };
  viewed_at: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  document_type: "contract" | "inspection" | "report" | "other";
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: ThemePreference;
  email_notifications: boolean;
  sms_notifications: boolean;
  timezone: string;
  language: string;
  marketing_emails: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: PricingTier;
  status: "active" | "trialing" | "past_due" | "canceled";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: {
    brand: string;
    last4: string;
    expiry: string;
  } | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void" | "uncollectible";
  invoice_number: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  download_url: string | null;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: "login" | "logout" | "password_change" | "profile_update" | "property_saved" | "property_viewed" | "document_uploaded" | "api_key_created" | "api_key_used" | "session_revoked";
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Settings Types
export interface GeneralSettings {
  agency_name: string;
  agency_email: string;
  agency_phone: string | null;
  agency_address: string | null;
  agency_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  currency: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  stripe_enabled: boolean;
  stripe_secret_key?: string | null;
  stripe_publishable_key?: string | null;
  stripe_webhook_secret?: string | null;
  paypal_enabled: boolean;
  paypal_client_id?: string | null;
  paypal_secret?: string | null;
  tax_rate: number;
  currency: string;
}

export interface Integration {
  id: string;
  name: string;
  type: "crm" | "calendar" | "marketing" | "analytics" | "email";
  is_connected: boolean;
  config: Record<string, unknown> | null;
  last_sync_at: string | null;
  created_at: string;
}

export interface SecuritySettings {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
  two_factor_required: boolean;
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  retention_days: number;
  last_backup_at: string | null;
  next_backup_at: string | null;
  storage_location: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
  };
}

export interface Webhook {
  id: string;
  agency_id: string | null;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
  failure_count: number;
  last_delivery_at: string | null;
  last_delivery_status: string | null;
  last_delivery_response: string | null;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  delivered_at: string;
  success: boolean;
}

export type AutomationTrigger = 'lead_created' | 'lead_status_changed' | 'visit_scheduled' | 'visit_completed' | 'inquiry_received' | 'listing_created' | 'time_based';
export type AutomationAction = 'send_email' | 'send_sms' | 'create_task' | 'update_lead' | 'notify_user';

export interface AutomationRule {
  id: string;
  agency_id: string | null;
  name: string;
  trigger: AutomationTrigger;
  trigger_conditions?: Record<string, unknown>;
  action: AutomationAction;
  action_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_run_at: string | null;
  run_count: number;
}

export interface AutomationExecution {
  id: string;
  automation_rule_id: string;
  trigger_event: string;
  status: 'success' | 'failed' | 'pending';
  error_message: string | null;
  executed_at: string;
}

// Premium Features Types
export interface MortgageCalculation {
  principal: number;
  interestRate: number;
  tenure: number;
  downPayment: number;
}

export interface EmiCalculation {
  principal: number;
  interestRate: number;
  tenure: number;
}

export interface AffordabilityCalculation {
  monthlyIncome: number;
  otherExpenses: number;
  downPaymentAvailable: number;
  interestRate: number;
  tenure: number;
}

export interface InvestmentCalculation {
  propertyPrice: number;
  downPayment: number;
  monthlyRent: number;
  appreciationRate: number;
  rentalYieldRate: number;
  expenses: number;
}

export interface PriceTrend {
  date: string;
  price: number;
  area_sqft: number;
  location: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'shopping' | 'restaurant' | 'transport' | 'cafe';
  distance: number;
  rating?: number;
  address?: string;
}

export interface CrimeScore {
  overall: number;
  safetyLevel: 'very_safe' | 'safe' | 'moderate' | 'caution' | 'risky';
  categories: {
    theft: number;
    burglary: number;
    assault: number;
    vandalism: number;
  };
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface PropertyComparison {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
  listing: Listing;
}

export interface FavoriteCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  property_count?: number;
  properties?: SavedProperty[];
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: ListingFilters;
  alert_enabled: boolean;
  alert_frequency: 'daily' | 'weekly' | 'instant' | null;
  created_at: string;
  updated_at: string;
}

export interface AiRecommendationRequest {
  budget_min?: number;
  budget_max?: number;
  preferred_locations?: string[];
  bedrooms_min?: number;
  bathrooms_min?: number;
  amenities?: string[];
  investment_purpose?: boolean;
}

export interface AiRecommendation {
  listing_id: string;
  match_score: number;
  reasons: string[];
  listing: Listing;
}

export interface RentalYieldCalculation {
  propertyPrice: number;
  monthlyRent: number;
  occupancyRate: number;
  expenses: number;
}

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  listing?: {
    title: string;
    location: string;
  };
}

export interface ReviewFilters {
  listing_id?: string;
}