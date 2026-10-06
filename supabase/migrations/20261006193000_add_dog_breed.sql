-- Nullable for registrations from previous events; required by the new event form.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS dog_breed text;
