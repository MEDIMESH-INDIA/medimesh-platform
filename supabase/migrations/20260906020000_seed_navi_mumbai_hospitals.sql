-- Seed Navi Mumbai Canonical Hospitals

-- Data Sources
INSERT INTO public.data_sources (id, source_type, name, base_url)
SELECT '3c08e435-8fe1-47a6-9538-7b7a65e9697e', 'government_open_data', 'Navi Mumbai Municipal Corporation - List of Hospitals', 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals'
WHERE NOT EXISTS (SELECT 1 FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals');
INSERT INTO public.data_sources (id, source_type, name, base_url)
SELECT '2bf7f3e0-c778-44d7-baf0-8acd5572ca16', 'government_open_data', 'NMMC + Maharashtra Police Hospital List 2024', 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf'
WHERE NOT EXISTS (SELECT 1 FROM public.data_sources WHERE name = 'NMMC + Maharashtra Police Hospital List 2024');
INSERT INTO public.data_sources (id, source_type, name, base_url)
SELECT 'acc7c3fb-456b-4af5-ba4b-5d0ed7dc2bfb', 'government_open_data', 'Maharashtra Police Panel Hospital List 2024', 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf'
WHERE NOT EXISTS (SELECT 1 FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024');
INSERT INTO public.data_sources (id, source_type, name, base_url)
SELECT '3a9d2f00-55df-42bd-9649-936ff6952b87', 'government_open_data', 'Maharashtra Police Panel Hospital List 2024 + Panvel Municipal Corporation', 'https://panvelcorporation.maharashtra.gov.in/medical_tourism'
WHERE NOT EXISTS (SELECT 1 FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024 + Panvel Municipal Corporation');
INSERT INTO public.data_sources (id, source_type, name, base_url)
SELECT '9e0437b8-0cac-4046-a1f5-b2fc2124d9aa', 'government_open_data', 'Panvel Municipal Corporation - Medical Tourism Hospitals', 'https://panvelcorporation.maharashtra.gov.in/medical_tourism'
WHERE NOT EXISTS (SELECT 1 FROM public.data_sources WHERE name = 'Panvel Municipal Corporation - Medical Tourism Hospitals');

-- Hospitals and Evidence
DO $seed$
DECLARE
  v_hospital_id uuid;
  v_source_id uuid;
BEGIN

  -- Upsert Hospital: mgm-hospital-belapur
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mgm-hospital-belapur', 'MGM Hospital Belapur', 'CBD Belapur', 'Navi Mumbai', 'Maharashtra', 'India', NULL, NULL, '022-27570219',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mgm-hospital-vashi
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mgm-hospital-vashi', 'MGM Hospital Vashi', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Plot No. 35, Sector 3, Vashi, Navi Mumbai', '022-27822203',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'NMMC + Maharashtra Police Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: sterling-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'sterling-hospital', 'Sterling Hospital', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', NULL, NULL, '022-27826969',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: jijamata-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'jijamata-hospital', 'Jijamata Hospital', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', NULL, NULL, '022-27664387 / 022-27668509',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: dr-mahajans-hospital-industrial-trauma-care
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'dr-mahajans-hospital-industrial-trauma-care', 'Dr. Mahajan''s Hospital & Industrial Trauma Care', 'Rabale', 'Navi Mumbai', 'Maharashtra', 'India', 'trauma_care', 'R-831, TTC, Thane-Belapur Road, Rabale, Navi Mumbai', '022-27691981 / 022-27691679',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'NMMC + Maharashtra Police Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: shri-sadguru-seva-mandal-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'shri-sadguru-seva-mandal-hospital', 'Shri Sadguru Seva Mandal Hospital', 'Thane-Belapur Road', 'Navi Mumbai', 'Maharashtra', 'India', NULL, NULL, '022-27692212',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mgm-hospital-kamothe
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mgm-hospital-kamothe', 'MGM Hospital Kamothe', 'Kamothe', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Sector 1, Kamothe, Navi Mumbai', '022-27423404',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'NMMC + Maharashtra Police Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: nmmc-general-hospital-vashi
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'nmmc-general-hospital-vashi', 'NMMC General Hospital Vashi', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', 'general_hospital', NULL, '022-27899901 to 05',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: nmmc-general-hospital-nerul
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'nmmc-general-hospital-nerul', 'NMMC General Hospital Nerul', 'Nerul', 'Navi Mumbai', 'Maharashtra', 'India', 'general_hospital', NULL, '022-27700376 / 1808',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: nmmc-general-hospital-airoli
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'nmmc-general-hospital-airoli', 'NMMC General Hospital Airoli', 'Airoli', 'Navi Mumbai', 'Maharashtra', 'India', 'general_hospital', NULL, '022-27690561',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: esis-hospital-vashi
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'esis-hospital-vashi', 'ESIS Hospital Vashi', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', NULL, NULL, '022-27822268',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mch-turbhe
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mch-turbhe', 'MCH Turbhe', 'Turbhe', 'Navi Mumbai', 'Maharashtra', 'India', 'mother_child_health_center', NULL, '022-27631827 / 4294',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mch-koparkhairane
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mch-koparkhairane', 'MCH Koparkhairane', 'Koparkhairane', 'Navi Mumbai', 'Maharashtra', 'India', 'mother_child_health_center', NULL, '022-27573577 / 4655',
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Navi Mumbai Municipal Corporation - List of Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://online.nmmc.gov.in/navimumbai/list-of-hospitals', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: shushrusha-heart-care-centre-speciality-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'shushrusha-heart-care-centre-speciality-hospital', 'Shushrusha Heart Care Centre & Speciality Hospital', 'Nerul', 'Navi Mumbai', 'Maharashtra', 'India', 'speciality_hospital', 'Plot No. 22-A, Sector 6, Phase III, Palm Beach Road, Nerul, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mangal-prabhu-nursing-home-polyclinic-diagnostic-center
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mangal-prabhu-nursing-home-polyclinic-diagnostic-center', 'Mangal Prabhu Nursing Home Polyclinic & Diagnostic Center', 'Juinagar', 'Navi Mumbai', 'Maharashtra', 'India', 'nursing_home', 'Plot No. 27, Sector 24, Juinagar, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: life-line-hospital-medical-research-centre
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'life-line-hospital-medical-research-centre', 'Life Line Hospital & Medical Research Centre', 'Panvel', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Sai Arcade, Opp. S.T. Bus Stand, Shivaji Road, Panvel', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: dr-r-n-patils-suraj-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'dr-r-n-patils-suraj-hospital', 'Dr. R.N. Patil''s Suraj Hospital', 'Sanpada', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Plot No. 1 & 1A, Sun Palm View Building, Opp. Palm Beach Marg, Sector 15, Sanpada, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: terna-speciality-hospital-research-centre
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'terna-speciality-hospital-research-centre', 'Terna Speciality Hospital & Research Centre', 'Nerul', 'Navi Mumbai', 'Maharashtra', 'India', 'speciality_hospital', 'Plot No. 12, Sector 22, Opp. Nerul Railway Station, Nerul (W), Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: ashtvinayak-hospitals-private-limited
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'ashtvinayak-hospitals-private-limited', 'Ashtvinayak Hospitals Private Limited', 'New Panvel', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Plot No. 10, Sector 6, Khanda Colony, near Khandeshwar Lake, New Panvel (W)', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mpct-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mpct-hospital', 'MPCT Hospital', 'Sanpada', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Plot No. 7, Sector 4, Sanpada, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: fortis-hiranandani-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'fortis-hiranandani-hospital', 'Fortis Hiranandani Hospital', 'Vashi', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Plot No. 28, Sector 10A, Mini Seashore Road, Vashi, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: d-y-patil-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'd-y-patil-hospital', 'D.Y. Patil Hospital', 'Nerul', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Sector 5, Nerul (E), Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: medicover-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'medicover-hospital', 'Medicover Hospital', 'Kharghar', 'Navi Mumbai', 'Maharashtra', 'India', 'multispeciality', 'Sector 10, Kharghar, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024 + Panvel Municipal Corporation' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://panvelcorporation.maharashtra.gov.in/medical_tourism', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: millennium-multispeciality-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'millennium-multispeciality-hospital', 'Millennium Multispeciality Hospital', 'Ulwe', 'Navi Mumbai', 'Maharashtra', 'India', 'multispeciality', 'Sector 19, Ulwe, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: polaris-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'polaris-hospital', 'Polaris Hospital', 'Kharghar', 'Navi Mumbai', 'Maharashtra', 'India', NULL, 'Sector 20, Kharghar, Navi Mumbai', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Maharashtra Police Panel Hospital List 2024' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://www.mahapolice.gov.in/uploads/244-hospital-list.pdf', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
  -- Upsert Hospital: mitr-hospital
  INSERT INTO public.hospitals (
    slug, name, locality, city, state, country, hospital_type, address_line_1, public_phone,
    total_beds, icu_beds, emergency_department, ambulance_available, publication_status
  ) VALUES (
    'mitr-hospital', 'MITR Hospital', 'Kharghar', 'Navi Mumbai', 'Maharashtra', 'India', 'multispeciality', 'Plot 37, Eden Garden CHS, Sector 5, Kharghar, Navi Mumbai 410210', NULL,
    NULL, NULL, NULL, NULL, 'published'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    locality = EXCLUDED.locality,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    country = EXCLUDED.country,
    hospital_type = COALESCE(public.hospitals.hospital_type, EXCLUDED.hospital_type),
    address_line_1 = COALESCE(public.hospitals.address_line_1, EXCLUDED.address_line_1),
    public_phone = COALESCE(public.hospitals.public_phone, EXCLUDED.public_phone),
    total_beds = COALESCE(public.hospitals.total_beds, EXCLUDED.total_beds),
    icu_beds = COALESCE(public.hospitals.icu_beds, EXCLUDED.icu_beds),
    emergency_department = COALESCE(public.hospitals.emergency_department, EXCLUDED.emergency_department),
    ambulance_available = COALESCE(public.hospitals.ambulance_available, EXCLUDED.ambulance_available),
    publication_status = EXCLUDED.publication_status
  RETURNING id INTO v_hospital_id;
  
  -- Resolve Data Source
  SELECT id INTO v_source_id FROM public.data_sources WHERE name = 'Panvel Municipal Corporation - Medical Tourism Hospitals' LIMIT 1;
  
  -- Upsert Evidence
  IF v_source_id IS NOT NULL THEN
    -- If evidence from this source for this hospital doesn't exist, insert it
    IF NOT EXISTS (SELECT 1 FROM public.hospital_evidence WHERE hospital_id = v_hospital_id AND source_id = v_source_id) THEN
      INSERT INTO public.hospital_evidence (
        hospital_id, source_id, source_url, review_status, checked_at, public_notes
      ) VALUES (
        v_hospital_id, v_source_id, 'https://panvelcorporation.maharashtra.gov.in/medical_tourism', 'source_matched', '2026-09-06', 'Official-source seed record; operational status and unsupported clinical/facility fields are not independently verified.'
      );
    END IF;
  END IF;
  
END $seed$;
