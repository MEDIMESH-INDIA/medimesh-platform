BEGIN;
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '12fefe35-030b-43ce-9cad-6041a54a7f2c', 'dr-adesh-palyekar-2940', 'Dr. Adesh Palyekar', 'Oncologist / Cancer Surgeon', 'Kudal', 'Kudal', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '6d4f3cf0-389a-4477-b118-ed8824f3103e', '12fefe35-030b-43ce-9cad-6041a54a7f2c', 'Konkan Cancer and Multispeciality Hospital', 'Oncologist / Cancer Surgeon', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '673440b4-f9e8-41e1-82ea-7d6cb8803074', 'dr-gayatri-palyekar-76b9', 'Dr. Gayatri Palyekar', 'Obstetrician and Gynaecologist', 'Kudal', 'Kudal', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '3bf5577a-b1e5-48f2-99d5-b0df9855dd86', '673440b4-f9e8-41e1-82ea-7d6cb8803074', 'Konkan Cancer and Multispeciality Hospital', 'Obstetrician and Gynaecologist', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'a8db4c5e-4f96-4fa0-8e7e-223f30260bbb', 'dr-pramod-duthade-cbbb', 'Dr. Pramod Duthade', 'HOD, General Medicine', 'Padve', 'Padve', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'be2c4859-0f27-4443-b88a-4c216116f877', 'a8db4c5e-4f96-4fa0-8e7e-223f30260bbb', 'SSPM Medical College and Lifetime Hospital', 'HOD, General Medicine', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '8c7ae231-f43a-448a-9c51-d895e86ad546', 'dr-r-ravishanker-ab79', 'Dr. R. Ravishanker', 'HOD, General Surgery', 'Padve', 'Padve', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'c1be7907-18ba-42e6-8e92-3b7085a65013', '8c7ae231-f43a-448a-9c51-d895e86ad546', 'SSPM Medical College and Lifetime Hospital', 'HOD, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '857648dd-7984-40d7-9324-41c557c8d0a3', 'dr-sanjay-patil-93f2', 'Dr. Sanjay Patil', 'HOD, OBGY', 'Padve', 'Padve', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '7114b8ff-8a04-422b-b6a8-01095057b398', '857648dd-7984-40d7-9324-41c557c8d0a3', 'SSPM Medical College and Lifetime Hospital', 'HOD, OBGY', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '16119652-54c8-4249-ad14-d34d06be18d6', 'dr-anant-dawange-d29c', 'Dr. Anant Dawange', 'Professor, General Surgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'ae528a4f-5d69-4394-8410-479c3f470ee3', '16119652-54c8-4249-ad14-d34d06be18d6', 'Government Medical College', 'Professor, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '3829ba07-3aaf-4295-ba84-207ec0ed1c8f', 'dr-appasaheb-ingle-4768', 'Dr. Appasaheb Ingle', 'Associate Professor, General Surgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '369d04d5-4d8e-492e-983e-62140d6e411b', '3829ba07-3aaf-4295-ba84-207ec0ed1c8f', 'Government Medical College', 'Associate Professor, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '8b6a934a-cd11-428d-8f1a-e3db4b600ed4', 'dr-sagar-kolhe-4b32', 'Dr. Sagar Kolhe', 'Assistant Professor, Urosurgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'dc455b26-82cf-4a6e-b993-61258262baf8', '8b6a934a-cd11-428d-8f1a-e3db4b600ed4', 'Government Medical College', 'Assistant Professor, Urosurgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'd2ec6aad-96d9-4924-9279-ce36bc9ddc87', 'dr-nikhil-pravin-jadhav-e17c', 'Dr. Nikhil Pravin Jadhav', 'Assistant Professor, General Surgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'b0d398fc-9704-42d6-8877-56d613576a28', 'd2ec6aad-96d9-4924-9279-ce36bc9ddc87', 'Government Medical College', 'Assistant Professor, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '01cc47ae-df9a-4ed4-ba20-6604ccc4c74a', 'dr-pind-vishal-raosaheb-0ecc', 'Dr. Pind Vishal Raosaheb', 'Assistant Professor, General Surgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '4814ae86-976d-43f2-862d-4f4a99068aac', '01cc47ae-df9a-4ed4-ba20-6604ccc4c74a', 'Government Medical College', 'Assistant Professor, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'c557c0ae-49ef-43b4-a8e4-1768fc6657cd', 'dr-vajaratkar-aniket-pandurang-858d', 'Dr. Vajaratkar Aniket Pandurang', 'Assistant Professor, General Surgery', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'eaf03651-1bc2-4027-a7a7-c21e088c6727', 'c557c0ae-49ef-43b4-a8e4-1768fc6657cd', 'Government Medical College', 'Assistant Professor, General Surgery', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '5ecb7b37-06f6-4d7c-b973-4d5aac74eebd', 'dr-sanjay-saini-2bf5', 'Dr. Sanjay Saini', 'Orthopedics', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '9db6263a-5209-4200-9846-026e12ddfef1', '5ecb7b37-06f6-4d7c-b973-4d5aac74eebd', 'Government Medical College', 'Orthopedics', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'a712bb8a-76fa-4010-994c-e4b9d37b1e9e', 'dr-vijay-waghamare-cda1', 'Dr. Vijay Waghamare', 'Orthopedics', 'Sindhudurg', 'Sindhudurg', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '26abdc92-5af0-41a6-8e90-204f24bb4171', 'a712bb8a-76fa-4010-994c-e4b9d37b1e9e', 'Government Medical College', 'Orthopedics', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'd42da178-354f-44e2-be71-ea1efdb06080', 'dr-ajit-limaye-0bb0', 'Dr. Ajit Limaye', 'General Surgeon', 'Malvan', 'Malvan', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'dfd2e481-232f-4f2a-80d7-3d215f06d870', 'd42da178-354f-44e2-be71-ea1efdb06080', 'Limaye Hospital', 'General Surgeon', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'f7adbe40-a6d9-4fa2-a22e-003143284248', 'dr-leena-limaye-37fe', 'Dr. Leena Limaye', 'Anesthesiologist', 'Malvan', 'Malvan', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '809f11a1-beae-4323-8636-0f674c0542a6', 'f7adbe40-a6d9-4fa2-a22e-003143284248', 'Limaye Hospital', 'Anesthesiologist', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '8f3a90cb-d6e4-416c-9aaa-d8f128698e75', 'dr-jaisinh-raorane-96a7', 'Dr. Jaisinh Raorane', 'Pediatrician', 'Kudal', 'Kudal', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '0027a26b-67a8-49fe-b4c3-ea1c7ae616ef', '8f3a90cb-d6e4-416c-9aaa-d8f128698e75', 'Amarvija Child Care Hospital', 'Pediatrician', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'd663747f-9f00-48b4-97e6-6f8cdd717ada', 'dr-yogesh-bhide-5348', 'Dr. Yogesh Bhide', 'Dentist', 'Devgad', 'Devgad', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '05352677-5a99-4fac-ad3a-640e45f993ef', 'd663747f-9f00-48b4-97e6-6f8cdd717ada', 'The Dental Clinic', 'Dentist', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'bd62d423-3c02-463e-a8ff-1a0960084bb6', 'dr-deepak-deelip-patil-2810', 'Dr. Deepak Deelip Patil', 'Dentist', 'Vaibhavwadi', 'Vaibhavwadi', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'f78e5b72-fd53-4cd5-b03d-964345142150', 'bd62d423-3c02-463e-a8ff-1a0960084bb6', 'Mankeshwar Dental clinic', 'Dentist', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'e112e7ac-f12b-4e4d-943d-14db4ea0d40c', 'dr-rushali-dnyaneshwar-angchekar-d4b2', 'Dr. Rushali Dnyaneshwar Angchekar', 'Homoeopath', 'Vengurla', 'Vengurla', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'fb28296d-cd13-4edf-bb88-4073e42eec56', 'e112e7ac-f12b-4e4d-943d-14db4ea0d40c', 'Vaibhavi Homeo Clinic', 'Homoeopath', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '8a5d9d56-1254-46b0-88a7-808addab4dcb', 'dr-amey-anant-patkar-5a01', 'Dr. Amey Anant Patkar', 'Ayurveda', 'Kudal', 'Kudal', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'bbb6c3ad-7a3d-418f-9653-b780f64a7cfc', '8a5d9d56-1254-46b0-88a7-808addab4dcb', 'Madhavbaug Clinic', 'Ayurveda', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '1918a4ac-980a-4b28-a9a0-710a98eee607', 'dr-mukul-prabhudesai-0959', 'Dr. Mukul Prabhudesai', 'Ayurveda', 'Devgad', 'Devgad', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        'be01c7fa-5b2e-4cd3-afa7-2bb23203f5bc', '1918a4ac-980a-4b28-a9a0-710a98eee607', 'Dhanvantari Clinic & Panchakarma Centre', 'Ayurveda', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      '784737d7-8292-49c6-9427-edae11954367', 'dr-vinayak-trimbak-lele-b529', 'Dr. Vinayak Trimbak Lele', 'Ayurvedic Gynecologist', 'Sawantwadi', 'Sawantwadi', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '4f381e55-e7d7-4f9a-bf73-83bee5a1ad1e', '784737d7-8292-49c6-9427-edae11954367', 'Shri Clinic Maternity Hospital', 'Ayurvedic Gynecologist', 'Consultant', true
      );
INSERT INTO public.doctors (id, slug, full_name, specialization, locality, city, state, medical_registration_number, medical_council, registration_year, verification_status, publication_status, source_dataset) VALUES (
      'fad02021-9258-4852-a6d9-21a849d6f415', 'dr-snehal-yashwant-sarwate-e9f1', 'Dr. Snehal Yashwant Sarwate', 'Ayurveda', 'Kudal', 'Kudal', 'Maharashtra', 'Pending Manual NMC/MMC Verification', 'Maharashtra Medical Council', 'Pending', 'pending', 'published', 'Sindhudurg Doctors IMR Mapped'
    ) ON CONFLICT DO NOTHING;
INSERT INTO public.doctor_affiliations_directory (id, doctor_id, hospital_name, department, position, is_current) VALUES (
        '1d81cf79-a963-42c4-92dc-ab4cc5d2d5ea', 'fad02021-9258-4852-a6d9-21a849d6f415', 'Shatakshi Ayurved Chikitsalaya', 'Ayurveda', 'Consultant', true
      );
COMMIT;
