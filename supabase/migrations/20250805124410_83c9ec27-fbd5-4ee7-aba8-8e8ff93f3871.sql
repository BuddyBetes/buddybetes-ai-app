-- Create Free30Days discount code for 30 days free premium access
INSERT INTO discount_codes (code, discount_percentage, duration_days, max_uses, current_uses, is_active, expires_at)
VALUES ('Free30Days', 100, 30, 10, 0, true, null);