-- Allow doctor_profiles to exist without a linked auth.users record for unclaimed directory listings.
ALTER TABLE public.doctor_profiles DROP CONSTRAINT doctor_profiles_doctor_id_fkey;

-- We can optionally add an auth_user_id column if a doctor claims this profile later
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS claim_status text NOT NULL DEFAULT 'unclaimed';
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
