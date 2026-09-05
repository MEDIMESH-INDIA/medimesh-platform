CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    doctor_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    slug text UNIQUE NOT NULL,
    public_display_name text NOT NULL,
    professional_summary text,
    years_of_experience integer,
    city text,
    state text,
    consultation_modes text[], -- array of modes e.g., 'in-person', 'video'
    publication_status text NOT NULL DEFAULT 'draft',
    data_status text NOT NULL DEFAULT 'unreviewed',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_doc_pub_status CHECK (publication_status IN ('draft', 'under_review', 'published', 'archived'))
);

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.doctor_hospital_affiliations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES public.doctor_profiles(doctor_id) ON DELETE CASCADE,
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    department text,
    position text,
    employment_type text,
    start_date date,
    end_date date,
    is_current boolean NOT NULL DEFAULT true,
    verification_status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_affil_verif_status CHECK (verification_status IN ('pending', 'verified', 'rejected'))
);

CREATE TRIGGER update_doctor_hosp_affil_updated_at BEFORE UPDATE ON public.doctor_hospital_affiliations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_hospital_affiliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published doctors" ON public.doctor_profiles FOR SELECT USING (publication_status = 'published');
CREATE POLICY "Public can read verified doctor affiliations" ON public.doctor_hospital_affiliations FOR SELECT USING (
    verification_status = 'verified' AND
    EXISTS (SELECT 1 FROM public.doctor_profiles WHERE doctor_id = doctor_hospital_affiliations.doctor_id AND publication_status = 'published') AND
    EXISTS (SELECT 1 FROM public.hospitals WHERE id = doctor_hospital_affiliations.hospital_id AND publication_status = 'published')
);

CREATE POLICY "Doctors can read/write own profile" ON public.doctor_profiles FOR ALL TO authenticated USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can read/write own affiliations" ON public.doctor_hospital_affiliations FOR ALL TO authenticated USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

GRANT SELECT ON public.doctor_profiles TO anon, authenticated;
GRANT SELECT ON public.doctor_hospital_affiliations TO anon, authenticated;
-- Grants for updates by the doctor
GRANT INSERT, UPDATE, DELETE ON public.doctor_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctor_hospital_affiliations TO authenticated;
