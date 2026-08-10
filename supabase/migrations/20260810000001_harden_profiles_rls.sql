-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view verified doctors and hospitals" ON public.profiles;

-- 2. Add CHECK constraints to enforce valid data on INSERT/UPDATE
ALTER TABLE public.profiles
ADD CONSTRAINT check_verification_status 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- 3. Redefine RLS Policies

-- SELECT: Private account profile. Users can only read their own profile.
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Normal signup can only create specific roles and MUST set verification_status = 'pending'.
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id AND
    role IN ('patient', 'doctor', 'hospital') AND
    verification_status = 'pending'
  );

-- UPDATE: Users can update their own profile fields.
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Trigger to prevent users from escalating privileges or self-verifying during UPDATE
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- We only restrict changes for normal API requests (authenticated or anon roles via PostgREST)
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Role modification is not permitted.';
    END IF;

    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
      RAISE EXCEPTION 'Verification status modification is not permitted.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_profile_fields_before_update ON public.profiles;
CREATE TRIGGER check_profile_fields_before_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();
