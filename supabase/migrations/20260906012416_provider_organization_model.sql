CREATE TABLE IF NOT EXISTS public.hospital_organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    organization_name text NOT NULL,
    slug text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_org_status CHECK (status IN ('active', 'suspended', 'archived'))
);

CREATE TRIGGER update_hospital_orgs_updated_at BEFORE UPDATE ON public.hospital_organizations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TABLE IF NOT EXISTS public.hospital_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_role text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (hospital_id, user_id),
    CONSTRAINT check_membership_role CHECK (membership_role IN ('owner', 'admin', 'editor', 'viewer')),
    CONSTRAINT check_membership_status CHECK (status IN ('pending', 'active', 'suspended'))
);

CREATE TRIGGER update_hospital_memberships_updated_at BEFORE UPDATE ON public.hospital_memberships FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.hospital_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_memberships ENABLE ROW LEVEL SECURITY;

-- Helper to check membership
CREATE OR REPLACE FUNCTION public.is_hospital_member(check_hospital_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hospital_memberships
    WHERE hospital_id = check_hospital_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_hospital_member(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_hospital_member(uuid) TO authenticated, service_role;

-- Members can read their organization
CREATE POLICY "Members can read their organizations" ON public.hospital_organizations FOR SELECT TO authenticated USING (
    public.is_hospital_member(hospital_id)
);
CREATE POLICY "Members can read their memberships" ON public.hospital_memberships FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_hospital_member(hospital_id)
);

-- Note: Write policies will be defined with admin paths/verification.
GRANT SELECT ON public.hospital_organizations TO authenticated;
GRANT SELECT ON public.hospital_memberships TO authenticated;
