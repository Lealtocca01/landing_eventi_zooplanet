/*
  # Fix security issues

  1. Drop unused indexes
    - Remove `idx_registrations_email` (email has unique constraint, no separate index needed)
    - Remove `idx_registrations_referred_by` (not used for queries)
  
  2. Fix function search path
    - Set `search_path` to immutable 'pg_catalog' for security
    - Prevents privilege escalation via search path manipulation

  3. Security Notes
    - Unique constraints automatically create indexes for email lookups
    - Unused indexes waste storage and slow down writes
    - Immutable search_path prevents function hijacking attacks
*/

DROP INDEX IF EXISTS idx_registrations_email;
DROP INDEX IF EXISTS idx_registrations_referred_by;

CREATE OR REPLACE FUNCTION increment_referral_count(ref_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  UPDATE registrations
  SET referral_count = referral_count + 1
  WHERE referral_code = ref_code;
END;
$$;