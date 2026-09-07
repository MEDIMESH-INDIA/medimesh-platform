DO $$
DECLARE
  demo_id UUID;
BEGIN
  -- Grab the first doctor profile to use as the demo linked user
  SELECT doctor_id INTO demo_id FROM public.doctor_profiles LIMIT 1;
  
  IF demo_id IS NOT NULL THEN
    INSERT INTO public.doctors (
      slug, full_name, specialization, experience_years, 
      medical_registration_number, locality, city, state, 
      verification_status, publication_status, claimed_by_user_id, 
      offers_home_visits, source_dataset
    )
    VALUES (
      'dr-demo-patel', 'Dr. Demonstration Patel', 'General Physician', 15,
      'DEMO-12345', 'Vashi', 'Navi Mumbai', 'Maharashtra',
      'verified', 'published', demo_id,
      false, 'Demonstration System'
    ) ON CONFLICT (slug) DO UPDATE SET claimed_by_user_id = EXCLUDED.claimed_by_user_id;
  END IF;
END $$;
