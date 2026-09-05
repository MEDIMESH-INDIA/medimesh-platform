CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs. NO ONE can update/delete them from browser.
-- We use the profiles table to check if the user is an admin.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;

CREATE POLICY "Admins can view audit logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (public.is_platform_admin());

-- Optionally allow admins to insert logs if they act through the browser, though server-side is preferred.
CREATE POLICY "Admins can insert audit logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin() AND actor_user_id = auth.uid());

GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;

-- Add admin policies to other tables
CREATE POLICY "Admins have full access to hospitals" ON public.hospitals TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins have full access to hospital_organizations" ON public.hospital_organizations TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins have full access to hospital_memberships" ON public.hospital_memberships TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins have full access to doctor_profiles" ON public.doctor_profiles TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins have full access to verification_requests" ON public.verification_requests TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins have full access to hospital_evidence" ON public.hospital_evidence TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
