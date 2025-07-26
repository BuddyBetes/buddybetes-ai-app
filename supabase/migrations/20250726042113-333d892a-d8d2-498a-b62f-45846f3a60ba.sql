-- Insert the "PDS30" discount code for 30% off access, limited to 50 people
INSERT INTO public.discount_codes (code, discount_percentage, duration_days, max_uses, expires_at, is_active, current_uses)
VALUES ('PDS30', 30, 30, 50, NULL, true, 0);