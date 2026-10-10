-- Apply before publishing the form with dog_breed.
-- Nullable for existing registrations from previous events.
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS dog_breed text;
