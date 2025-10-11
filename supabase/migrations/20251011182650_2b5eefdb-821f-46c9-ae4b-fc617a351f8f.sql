-- Add index for faster QR code lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_qr_code 
ON event_registrations(qr_code);

-- Add checked_in timestamp
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Update trigger to set checked_in_at when checked_in changes
CREATE OR REPLACE FUNCTION update_checked_in_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checked_in = true AND (OLD.checked_in = false OR OLD.checked_in IS NULL) THEN
    NEW.checked_in_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_checked_in_timestamp ON event_registrations;
CREATE TRIGGER trg_update_checked_in_timestamp
BEFORE UPDATE ON event_registrations
FOR EACH ROW
EXECUTE FUNCTION update_checked_in_timestamp();