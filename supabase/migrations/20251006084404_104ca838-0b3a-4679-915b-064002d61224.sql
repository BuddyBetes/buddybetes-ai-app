-- Add new columns to events table for carousel display
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS badge text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS color_gradient text;

-- Insert Diabetes Awareness Month event
INSERT INTO public.events (
  id,
  title, 
  description,
  event_date,
  location,
  is_active,
  subtitle,
  badge,
  image_url,
  color_gradient
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Diabetes Awareness Month',
  'Join BuddyBetes, together with our sponsors and partners, as we celebrate Diabetes Awareness Month. Be part of community sessions, free screenings, talks, and more. Let''s raise awareness, support one another, and inspire change!',
  '2025-11-08 09:00:00+08',
  'Various Locations, Philippines',
  true,
  'Come together with BuddyBetes — unite for a healthier tomorrow!',
  'Live Event',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
  'from-[#208687] to-[#165e5e]'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  location = EXCLUDED.location,
  subtitle = EXCLUDED.subtitle,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  color_gradient = EXCLUDED.color_gradient;

-- Insert BuddyBetes Webinar event
INSERT INTO public.events (
  id,
  title,
  description,
  event_date,
  location,
  is_active,
  subtitle,
  badge,
  image_url,
  color_gradient,
  video_url
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'BuddyBetes Webinar',
  'A weekly webinar series featuring esteemed speakers discussing diabetes awareness, management, technology, and community stories. Join us live, ask questions, and grow in knowledge together.',
  '2025-11-13 19:00:00+08',
  'Online',
  true,
  'Tune in via FB Live at https://www.facebook.com/buddybetes',
  'Webinar Series',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
  'from-[#165e5e] to-[#208687]',
  'https://www.facebook.com/buddybetes'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  location = EXCLUDED.location,
  subtitle = EXCLUDED.subtitle,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  color_gradient = EXCLUDED.color_gradient,
  video_url = EXCLUDED.video_url;