-- Phase 5: source-backed hospital location identifiers and scheduled home visits.
-- This migration is intentionally additive. It does not infer hospital locations or
-- make unclaimed directory doctors bookable.

alter table public.hospitals
  add column if not exists google_place_id text;

comment on column public.hospitals.google_place_id is
  'Google Places identifier retained only after a source-backed match. Null means unresolved.';

create table if not exists public.home_visit_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique
    default ('HV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  patient_id uuid not null references auth.users(id) on delete restrict,
  doctor_id uuid not null references public.doctors(id) on delete restrict,
  patient_display_name text not null,
  scheduled_date date not null,
  scheduled_start_time time not null,
  scheduled_end_time time not null,
  address_line_1 text not null,
  address_line_2 text,
  locality text not null,
  city text not null default 'Navi Mumbai',
  postal_code text,
  landmark text,
  patient_note text,
  status text not null default 'pending',
  accepted_at timestamptz,
  declined_at timestamptz,
  cancelled_at timestamptz,
  decline_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_visit_booking_status_check
    check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  constraint home_visit_booking_address_check
    check (char_length(btrim(address_line_1)) between 3 and 240),
  constraint home_visit_booking_locality_check
    check (char_length(btrim(locality)) between 2 and 120),
  constraint home_visit_booking_city_check
    check (char_length(btrim(city)) between 2 and 120),
  constraint home_visit_booking_postal_code_check
    check (postal_code is null or postal_code ~ '^[0-9]{6}$'),
  constraint home_visit_booking_note_check
    check (patient_note is null or char_length(patient_note) <= 1000),
  constraint home_visit_booking_decline_reason_check
    check (decline_reason is null or char_length(decline_reason) <= 500),
  constraint home_visit_booking_time_order_check
    check (scheduled_end_time > scheduled_start_time)
);

comment on table public.home_visit_bookings is
  'Private, non-emergency home consultation requests visible only to the patient, assigned claimed doctor, and platform admins.';

create unique index if not exists home_visit_bookings_active_slot_uidx
  on public.home_visit_bookings (doctor_id, scheduled_date, scheduled_start_time)
  where status in ('pending', 'confirmed');

create index if not exists home_visit_bookings_patient_schedule_idx
  on public.home_visit_bookings (patient_id, scheduled_date desc, scheduled_start_time desc);

create index if not exists home_visit_bookings_doctor_status_schedule_idx
  on public.home_visit_bookings (doctor_id, status, scheduled_date, scheduled_start_time);

create or replace function public.guard_home_visit_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user uuid := (select auth.uid());
  patient_role public.user_role;
  patient_name text;
  visit_doctor public.doctors%rowtype;
  visit_weekday text;
  local_now timestamp := timezone('Asia/Kolkata', now());
begin
  if acting_user is null or new.patient_id is distinct from acting_user then
    raise exception 'A patient may only create their own home visit request.' using errcode = '42501';
  end if;

  select p.role,
         coalesce(
           nullif(btrim(p.display_name), ''),
           nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), ''),
           'Patient'
         )
    into patient_role, patient_name
    from public.profiles as p
    where p.id = acting_user;

  if patient_role is distinct from 'patient'::public.user_role then
    raise exception 'Only patient accounts can request a home visit.' using errcode = '42501';
  end if;

  select d.* into visit_doctor
    from public.doctors as d
    where d.id = new.doctor_id;

  if not found
     or visit_doctor.publication_status <> 'published'
     or not visit_doctor.offers_home_visits
     or visit_doctor.claimed_by_user_id is null then
    raise exception 'This doctor is not accepting scheduled requests.' using errcode = '23514';
  end if;

  if coalesce(cardinality(visit_doctor.home_visit_days), 0) = 0
     or visit_doctor.home_visit_start_time is null
     or visit_doctor.home_visit_end_time is null
     or visit_doctor.home_visit_end_time <= visit_doctor.home_visit_start_time then
    raise exception 'This doctor has not published a complete home visit schedule.' using errcode = '23514';
  end if;

  visit_weekday := to_char(new.scheduled_date, 'FMDay');
  if not (visit_weekday = any(visit_doctor.home_visit_days)) then
    raise exception 'The selected date is outside the doctor schedule.' using errcode = '23514';
  end if;

  if new.scheduled_start_time < visit_doctor.home_visit_start_time
     or (new.scheduled_start_time + interval '30 minutes') > visit_doctor.home_visit_end_time then
    raise exception 'The selected time is outside the doctor schedule.' using errcode = '23514';
  end if;

  if (new.scheduled_date + new.scheduled_start_time) <= local_now then
    raise exception 'Home visit requests must be scheduled in the future.' using errcode = '23514';
  end if;

  new.patient_display_name := patient_name;
  new.scheduled_end_time := new.scheduled_start_time + interval '30 minutes';
  new.address_line_1 := btrim(new.address_line_1);
  new.address_line_2 := nullif(btrim(new.address_line_2), '');
  new.locality := btrim(new.locality);
  new.city := btrim(new.city);
  new.postal_code := nullif(btrim(new.postal_code), '');
  new.landmark := nullif(btrim(new.landmark), '');
  new.patient_note := nullif(btrim(new.patient_note), '');
  new.status := 'pending';
  new.accepted_at := null;
  new.declined_at := null;
  new.cancelled_at := null;
  new.decline_reason := null;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.guard_home_visit_booking_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user uuid := (select auth.uid());
  is_patient boolean := acting_user = old.patient_id;
  is_doctor boolean;
  is_admin boolean;
begin
  select exists (
    select 1 from public.doctors as d
    where d.id = old.doctor_id
      and d.claimed_by_user_id = acting_user
  ) into is_doctor;

  select exists (
    select 1 from public.profiles as p
    where p.id = acting_user and p.role = 'admin'::public.user_role
  ) into is_admin;

  if new.id is distinct from old.id
     or new.booking_reference is distinct from old.booking_reference
     or new.patient_id is distinct from old.patient_id
     or new.doctor_id is distinct from old.doctor_id
     or new.patient_display_name is distinct from old.patient_display_name
     or new.scheduled_date is distinct from old.scheduled_date
     or new.scheduled_start_time is distinct from old.scheduled_start_time
     or new.scheduled_end_time is distinct from old.scheduled_end_time
     or new.address_line_1 is distinct from old.address_line_1
     or new.address_line_2 is distinct from old.address_line_2
     or new.locality is distinct from old.locality
     or new.city is distinct from old.city
     or new.postal_code is distinct from old.postal_code
     or new.landmark is distinct from old.landmark
     or new.patient_note is distinct from old.patient_note
     or new.created_at is distinct from old.created_at then
    raise exception 'Booking details are immutable after submission.' using errcode = '42501';
  end if;

  if is_patient then
    if old.status not in ('pending', 'confirmed') or new.status <> 'cancelled' then
      raise exception 'Patients may only cancel a pending or confirmed visit.' using errcode = '42501';
    end if;
    new.cancelled_at := now();
    new.accepted_at := old.accepted_at;
    new.declined_at := null;
    new.decline_reason := null;
  elsif is_doctor then
    if old.status <> 'pending' or new.status not in ('confirmed', 'declined') then
      raise exception 'Doctors may only accept or decline pending requests.' using errcode = '42501';
    end if;
    new.cancelled_at := null;
    if new.status = 'confirmed' then
      new.accepted_at := now();
      new.declined_at := null;
      new.decline_reason := null;
    else
      new.accepted_at := null;
      new.declined_at := now();
      new.decline_reason := nullif(btrim(new.decline_reason), '');
    end if;
  elsif is_admin then
    if new.status not in ('pending', 'confirmed', 'declined', 'cancelled', 'completed') then
      raise exception 'Unsupported booking status.' using errcode = '23514';
    end if;
  else
    raise exception 'You cannot update this home visit request.' using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_home_visit_booking_insert_trigger on public.home_visit_bookings;
create trigger guard_home_visit_booking_insert_trigger
  before insert on public.home_visit_bookings
  for each row execute function public.guard_home_visit_booking_insert();

drop trigger if exists guard_home_visit_booking_update_trigger on public.home_visit_bookings;
create trigger guard_home_visit_booking_update_trigger
  before update on public.home_visit_bookings
  for each row execute function public.guard_home_visit_booking_update();

alter table public.home_visit_bookings enable row level security;

create policy "Patients can read own home visit bookings"
  on public.home_visit_bookings for select to authenticated
  using (patient_id = (select auth.uid()));

create policy "Claimed doctors can read assigned home visit bookings"
  on public.home_visit_bookings for select to authenticated
  using (
    exists (
      select 1 from public.doctors as d
      where d.id = home_visit_bookings.doctor_id
        and d.claimed_by_user_id = (select auth.uid())
    )
  );

create policy "Admins can read home visit bookings"
  on public.home_visit_bookings for select to authenticated
  using ((select public.is_platform_admin()));

create policy "Patients can request home visits"
  on public.home_visit_bookings for insert to authenticated
  with check (
    patient_id = (select auth.uid())
    and status = 'pending'
  );

create policy "Participants can update home visit bookings"
  on public.home_visit_bookings for update to authenticated
  using (
    patient_id = (select auth.uid())
    or exists (
      select 1 from public.doctors as d
      where d.id = home_visit_bookings.doctor_id
        and d.claimed_by_user_id = (select auth.uid())
    )
    or (select public.is_platform_admin())
  )
  with check (
    patient_id = (select auth.uid())
    or exists (
      select 1 from public.doctors as d
      where d.id = home_visit_bookings.doctor_id
        and d.claimed_by_user_id = (select auth.uid())
    )
    or (select public.is_platform_admin())
  );

create or replace function public.get_home_visit_unavailable_slots(
  requested_doctor_id uuid,
  requested_date date
)
returns table (scheduled_start_time time)
language sql
stable
security definer
set search_path = ''
as $$
  select b.scheduled_start_time
  from public.home_visit_bookings as b
  join public.doctors as d on d.id = b.doctor_id
  where b.doctor_id = requested_doctor_id
    and b.scheduled_date = requested_date
    and b.status in ('pending', 'confirmed')
    and d.publication_status = 'published'
    and d.offers_home_visits
  order by b.scheduled_start_time;
$$;

revoke all on table public.home_visit_bookings from public, anon;
revoke all on table public.home_visit_bookings from authenticated;
grant select on table public.home_visit_bookings to authenticated;
grant insert (
  patient_id, doctor_id, scheduled_date, scheduled_start_time,
  address_line_1, address_line_2, locality, city, postal_code, landmark, patient_note
) on public.home_visit_bookings to authenticated;
grant update (status, decline_reason) on public.home_visit_bookings to authenticated;
grant all on table public.home_visit_bookings to service_role;

revoke execute on function public.guard_home_visit_booking_insert() from public, anon, authenticated;
revoke execute on function public.guard_home_visit_booking_update() from public, anon, authenticated;
grant execute on function public.guard_home_visit_booking_insert() to service_role;
grant execute on function public.guard_home_visit_booking_update() to service_role;

revoke execute on function public.get_home_visit_unavailable_slots(uuid, date) from public, anon;
grant execute on function public.get_home_visit_unavailable_slots(uuid, date) to authenticated, service_role;

-- The only seeded bookable schedule is the explicitly-labelled demo provider.
-- No real directory practitioner schedule is inferred.
update public.doctors
set offers_home_visits = true,
    home_visit_service_areas = array['Vashi', 'Nerul'],
    home_visit_days = array['Monday', 'Wednesday', 'Friday'],
    home_visit_start_time = time '18:00',
    home_visit_end_time = time '21:00',
    home_visit_note = 'Demonstration schedule for product testing only.'
where slug = 'dr-demo-patel'
  and source_dataset = 'Demonstration System';

-- Source-backed profile enrichment. Null map fields remain null: none of these
-- sources supplies a Google place ID or coordinates suitable for an exact pin.
insert into public.data_sources (source_type, name, publisher, base_url)
select 'provider_supplied', 'MGM Hospital Vashi official website', 'MGM New Bombay Hospital', 'https://mgmhospitalvashi.net/'
where not exists (select 1 from public.data_sources where name = 'MGM Hospital Vashi official website');

insert into public.data_sources (source_type, name, publisher, base_url)
select 'provider_supplied', 'Medicover Hospitals Navi Mumbai official website', 'Medicover Hospitals', 'https://www.medicoverhospitals.in/hospitals/maharashtra/navi-mumbai/'
where not exists (select 1 from public.data_sources where name = 'Medicover Hospitals Navi Mumbai official website');

insert into public.data_sources (source_type, name, publisher, base_url)
select 'provider_supplied', 'MGM Institute of Health Sciences official website', 'MGM Institute of Health Sciences', 'https://www.mgmuhs.com/'
where not exists (select 1 from public.data_sources where name = 'MGM Institute of Health Sciences official website');

insert into public.data_sources (source_type, name, publisher, base_url)
select 'provider_supplied', 'Fortis Healthcare annual report 2022-23', 'Fortis Healthcare', 'https://www.fortishealthcare.com/investor/annual%20reports/fhl%20annual%20report%20fy%202022-23'
where not exists (select 1 from public.data_sources where name = 'Fortis Healthcare annual report 2022-23');

-- The NMMC page explicitly classifies and publishes contact numbers for these
-- six municipal/government facilities and one private hospital.
update public.hospitals set hospital_type = coalesce(hospital_type, 'Municipal Hospital'), public_phone = coalesce(public_phone, '022-27899901') where slug = 'nmmc-general-hospital-vashi';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Municipal Hospital'), public_phone = coalesce(public_phone, '022-27700376') where slug = 'nmmc-general-hospital-nerul';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Municipal Hospital'), public_phone = coalesce(public_phone, '022-27690561') where slug = 'nmmc-general-hospital-airoli';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Government Hospital'), public_phone = coalesce(public_phone, '022-27822268') where slug = 'esis-hospital-vashi';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Mother and Child Health Centre'), public_phone = coalesce(public_phone, '022-27631827') where slug = 'mch-turbhe';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Mother and Child Health Centre'), public_phone = coalesce(public_phone, '022-27573577') where slug = 'mch-koparkhairane';
update public.hospitals set hospital_type = coalesce(hospital_type, 'Private Hospital'), public_phone = coalesce(public_phone, '022-27570219') where slug = 'mgm-hospital-belapur';

update public.hospital_evidence as evidence
set supported_scope = array['hospital classification', 'locality', 'public phone'],
    checked_at = timestamptz '2026-09-08 00:00:00+05:30'
from public.hospitals as hospital, public.data_sources as source
where evidence.hospital_id = hospital.id
  and evidence.source_id = source.id
  and source.name = 'Navi Mumbai Municipal Corporation - List of Hospitals'
  and hospital.slug in (
    'nmmc-general-hospital-vashi', 'nmmc-general-hospital-nerul',
    'nmmc-general-hospital-airoli', 'esis-hospital-vashi',
    'mch-turbhe', 'mch-koparkhairane', 'mgm-hospital-belapur'
  );

-- Provider-published structured facts. Existing non-null catalog values are
-- preserved so a later reviewed record is not silently overwritten.
update public.hospitals
set hospital_type = coalesce(hospital_type, 'Multispeciality Tertiary Care Hospital'),
    total_beds = coalesce(total_beds, 250),
    emergency_department = coalesce(emergency_department, true),
    ambulance_available = coalesce(ambulance_available, true),
    website = coalesce(website, 'https://mgmhospitalvashi.net/')
where slug = 'mgm-hospital-vashi';

update public.hospitals
set hospital_type = coalesce(hospital_type, 'Multispeciality Hospital'),
    address_line_1 = coalesce(address_line_1, 'Sector 10, Kharghar'),
    pin_code = coalesce(pin_code, '410210'),
    public_phone = coalesce(public_phone, '040-68334455'),
    website = coalesce(website, 'https://www.medicoverhospitals.in/hospitals/maharashtra/navi-mumbai/'),
    year_established = coalesce(year_established, 2022),
    total_beds = coalesce(total_beds, 310),
    icu_beds = coalesce(icu_beds, 85),
    emergency_department = coalesce(emergency_department, true)
where slug = 'medicover-hospital';

update public.hospitals
set hospital_type = coalesce(hospital_type, 'Teaching Hospital'),
    address_line_1 = coalesce(address_line_1, 'Sector 1, Kamothe'),
    pin_code = coalesce(pin_code, '410209'),
    public_phone = coalesce(public_phone, '022-27437900'),
    website = coalesce(website, 'https://www.mgmuhs.com/'),
    total_beds = coalesce(total_beds, 810),
    emergency_department = coalesce(emergency_department, true)
where slug = 'mgm-hospital-kamothe';

update public.hospitals
set hospital_type = coalesce(hospital_type, 'Multispeciality Tertiary Care Hospital'),
    address_line_1 = coalesce(address_line_1, 'Mini Sea Shore Road, Sector 10-A, Vashi'),
    pin_code = coalesce(pin_code, '400703'),
    public_phone = coalesce(public_phone, '022-39199100'),
    website = coalesce(website, 'https://www.fortishealthcare.com/'),
    total_beds = coalesce(total_beds, 138),
    emergency_department = coalesce(emergency_department, true)
where slug = 'fortis-hiranandani-hospital';

with evidence_seed(hospital_slug, source_name, source_url, supported_scope, public_notes) as (
  values
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'https://mgmhospitalvashi.net/', array['hospital type', 'bed capacity', 'emergency department', 'ambulance', 'specialties', 'facilities', 'services'], 'Provider website reviewed for explicitly published institutional facts; promotional claims and rankings were excluded.'::text),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'https://www.medicoverhospitals.in/hospitals/maharashtra/navi-mumbai/', array['address', 'public phone', 'opening year', 'bed capacity', 'ICU capacity', 'emergency department', 'specialties', 'facilities'], 'Provider pages reviewed for explicitly published Navi Mumbai facility facts; unsupported claims were excluded.'::text),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'https://www.mgmuhs.com/pdfs/AQAR_2023-24/PART-B/Criteria_II/2.4.3/Experience%20Letters/2.4.3_NBCON_Experience%20certificates_compressed.pdf', array['address', 'public phone', 'bed capacity', 'emergency department', 'specialties', 'facilities'], 'Official institutional material identifies the Kamothe hospital and its published capacity and clinical services.'::text),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'https://www.fortishealthcare.com/investor/annual%20reports/fhl%20annual%20report%20fy%202022-23', array['hospital type', 'address', 'bed capacity', 'emergency department', 'specialties', 'facilities'], 'Fortis institutional publications reviewed for the Vashi facility; only explicit facts were retained.'::text)
)
insert into public.hospital_evidence (
  hospital_id, source_id, source_url, supported_scope, review_status, checked_at, public_notes
)
select hospital.id, source.id, seed.source_url, seed.supported_scope,
       'source_matched', timestamptz '2026-09-08 00:00:00+05:30', seed.public_notes
from evidence_seed as seed
join public.hospitals as hospital on hospital.slug = seed.hospital_slug
join public.data_sources as source on source.name = seed.source_name
where not exists (
  select 1 from public.hospital_evidence as existing
  where existing.hospital_id = hospital.id and existing.source_id = source.id
);

with supported(hospital_slug, source_name, taxonomy_kind, taxonomy_slug) as (
  values
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'cardiology'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'oncology'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'orthopedics'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'obstetrics-gynecology'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'pediatrics'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'specialty', 'critical-care'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'specialty', 'general-medicine'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'specialty', 'cardiology'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'specialty', 'oncology'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'specialty', 'pediatrics'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'specialty', 'orthopedics'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'specialty', 'cardiology'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'specialty', 'neurology'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'specialty', 'nephrology'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'specialty', 'urology'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'specialty', 'pediatrics'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'cardiology'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'orthopedics'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'neurology'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'urology'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'nephrology'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'obstetrics-gynecology'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'specialty', 'pediatrics')
)
insert into public.hospital_specialties (hospital_id, specialty_id, source_evidence_id)
select hospital.id, taxonomy.id, evidence.id
from supported
join public.hospitals as hospital on hospital.slug = supported.hospital_slug
join public.specialties as taxonomy on taxonomy.slug = supported.taxonomy_slug
join public.data_sources as source on source.name = supported.source_name
join public.hospital_evidence as evidence on evidence.hospital_id = hospital.id and evidence.source_id = source.id
where supported.taxonomy_kind = 'specialty'
on conflict (hospital_id, specialty_id) do update set source_evidence_id = excluded.source_evidence_id;

with supported(hospital_slug, source_name, taxonomy_kind, taxonomy_slug) as (
  values
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'facility', 'intensive-care-unit'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'facility', 'emergency-department'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'facility', 'diagnostic-imaging'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'facility', 'laboratory'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'facility', 'intensive-care-unit'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'facility', 'emergency-department'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'facility', 'intensive-care-unit'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'facility', 'emergency-department'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'facility', 'laboratory'),
    ('mgm-hospital-kamothe', 'MGM Institute of Health Sciences official website', 'facility', 'blood-bank'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'facility', 'intensive-care-unit'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'facility', 'emergency-department')
)
insert into public.hospital_facilities (hospital_id, facility_id, availability_status, source_evidence_id)
select hospital.id, taxonomy.id, 'available', evidence.id
from supported
join public.hospitals as hospital on hospital.slug = supported.hospital_slug
join public.facilities as taxonomy on taxonomy.slug = supported.taxonomy_slug
join public.data_sources as source on source.name = supported.source_name
join public.hospital_evidence as evidence on evidence.hospital_id = hospital.id and evidence.source_id = source.id
where supported.taxonomy_kind = 'facility'
on conflict (hospital_id, facility_id) do update set availability_status = excluded.availability_status, source_evidence_id = excluded.source_evidence_id;

with supported(hospital_slug, source_name, taxonomy_slug) as (
  values
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'ambulance-services'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'emergency-care'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'inpatient-care'),
    ('mgm-hospital-vashi', 'MGM Hospital Vashi official website', 'diagnostic-services'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'emergency-care'),
    ('medicover-hospital', 'Medicover Hospitals Navi Mumbai official website', 'inpatient-care'),
    ('fortis-hiranandani-hospital', 'Fortis Healthcare annual report 2022-23', 'emergency-care')
)
insert into public.hospital_services_catalog (hospital_id, service_id, availability_status, source_evidence_id)
select hospital.id, taxonomy.id, 'available', evidence.id
from supported
join public.hospitals as hospital on hospital.slug = supported.hospital_slug
join public.services as taxonomy on taxonomy.slug = supported.taxonomy_slug
join public.data_sources as source on source.name = supported.source_name
join public.hospital_evidence as evidence on evidence.hospital_id = hospital.id and evidence.source_id = source.id
on conflict (hospital_id, service_id) do update set availability_status = excluded.availability_status, source_evidence_id = excluded.source_evidence_id;
