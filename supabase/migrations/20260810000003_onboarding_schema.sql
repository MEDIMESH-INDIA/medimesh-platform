-- ==========================================
-- PHASE 2.5: ONBOARDING DATA MODEL
-- ==========================================

-- 1. PATIENT MEDICAL PROFILES
CREATE TABLE IF NOT EXISTS public.patient_medical_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group TEXT,
  date_of_birth DATE,
  gender TEXT,
  allergies TEXT,
  current_medications TEXT,
  chronic_conditions TEXT,
  medical_history TEXT,
  surgical_history TEXT,
  family_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_medical_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient_medical_select_own" ON public.patient_medical_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patient_medical_insert_own" ON public.patient_medical_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "patient_medical_update_own" ON public.patient_medical_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. PATIENT EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.patient_emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_hospital TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patient_emergency_select_own" ON public.patient_emergency_contacts FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "patient_emergency_insert_own" ON public.patient_emergency_contacts FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "patient_emergency_update_own" ON public.patient_emergency_contacts FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "patient_emergency_delete_own" ON public.patient_emergency_contacts FOR DELETE USING (auth.uid() = patient_id);

-- 3. DOCTOR AFFILIATIONS
CREATE TABLE IF NOT EXISTS public.doctor_affiliations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_type TEXT NOT NULL, -- 'Private Clinic', 'Hospital', 'Both', 'Other'
  organization_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  employment_type TEXT,
  city TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.doctor_affiliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_affil_select_own" ON public.doctor_affiliations FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_affil_insert_own" ON public.doctor_affiliations FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_affil_update_own" ON public.doctor_affiliations FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_affil_delete_own" ON public.doctor_affiliations FOR DELETE USING (auth.uid() = doctor_id);

-- 4. DOCTOR QUALIFICATIONS
CREATE TABLE IF NOT EXISTS public.doctor_qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  medical_registration_number TEXT NOT NULL,
  medical_council TEXT NOT NULL,
  registration_state TEXT,
  years_of_experience INTEGER,
  degrees TEXT,
  certifications TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.doctor_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_qual_select_own" ON public.doctor_qualifications FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_qual_insert_own" ON public.doctor_qualifications FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_qual_update_own" ON public.doctor_qualifications FOR UPDATE USING (auth.uid() = doctor_id);

-- 5. DOCTOR SPECIALIZATIONS
CREATE TABLE IF NOT EXISTS public.doctor_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_specialization TEXT NOT NULL,
  sub_specializations TEXT,
  areas_of_expertise TEXT,
  languages_spoken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.doctor_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctor_spec_select_own" ON public.doctor_specializations FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "doctor_spec_insert_own" ON public.doctor_specializations FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "doctor_spec_update_own" ON public.doctor_specializations FOR UPDATE USING (auth.uid() = doctor_id);

-- 6. HOSPITAL DETAILS
CREATE TABLE IF NOT EXISTS public.hospital_details (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_type TEXT NOT NULL,
  registration_number TEXT,
  accreditation TEXT,
  year_established INTEGER,
  website TEXT,
  address TEXT,
  state TEXT,
  pin_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  total_beds INTEGER,
  icu_beds INTEGER,
  emergency_department BOOLEAN DEFAULT false,
  ambulance_availability BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospital_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hospital_details_select_own" ON public.hospital_details FOR SELECT USING (auth.uid() = id);
CREATE POLICY "hospital_details_insert_own" ON public.hospital_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "hospital_details_update_own" ON public.hospital_details FOR UPDATE USING (auth.uid() = id);

-- 7. HOSPITAL SERVICES & SPECIALTIES
CREATE TABLE IF NOT EXISTS public.hospital_services (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialties TEXT, -- JSON array of strings
  facilities TEXT, -- JSON array of strings
  services TEXT, -- JSON array of strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hospital_services_select_own" ON public.hospital_services FOR SELECT USING (auth.uid() = id);
CREATE POLICY "hospital_services_insert_own" ON public.hospital_services FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "hospital_services_update_own" ON public.hospital_services FOR UPDATE USING (auth.uid() = id);

-- Attach update triggers
CREATE TRIGGER update_patient_medical_updated_at BEFORE UPDATE ON public.patient_medical_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_patient_emergency_updated_at BEFORE UPDATE ON public.patient_emergency_contacts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_doctor_affil_updated_at BEFORE UPDATE ON public.doctor_affiliations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_doctor_qual_updated_at BEFORE UPDATE ON public.doctor_qualifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_doctor_spec_updated_at BEFORE UPDATE ON public.doctor_specializations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_hospital_details_updated_at BEFORE UPDATE ON public.hospital_details FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_hospital_services_updated_at BEFORE UPDATE ON public.hospital_services FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
