-- Historical registrations remain separated from the October event.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS participants integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS event_id text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS reward_sent_at timestamptz;
ALTER TABLE public.registrations ALTER COLUMN referral_code SET DEFAULT replace(gen_random_uuid()::text, '-', '');
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_email_key;
CREATE UNIQUE INDEX registrations_event_email_key ON public.registrations(event_id, lower(email));
ALTER TABLE public.registrations ADD CONSTRAINT registrations_participants_check CHECK (participants BETWEEN 1 AND 8);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
DROP POLICY IF EXISTS "Users can read own registration by email" ON public.registrations;
DROP POLICY IF EXISTS "Users can update referral count" ON public.registrations;
REVOKE ALL ON public.registrations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.registrations TO service_role;
REVOKE ALL ON FUNCTION public.increment_referral_count(text) FROM PUBLIC, anon, authenticated;

-- Count actual registrations once, inside the same transaction as the insert.
CREATE OR REPLACE FUNCTION public.track_event_referral()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.registrations SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by AND event_id = NEW.event_id
      AND lower(email) <> lower(NEW.email);
    IF NOT FOUND THEN
      NEW.referred_by := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.track_event_referral() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER track_event_referral BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.track_event_referral();
CREATE INDEX registrations_confirmation_pending ON public.registrations(event_id, created_at) WHERE confirmation_sent_at IS NULL;

-- Compatibility projection for the existing n8n reward workflow, private to service_role.
CREATE OR REPLACE VIEW public.reward_events WITH (security_invoker = true) AS
SELECT id, id AS registration_id, email, first_name, referral_code, created_at,
       reward_sent_at IS NOT NULL AS sent
FROM public.registrations
WHERE event_id = 'sfilata-cuccioli-2026-10-17' AND referral_count >= 3;
REVOKE ALL ON public.reward_events FROM anon, authenticated;
GRANT SELECT ON public.reward_events TO service_role;
