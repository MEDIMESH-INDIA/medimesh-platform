CREATE TABLE IF NOT EXISTS public.data_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type text NOT NULL,
    name text NOT NULL,
    publisher text,
    base_url text,
    license text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_source_type CHECK (source_type IN ('government_open_data', 'provider_supplied', 'platform_researched', 'external_live', 'demonstration', 'user_submitted'))
);

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.hospital_evidence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    source_id uuid REFERENCES public.data_sources(id) ON DELETE RESTRICT,
    external_record_id text,
    source_url text,
    supported_scope text[],
    review_status text NOT NULL DEFAULT 'unreviewed',
    source_updated_at timestamptz,
    checked_at timestamptz,
    submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    public_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_evidence_status CHECK (review_status IN ('unreviewed', 'self_reported', 'source_matched', 'manually_reviewed', 'stale', 'rejected', 'demonstration'))
);

CREATE TRIGGER update_hospital_evidence_updated_at BEFORE UPDATE ON public.hospital_evidence FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type text NOT NULL,
    subject_id uuid NOT NULL, -- Polmorphic (hospital_id, doctor_id)
    submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    request_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    submitted_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    review_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_vr_subject CHECK (subject_type IN ('hospital', 'doctor')),
    CONSTRAINT check_vr_status CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_changes'))
);

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.verification_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id uuid REFERENCES public.verification_requests(id) ON DELETE CASCADE,
    document_type text NOT NULL,
    storage_path text NOT NULL,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active data sources" ON public.data_sources FOR SELECT USING (active = true);
CREATE POLICY "Public can read reviewed hospital evidence" ON public.hospital_evidence FOR SELECT USING (review_status IN ('source_matched', 'manually_reviewed', 'demonstration'));

GRANT SELECT ON public.data_sources TO anon, authenticated;
GRANT SELECT ON public.hospital_evidence TO anon, authenticated;

-- verification requests/documents are private. Admins can view/update. Submitters can view own.
CREATE POLICY "Submitters can view own requests" ON public.verification_requests FOR SELECT TO authenticated USING (submitted_by = auth.uid());
CREATE POLICY "Submitters can insert own requests" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Submitters can view own documents" ON public.verification_documents FOR SELECT TO authenticated USING (uploaded_by = auth.uid());
CREATE POLICY "Submitters can insert own documents" ON public.verification_documents FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

GRANT SELECT, INSERT ON public.verification_requests TO authenticated;
GRANT SELECT, INSERT ON public.verification_documents TO authenticated;
