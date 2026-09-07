CREATE TABLE IF NOT EXISTS public.doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    
    -- Authenticated Claim Link
    claimed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
    
    -- Basic Info
    full_name text NOT NULL,
    specialization text,
    experience_years integer,
    
    -- Registration
    medical_registration_number text,
    registration_year text,
    medical_council text,
    
    -- Location
    locality text,
    city text NOT NULL DEFAULT 'Navi Mumbai',
    state text NOT NULL DEFAULT 'Maharashtra',
    
    -- Verification
    verification_status text NOT NULL DEFAULT 'unreviewed',
    
    -- Home Visits
    offers_home_visits boolean NOT NULL DEFAULT false,
    home_visit_service_areas text[],
    home_visit_days text[],
    home_visit_start_time time,
    home_visit_end_time time,
    home_visit_fee numeric,
    home_visit_note text,
    professional_phone text,
    whatsapp_number text,
    home_visit_contact_public boolean NOT NULL DEFAULT false,
    
    -- Provenance
    source_dataset text,
    
    -- Metadata
    publication_status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT check_doc_pub_status CHECK (publication_status IN ('draft', 'under_review', 'published', 'archived')),
    CONSTRAINT check_doc_verif_status CHECK (verification_status IN ('unreviewed', 'pending', 'verified', 'rejected'))
);

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published doctors" ON public.doctors FOR SELECT USING (publication_status = 'published');

GRANT SELECT ON public.doctors TO anon, authenticated;

-- Allow authenticated doctors to update their own canonical record if claimed
CREATE POLICY "Claimed doctors can update their canonical record" ON public.doctors FOR UPDATE TO authenticated USING (claimed_by_user_id = auth.uid()) WITH CHECK (claimed_by_user_id = auth.uid());
GRANT UPDATE ON public.doctors TO authenticated;

-- Canonical affiliations (so unclaimed doctors can have affiliations)
CREATE TABLE IF NOT EXISTS public.doctor_affiliations_directory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name text, -- For text-only affiliations without a linked canonical hospital
    department text,
    position text,
    is_current boolean NOT NULL DEFAULT true,
    source_dataset text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_doctor_affiliations_directory_updated_at BEFORE UPDATE ON public.doctor_affiliations_directory FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.doctor_affiliations_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read doctor affiliations" ON public.doctor_affiliations_directory FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.doctors WHERE id = doctor_affiliations_directory.doctor_id AND publication_status = 'published')
);

GRANT SELECT ON public.doctor_affiliations_directory TO anon, authenticated;

-- Allow authenticated doctors to update their own affiliations if claimed
CREATE POLICY "Claimed doctors can update their canonical affiliations" ON public.doctor_affiliations_directory FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.doctors WHERE id = doctor_affiliations_directory.doctor_id AND claimed_by_user_id = auth.uid())
);
GRANT INSERT, UPDATE, DELETE ON public.doctor_affiliations_directory TO authenticated;

