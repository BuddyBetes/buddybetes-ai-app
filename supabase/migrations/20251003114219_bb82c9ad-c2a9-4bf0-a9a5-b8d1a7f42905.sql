-- Insert a sample event for the announcement
INSERT INTO public.events (
  id,
  title,
  description,
  event_date,
  location,
  video_url,
  max_attendees,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'BuddyBetes Community Meetup 2025',
  'Join us for an exclusive community meetup! Connect with fellow BuddyBetes users, learn tips and tricks for managing diabetes, and enter our exciting raffle. All attendees will receive a unique QR code for check-in and raffle entry. Don''t miss this opportunity to be part of our growing community!',
  '2025-11-15 14:00:00+00'::timestamp with time zone,
  'Metro Manila, Philippines',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  100,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_date = EXCLUDED.event_date,
  location = EXCLUDED.location,
  video_url = EXCLUDED.video_url,
  max_attendees = EXCLUDED.max_attendees,
  is_active = EXCLUDED.is_active;