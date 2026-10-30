select 'hospitals' as table_name, count(*) from public.hospitals
union all
select 'doctors', count(*) from public.doctors
union all
select 'home visit doctors', count(*) from public.doctors where offers_home_visits = true
union all
select 'claimed canonical doctors', count(*) from public.doctors where claimed_by_user_id is not null
union all
select 'doctor affiliations', count(*) from public.doctor_affiliations
union all
select 'hospital organizations', count(*) from public.hospital_organizations
union all
select 'hospital memberships', count(*) from public.hospital_memberships
union all
select 'specialties', count(*) from public.specialties
union all
select 'facilities', count(*) from public.facilities
union all
select 'services', count(*) from public.services;
