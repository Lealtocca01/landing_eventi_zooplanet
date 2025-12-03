/*
  # Add confirmation_sent_at column

  1. New Column
    - `confirmation_sent_at` (timestamptz, nullable)
      - Tracks when confirmation email was sent by n8n
      - Nullable to allow existing rows and new registrations before email is sent
*/

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
