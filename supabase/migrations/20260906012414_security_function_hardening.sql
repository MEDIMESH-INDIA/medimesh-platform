DO $$
BEGIN
    -- 1. handle_updated_at
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at' AND pronamespace = 'public'::regnamespace) THEN
        EXECUTE 'ALTER FUNCTION public.handle_updated_at() SET search_path = public;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM public, anon, authenticated;';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role, postgres;';
    END IF;

    -- 2. handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres;';
    END IF;

    -- 3. protect_profile_fields
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'protect_profile_fields' AND pronamespace = 'public'::regnamespace) THEN
        EXECUTE 'ALTER FUNCTION public.protect_profile_fields() SET search_path = public;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM public, anon, authenticated;';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.protect_profile_fields() TO service_role, postgres;';
    END IF;

    -- 4. rls_auto_enable
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable' AND pronamespace = 'public'::regnamespace) THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role, postgres;';
    END IF;
END
$$;
