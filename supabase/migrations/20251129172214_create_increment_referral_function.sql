/*
  # Create function to increment referral count

  1. New Functions
    - `increment_referral_count` - Increments the referral_count for a user when someone uses their referral code
  
  2. Important Notes
    - This function is called automatically when a new registration includes a referral code
    - It safely increments the counter for the referring user
*/

CREATE OR REPLACE FUNCTION increment_referral_count(ref_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE registrations
  SET referral_count = referral_count + 1
  WHERE referral_code = ref_code;
END;
$$;