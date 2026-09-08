BEGIN;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '8e9e520d-a56c-4b46-9380-9053bb295098', 'district-civil-hospital-sindhudurg', 'District Civil Hospital Sindhudurg', 'Oros / Sindhudurgnagari', 'Oros', 'Sindhudurg', 'Maharashtra', 'District Hospital', 200, '02362-228900', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '4167f470-79fc-4e36-a7c6-6d539d51170f', 'sub-district-hospital-sawantwadi', 'Sub District Hospital Sawantwadi', 'Sawantwadi', 'Sawantwadi', 'Sindhudurg', 'Maharashtra', 'Sub District Hospital', 100, '02363-272062', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '6046f1fa-a2b1-4c39-9668-84551bffe559', 'sub-district-hospital-kankavali', 'Sub District Hospital Kankavali', 'Kankavali', 'Kankavali', 'Sindhudurg', 'Maharashtra', 'Sub District Hospital', 100, '02367-232058', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      'c069b1c4-5a20-41fd-8937-4c5d712ee385', 'sub-district-hospital-shiroda', 'Sub District Hospital Shiroda', 'Shiroda', 'Shiroda', 'Sindhudurg', 'Maharashtra', 'Sub District Hospital', 50, '02366-227202', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '2d02c02b-c0d8-4848-afc6-4d181e3cf774', 'sub-district-hospital-vengurla', 'Sub District Hospital Vengurla', 'Vengurla', 'Vengurla', 'Sindhudurg', 'Maharashtra', 'Sub District Hospital', 50, '02366-262235', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      'be99d81f-20a6-4542-ab49-6dba72da97f3', 'rural-hospital-dodamarg', 'Rural Hospital Dodamarg', 'Dodamarg', 'Dodamarg', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02363-256617', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '775bb355-3143-4e81-99c1-909be62f86df', 'rural-hospital-kudal', 'Rural Hospital Kudal', 'Kudal', 'Kudal', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02362-222483', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      'da767d42-fab1-401b-8c38-8c0c2530d31c', 'rural-hospital-devgad', 'Rural Hospital Devgad', 'Devgad', 'Devgad', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02364-262253', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '25885d2f-ddfc-4542-99f3-0c35997315ec', 'rural-hospital-malwan', 'Rural Hospital Malwan', 'Malwan', 'Malwan', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02365-252032', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '1bcdf2cc-b0dc-441b-b4f5-eb0aa078039d', 'rural-hospital-katta', 'Rural Hospital Katta', 'Katta', 'Katta', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02365-225862', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '62715eab-e728-4c5c-bc91-d0762ae85401', 'rural-hospital-vaibhavwadi', 'Rural Hospital Vaibhavwadi', 'Vaibhavwadi', 'Vaibhavwadi', 'Sindhudurg', 'Maharashtra', 'Rural Hospital', 30, '02367-237581', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '67588b5f-bdac-4fc8-b980-abcd32ad68e1', 'dist-women-s-child-hospital', 'Dist. Women''s & Child Hospital', 'Kudal', 'Kudal', 'Sindhudurg', 'Maharashtra', 'District Hospital', 100, NULL, 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      'e61cddf7-5a5e-4c16-9729-53ffb928205c', 'suyash-hospital', 'Suyash Hospital', 'Kudal', 'Kudal', 'Sindhudurg', 'Maharashtra', 'Multispeciality', NULL, '02362-223452', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      'f714bc6f-1bf8-4fec-bc93-4de64e6f772b', 'siddhivinayak-hospital-and-icu', 'Siddhivinayak Hospital And ICU', 'Kankavali', 'Kankavali', 'Sindhudurg', 'Maharashtra', 'Multispeciality', NULL, '02367-231643', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.hospitals (id, slug, name, locality, city, district, state, hospital_type, total_beds, public_phone, publication_status, data_status) VALUES (
      '64f026f9-1b1e-455c-853f-6be7d44db8c4', 'sspm-medical-college-and-lifetime-hospital', 'SSPM Medical College and Lifetime Hospital', 'Padve', 'Padve', 'Sindhudurg', 'Maharashtra', 'Medical College Hospital', 410, '+91-7887650055', 'published', 'verified'
    ) ON CONFLICT (slug) DO NOTHING;
COMMIT;
