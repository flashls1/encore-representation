// ============================================================================
// Encore Representation — Database Type Definitions
// Synced with live DB schema via PostgREST (2026-03-08)
// ============================================================================

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  discord_url: string | null;
  tiktok_url: string | null;
  theme: string;
  updated_at: string;
}

export interface HomeContent {
  id: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_mode: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  countdown_enabled: boolean;
  featured_content_title: string | null;
  featured_content_description: string | null;
  about_title: string | null;
  about_description: string | null;
  hero_text_visible: boolean;
  cta_offset_top: string | null;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  page_title: string;
  page_description: string | null;
  form_enabled: boolean;
  notification_email: string | null;
  success_message: string | null;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  submitted_at: string;
}

export interface MediaLibraryItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// ============================================================================
// Talent System — Matches actual DB schema
// ============================================================================

export interface Talent {
  id: string;
  name: string;
  slug: string;
  headshot_url: string | null;
  bio: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  talent_roles?: TalentRole[];
  talent_images?: TalentImage[];
}

export interface TalentRole {
  id: string;
  talent_id: string;
  role_name: string;
  character_name: string;
  image_url: string | null;
  show_color: string | null;
  bg_image_url: string | null;
  role_type: string;
}

export interface TalentImage {
  id: string;
  talent_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  visible: boolean;
  is_external: boolean;
  created_at: string;
}

export interface AdminProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  display_password: string;
  is_super_admin: boolean;
  created_at: string;
}

// ============================================================================
// Upcoming Events
// ============================================================================
export interface UpcomingEvent {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  link_url: string | null;
  link_visible: boolean;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Booking Requests
// ============================================================================
export interface BookingRequest {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  company_organization: string | null;
  event_type: string;
  event_date: string | null;
  event_location: string | null;
  event_duration: string | null;
  estimated_audience_size: string | null;
  talent_requested: string | null;
  budget_range: string | null;
  additional_details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CMS Page Content (About / Book)
// ============================================================================
export interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'image-text' | 'owner-hero';
  title?: string;
  content: string;
  media_url: string;
}

export interface AboutContent {
  id: string;
  page_title: string;
  page_description: string | null;
  hero_image_url: string | null;
  sections: ContentSection[];
  updated_at: string;
}

export interface BookContent {
  id: string;
  page_title: string;
  page_description: string | null;
  hero_image_url: string | null;
  sections: ContentSection[];
  updated_at: string;
}