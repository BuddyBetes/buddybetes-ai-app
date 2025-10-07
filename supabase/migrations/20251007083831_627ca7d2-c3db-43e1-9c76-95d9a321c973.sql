-- Add unique constraint to prevent duplicate event registrations
-- Using event_id + email as the unique combination
ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_event_email_unique 
UNIQUE (event_id, email);