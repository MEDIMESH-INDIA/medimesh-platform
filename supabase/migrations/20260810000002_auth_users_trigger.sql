-- Function to handle new user signup automatically via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name, 
    display_name, 
    phone, 
    city, 
    country,
    avatar_url,
    verification_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Default to 'patient' if role is not provided or if it's admin (protection)
    COALESCE(
      CASE 
        WHEN (NEW.raw_user_meta_data->>'role') IN ('patient', 'doctor', 'hospital') 
        THEN (NEW.raw_user_meta_data->>'role')::user_role
        ELSE 'patient'::user_role
      END, 
      'patient'::user_role
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'avatar_url',
    -- Default to pending for doctors/hospitals, verified for patients?
    -- The requirement says doctor/hospital must be pending.
    -- Patient can be pending until email verification, or if we don't care, just pending.
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
