ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS confirmation_queued_at timestamptz;
