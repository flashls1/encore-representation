-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create site_settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL DEFAULT 'Sill-Con',
    site_description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    event_start_date DATE,
    event_end_date DATE,
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    discord_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create home_content table
CREATE TABLE public.home_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_title TEXT NOT NULL DEFAULT 'Welcome to Sill-Con',
    hero_subtitle TEXT,
    hero_image_url TEXT,
    cta_primary_text TEXT DEFAULT 'Get Tickets',
    cta_primary_url TEXT,
    cta_secondary_text TEXT DEFAULT 'View Schedule',
    cta_secondary_url TEXT,
    stats_guests INTEGER DEFAULT 0,
    stats_vendors INTEGER DEFAULT 0,
    stats_events INTEGER DEFAULT 0,
    featured_content_title TEXT,
    featured_content_description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guest_known_for table
CREATE TABLE public.guest_known_for (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    booth_number TEXT,
    logo_url TEXT,
    website_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor_specialties table
CREATE TABLE public.vendor_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    specialty TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create schedule_days table
CREATE TABLE public.schedule_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create schedule_events table
CREATE TABLE public.schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES public.schedule_days(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    event_type TEXT,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news_articles table
CREATE TABLE public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    featured_image_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create navigation_items table
CREATE TABLE public.navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    is_external BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contact_settings table
CREATE TABLE public.contact_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_title TEXT NOT NULL DEFAULT 'Contact Us',
    page_description TEXT,
    form_enabled BOOLEAN DEFAULT TRUE,
    notification_email TEXT,
    success_message TEXT DEFAULT 'Thank you for your message! We will get back to you soon.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for guest images
INSERT INTO storage.buckets (id, name, public) VALUES ('guest-images', 'guest-images', true);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_known_for ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view home_content" ON public.home_content FOR SELECT USING (true);
CREATE POLICY "Public can view guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public can view guest_known_for" ON public.guest_known_for FOR SELECT USING (true);
CREATE POLICY "Public can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Public can view vendor_specialties" ON public.vendor_specialties FOR SELECT USING (true);
CREATE POLICY "Public can view schedule_days" ON public.schedule_days FOR SELECT USING (true);
CREATE POLICY "Public can view schedule_events" ON public.schedule_events FOR SELECT USING (true);
CREATE POLICY "Public can view published news" ON public.news_articles FOR SELECT USING (published = true);
CREATE POLICY "Public can view visible navigation" ON public.navigation_items FOR SELECT USING (visible = true);
CREATE POLICY "Public can view contact_settings" ON public.contact_settings FOR SELECT USING (true);

-- RLS Policies for admin write access
CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage home_content" ON public.home_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage guests" ON public.guests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage guest_known_for" ON public.guest_known_for FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage vendors" ON public.vendors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage vendor_specialties" ON public.vendor_specialties FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage schedule_days" ON public.schedule_days FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage schedule_events" ON public.schedule_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage news_articles" ON public.news_articles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all news" ON public.news_articles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage navigation_items" ON public.navigation_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all navigation" ON public.navigation_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage contact_settings" ON public.contact_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for guest images
CREATE POLICY "Public can view guest images" ON storage.objects FOR SELECT USING (bucket_id = 'guest-images');
CREATE POLICY "Admins can upload guest images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guest-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update guest images" ON storage.objects FOR UPDATE USING (bucket_id = 'guest-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete guest images" ON storage.objects FOR DELETE USING (bucket_id = 'guest-images' AND public.has_role(auth.uid(), 'admin'));

-- Insert default data
INSERT INTO public.site_settings (site_name, site_description, contact_email) VALUES (
    'Sill-Con', 
    'The ultimate anime convention at Fort Sill, Lawton, Oklahoma', 
    'info@sillcon.com'
);

INSERT INTO public.home_content (hero_title, hero_subtitle) VALUES (
    'Welcome to Sill-Con 2024',
    'The ultimate anime convention experience at Fort Sill, Oklahoma'
);

INSERT INTO public.contact_settings (page_title, page_description) VALUES (
    'Contact Us',
    'Get in touch with the Sill-Con team for any questions or inquiries'
);

-- Insert default navigation items
INSERT INTO public.navigation_items (label, url, sort_order) VALUES 
    ('Home', '/', 1),
    ('Guests', '/guests', 2),
    ('Schedule', '/schedule', 3),
    ('Vendors', '/vendors', 4),
    ('News', '/news', 5),
    ('Contact', '/contact', 6);