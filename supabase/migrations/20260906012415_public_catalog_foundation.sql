-- Canonical Hospital Catalog
CREATE TABLE IF NOT EXISTS public.hospitals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    legal_name text,
    hospital_type text,
    address_line_1 text,
    address_line_2 text,
    locality text,
    city text,
    district text,
    state text,
    country text NOT NULL DEFAULT 'India',
    pin_code text,
    latitude numeric,
    longitude numeric,
    public_phone text,
    public_email text,
    website text,
    year_established integer,
    total_beds integer,
    icu_beds integer,
    emergency_department boolean,
    ambulance_available boolean,
    publication_status text NOT NULL DEFAULT 'draft',
    data_status text NOT NULL DEFAULT 'unreviewed',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_publication_status CHECK (publication_status IN ('draft', 'under_review', 'published', 'archived'))
);

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Taxonomies
CREATE TABLE IF NOT EXISTS public.specialties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hospital_specialties (
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    specialty_id uuid REFERENCES public.specialties(id) ON DELETE CASCADE,
    source_evidence_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (hospital_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS public.facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hospital_facilities (
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    facility_id uuid REFERENCES public.facilities(id) ON DELETE CASCADE,
    availability_status text NOT NULL DEFAULT 'unknown',
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (hospital_id, facility_id),
    CONSTRAINT check_facility_availability CHECK (availability_status IN ('available', 'unavailable', 'unknown', 'not_applicable'))
);

CREATE TABLE IF NOT EXISTS public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hospital_services_catalog (
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    availability_status text NOT NULL DEFAULT 'unknown',
    source_evidence_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (hospital_id, service_id),
    CONSTRAINT check_service_availability CHECK (availability_status IN ('available', 'unavailable', 'unknown', 'not_applicable'))
);

-- RLS: Only published hospitals/taxonomies are publicly readable. Admins/owners write (handled later).
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_services_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published hospitals" ON public.hospitals FOR SELECT USING (publication_status = 'published');
CREATE POLICY "Public can read active specialties" ON public.specialties FOR SELECT USING (active = true);
CREATE POLICY "Public can read published hospital specialties" ON public.hospital_specialties FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_specialties.hospital_id AND hospitals.publication_status = 'published')
);
CREATE POLICY "Public can read active facilities" ON public.facilities FOR SELECT USING (active = true);
CREATE POLICY "Public can read published hospital facilities" ON public.hospital_facilities FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_facilities.hospital_id AND hospitals.publication_status = 'published')
);
CREATE POLICY "Public can read active services" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Public can read published hospital services" ON public.hospital_services_catalog FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_services_catalog.hospital_id AND hospitals.publication_status = 'published')
);

GRANT SELECT ON public.hospitals TO anon, authenticated;
GRANT SELECT ON public.specialties TO anon, authenticated;
GRANT SELECT ON public.hospital_specialties TO anon, authenticated;
GRANT SELECT ON public.facilities TO anon, authenticated;
GRANT SELECT ON public.hospital_facilities TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.hospital_services_catalog TO anon, authenticated;
