-- MEDIMESH: Secure Home-Visit Booking Eligibility
-- Migration: 20261024000000_secure_home_visit_eligibility.sql
--
-- Objective:
-- Enforce verification-aware eligibility gates for home-visit bookings.
-- A doctor may accept requests only when:
-- 1. Canonical doctor record is published (publication_status = 'published').
-- 2. Canonical doctor record is verified (verification_status = 'verified').
-- 3. Doctor is claimed by an eligible provider account (claimed_by_user_id IS NOT NULL).
-- 4. offers_home_visits = true.
-- 5. A usable schedule exists (home_visit_days non-empty, start_time < end_time).
--
-- DO NOT EXECUTE AGAINST LIVE SUPABASE IN THIS PHASE. This migration is prepared for
-- deployment review.

-- 1. Tighten the trigger function guard_home_visit_booking_insert()
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
  visit_doctor record;
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
     or visit_doctor.verification_status <> 'verified'
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

-- 2. Tighten the INSERT RLS policy on home_visit_bookings
drop policy if exists "Patients can request home visits" on public.home_visit_bookings;

create policy "Patients can request home visits"
  on public.home_visit_bookings for insert to authenticated
  with check (
    patient_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.doctors as d
      where d.id = home_visit_bookings.doctor_id
        and d.publication_status = 'published'
        and d.verification_status = 'verified'
        and d.claimed_by_user_id is not null
        and d.offers_home_visits = true
        and coalesce(cardinality(d.home_visit_days), 0) > 0
        and d.home_visit_start_time is not null
        and d.home_visit_end_time is not null
        and d.home_visit_end_time > d.home_visit_start_time
    )
  );

-- 3. Update get_home_visit_unavailable_slots RPC to require verified and claimed doctors
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
    and d.verification_status = 'verified'
    and d.claimed_by_user_id is not null
    and d.offers_home_visits
  order by b.scheduled_start_time;
$$;

