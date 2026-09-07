-- Add home visit fields to doctor_profiles
ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS offers_home_visits boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS professional_contact_phone text,
  ADD COLUMN IF NOT EXISTS whatsapp_contact text,
  ADD COLUMN IF NOT EXISTS home_visit_contact_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_visit_service_areas text[],
  ADD COLUMN IF NOT EXISTS home_visit_days text[],
  ADD COLUMN IF NOT EXISTS home_visit_start_time time,
  ADD COLUMN IF NOT EXISTS home_visit_end_time time,
  ADD COLUMN IF NOT EXISTS home_visit_fee numeric,
  ADD COLUMN IF NOT EXISTS home_visit_note text;

-- Add a check constraint to ensure time is valid if days are provided
-- (Optional, but good practice. For now we will keep it simple and just allow nullable)
