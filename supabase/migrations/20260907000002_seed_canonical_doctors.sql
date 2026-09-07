
-- IDEMPOTENT UPSERT DIRECTORY
WITH data (slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality, _affiliation) AS (
  VALUES
  ('dr-abhidha-shah', 'Dr. Abhidha Shah', 'Neurosurgeon', 18, 'Navi Mumbai', 'Maharashtra', '89508', '1999', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Apollo Hospitals'),
  ('dr-girish-nair', 'Dr. Girish Nair', 'Neurologist', 29, 'Navi Mumbai', 'Maharashtra', '2000042145', '2000', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Apollo Hospitals'),
  ('dr-nitin-dange', 'Dr. Nitin Dange', 'Neurosurgeon', 22, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Apollo Hospitals'),
  ('dr-rahul-gupta', 'Dr. Rahul Gupta', 'Cardiologist', 25, 'Navi Mumbai', 'Maharashtra', '2001031748', '2001', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Apollo Hospitals'),
  ('dr-sanjeevkumar-r-kalkekar', 'Dr. Sanjeevkumar R. Kalkekar', 'Cardiologist', 26, 'Navi Mumbai', 'Maharashtra', '2000021342', '2000', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Apollo Hospitals'),
  ('dr-anjali-kumar', 'Dr. Anjali Kumar', 'Gynecologist', 18, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Cloudnine Hospital'),
  ('dr-kishore-kumar', 'Dr. Kishore Kumar', 'Neonatologist', 25, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Cloudnine Hospital'),
  ('dr-meera-k', 'Dr. Meera K.', 'Obstetrician', 15, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Cloudnine Hospital'),
  ('dr-ritu-hinduja', 'Dr. Ritu Hinduja', 'Fertility Specialist', 14, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Cloudnine Hospital'),
  ('dr-swati-sinha', 'Dr. Swati Sinha', 'Pediatrician', 12, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Cloudnine Hospital'),
  ('dr-donald-john-babu', 'Dr. Donald John Babu', 'Surgical Oncologist', 21, 'Navi Mumbai', 'Maharashtra', '2007040712', '2007', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'MGM Hospital Vashi'),
  ('dr-kapil-mohan', 'Dr. Kapil Mohan', 'Spine Surgeon (Ortho)', 23, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'MGM Hospital Vashi'),
  ('dr-nandini-gupta', 'Dr. Nandini Gupta', 'Dermatologist', 19, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'MGM Hospital Vashi'),
  ('dr-shilpa-deshmukh-kadam', 'Dr. Shilpa Deshmukh Kadam', 'Cardiologist', 25, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'MGM Hospital Vashi'),
  ('dr-vinita-goyle', 'Dr. Vinita Goyle', 'ENT', 37, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'MGM Hospital Vashi'),
  ('dr-bipin-jiwnani', 'Dr. Bipin Jiwnani', 'Orthopedic Surgeon', 20, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Reliance Hospital (Kokilaben Ambani)'),
  ('dr-deepak-aiwale', 'Dr. Deepak Aiwale', 'Neurologist', 23, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Reliance Hospital (Kokilaben Ambani)'),
  ('dr-deepak-p-kumar', 'Dr. Deepak P. Kumar', 'Radiation Oncologist', 16, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Reliance Hospital (Kokilaben Ambani)'),
  ('dr-hitendra-patil', 'Dr. Hitendra Patil', 'Surgical Oncologist', 24, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Reliance Hospital (Kokilaben Ambani)'),
  ('dr-niraj-kumar', 'Dr. Niraj Kumar', 'Cardiologist', 11, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Reliance Hospital (Kokilaben Ambani)'),
  ('dr-c-s-pramesh', 'Dr. C.S. Pramesh', 'Thoracic Surgeon', 25, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'TATA Memorial Centre - ACTREC'),
  ('dr-pankaj-chaturvedi', 'Dr. Pankaj Chaturvedi', 'Head & Neck Surgeon', 25, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'TATA Memorial Centre - ACTREC'),
  ('dr-rajiv-sarin', 'Dr. Rajiv Sarin', 'Radiation Oncologist', 30, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'TATA Memorial Centre - ACTREC'),
  ('dr-shailesh-shrikhande', 'Dr. Shailesh Shrikhande', 'Gastrointestinal Oncologist', 26, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'TATA Memorial Centre - ACTREC'),
  ('dr-sudeep-gupta', 'Dr. Sudeep Gupta', 'Medical Oncologist', 28, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'TATA Memorial Centre - ACTREC'),
  ('dr-anup-ramani', 'Dr. Anup Ramani', 'Uro-Oncologist', 26, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Wockhardt (Sterling) Hospitals'),
  ('dr-kedar-toraskar', 'Dr. Kedar Toraskar', 'Critical Care', 25, 'Navi Mumbai', 'Maharashtra', '74255', '1994', 'Maharashtra Medical Council', 'published', 'verified', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Wockhardt (Sterling) Hospitals'),
  ('dr-prashant-makhija', 'Dr. Prashant Makhija', 'Neurologist', 18, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Wockhardt (Sterling) Hospitals'),
  ('dr-rajendra-patankar', 'Dr. Rajendra Patankar', 'General Medicine', 25, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Wockhardt (Sterling) Hospitals'),
  ('dr-sameer-kulkarni', 'Dr. Sameer Kulkarni', 'Orthopedics', 20, 'Navi Mumbai', 'Maharashtra', NULL, NULL, 'Maharashtra Medical Council', 'published', 'pending', false, NULL, 'MEDIMESH Doctors IMR Mapped Dataset', NULL, 'Wockhardt (Sterling) Hospitals'),
  ('dr-shwet-v-sabnis', 'Dr. Shwet V. Sabnis', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Seawoods'], 'Navi Mumbai Home Visit Doctors Dataset', 'Seawoods', NULL),
  ('dr-ritu-khemani', 'Dr. Ritu Khemani', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Kopar Khairane'], 'Navi Mumbai Home Visit Doctors Dataset', 'Kopar Khairane', NULL),
  ('dr-pankaj-sawant', 'Dr. Pankaj Sawant', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai (Multiple Sectors)'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai (Multiple Sectors)', NULL),
  ('dr-omkar-kiwlekar', 'Dr. Omkar Kiwlekar', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Nerul'], 'Navi Mumbai Home Visit Doctors Dataset', 'Nerul', NULL),
  ('dr-pooja-bharadwaj', 'Dr. Pooja Bharadwaj', 'Gynaecologist / General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Nerul'], 'Navi Mumbai Home Visit Doctors Dataset', 'Nerul', NULL),
  ('dr-ujwal-ramteke', 'Dr. Ujwal Ramteke', 'Orthopedic Surgeon', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Nerul'], 'Navi Mumbai Home Visit Doctors Dataset', 'Nerul', NULL),
  ('dr-nitin-laxmikant-meher', 'Dr. Nitin Laxmikant Meher', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Kharghar'], 'Navi Mumbai Home Visit Doctors Dataset', 'Kharghar', 'Neel Clinic'),
  ('dr-devvrat-s-parekh', 'Dr. Devvrat S. Parekh', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Vashi'], 'Navi Mumbai Home Visit Doctors Dataset', 'Vashi', NULL),
  ('dr-maulik-n-mehta', 'Dr. Maulik N. Mehta', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Vashi'], 'Navi Mumbai Home Visit Doctors Dataset', 'Vashi', 'Aagam Health Clinic'),
  ('dr-sandeep-guthe', 'Dr. Sandeep Guthe', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Vashi'], 'Navi Mumbai Home Visit Doctors Dataset', 'Vashi', 'Laxmi Multispeciality'),
  ('dr-vignan-rachabattuni', 'Dr. Vignan Rachabattuni', 'General Practitioner', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('vaidya-kanchan', 'Vaidya Kanchan', 'Certified Naadi Vaidya (BAMS)', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-soopti-khare', 'Dr. Soopti Khare', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-virendar-sarwal', 'Dr. Virendar Sarwal', 'General Surgery / Proctologist', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-chakravarthy-mazumdar-j-k', 'Dr. Chakravarthy Mazumdar J K', 'Cardiothoracic & Vascular Surgeon', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-yagnang-kaushikkumar-vyas', 'Dr. Yagnang Kaushikkumar Vyas', 'Pulmonary Medicine', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-major-urvashi-shetty', 'Dr. (Major) Urvashi Shetty', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-emad-mohammed', 'Dr. Emad Mohammed', 'Clinical Pharmacologist', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Navi Mumbai'], 'Navi Mumbai Home Visit Doctors Dataset', 'Navi Mumbai', NULL),
  ('dr-neha-suryawanshi', 'Dr. Neha Suryawanshi', 'Dietetics / Nutritionist', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Nerul'], 'Navi Mumbai Home Visit Doctors Dataset', 'Nerul', NULL),
  ('dr-c-s-shobha', 'Dr. C.S. Shobha', 'General Physician', NULL, 'Navi Mumbai', 'Maharashtra', NULL, NULL, NULL, 'published', 'pending', true, ARRAY['Nerul'], 'Navi Mumbai Home Visit Doctors Dataset', 'Nerul', NULL)
)
, upsert_doctors AS (
  INSERT INTO public.doctors (
    slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality
  )
  SELECT slug, full_name, specialization, experience_years, city, state, medical_registration_number, registration_year, medical_council, publication_status, verification_status, offers_home_visits, home_visit_service_areas, source_dataset, locality
  FROM data
  ON CONFLICT (slug) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    specialization = EXCLUDED.specialization,
    experience_years = COALESCE(public.doctors.experience_years, EXCLUDED.experience_years),
    offers_home_visits = EXCLUDED.offers_home_visits,
    home_visit_service_areas = EXCLUDED.home_visit_service_areas,
    verification_status = EXCLUDED.verification_status
  RETURNING id, slug
)
INSERT INTO public.doctor_affiliations_directory (doctor_id, hospital_name, department, source_dataset)
SELECT u.id, d._affiliation, d.specialization, d.source_dataset
FROM upsert_doctors u
JOIN data d ON d.slug = u.slug
WHERE d._affiliation IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.doctor_affiliations_directory dad 
    WHERE dad.doctor_id = u.id AND dad.hospital_name = d._affiliation
  );

-- Link to existing canonical hospitals based on name matching
UPDATE public.doctor_affiliations_directory
SET hospital_id = h.id
FROM public.hospitals h
WHERE doctor_affiliations_directory.hospital_id IS NULL
  AND doctor_affiliations_directory.hospital_name IS NOT NULL
  AND (
    LOWER(doctor_affiliations_directory.hospital_name) LIKE '%' || LOWER(h.name) || '%'
    OR LOWER(h.name) LIKE '%' || LOWER(doctor_affiliations_directory.hospital_name) || '%'
  );
