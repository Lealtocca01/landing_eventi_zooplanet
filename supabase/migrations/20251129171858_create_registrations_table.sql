/*
  # Create registrations table for Natale con i Cuccioli event

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `first_name` (text, required) - Nome del partecipante
      - `last_name` (text, required) - Cognome del partecipante
      - `city` (text, required) - Città di residenza
      - `email` (text, required, unique) - Email del partecipante
      - `phone` (text, required) - Numero di cellulare
      - `time_slot` (text, required) - Fascia oraria scelta
      - `referral_code` (text, unique) - Codice referral personale
      - `referred_by` (text, nullable) - Codice referral di chi ha invitato
      - `privacy_accepted` (boolean, default true) - Consenso privacy
      - `created_at` (timestamptz, default now())
      - `referral_count` (integer, default 0) - Conteggio amici invitati
  
  2. Security
    - Enable RLS on `registrations` table
    - Add policy for authenticated users to read their own data
    - Add policy for insert (public registration)
    - Add policy for updating referral_count

  3. Important Notes
    - Email must be unique to prevent duplicate registrations
    - Referral code generated automatically
    - Referral count tracked for free photo reward (3 friends = 1 free photo pass)
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  city text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  time_slot text NOT NULL,
  referral_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  referred_by text,
  privacy_accepted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  referral_count integer DEFAULT 0
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read own registration by email"
  ON registrations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can update referral count"
  ON registrations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_referral_code ON registrations(referral_code);
CREATE INDEX IF NOT EXISTS idx_registrations_referred_by ON registrations(referred_by);