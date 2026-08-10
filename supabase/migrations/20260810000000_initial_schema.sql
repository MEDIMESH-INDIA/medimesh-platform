-- Create custom role type
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'hospital', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  country TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies

-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Public profiles (Optional: allow reading basic info of doctors/hospitals)
CREATE POLICY "Public can view verified doctors and hospitals"
  ON public.profiles
  FOR SELECT
  USING (role IN ('doctor', 'hospital') AND verification_status = 'verified');

-- Function to handle user updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
