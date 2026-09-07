-- Revoke full update permission
REVOKE UPDATE ON public.doctors FROM authenticated;

-- Grant update only on doctor-editable columns
GRANT UPDATE (
  full_name,
  specialization,
  experience_years,
  locality,
  city,
  state,
  offers_home_visits,
  home_visit_service_areas,
  home_visit_days,
  home_visit_start_time,
  home_visit_end_time,
  home_visit_fee,
  home_visit_note,
  professional_phone,
  whatsapp_number,
  home_visit_contact_public
) ON public.doctors TO authenticated;

-- (Optional) If you want to use a trigger to prevent modifications to protected columns instead of column-level grants, 
-- but column-level grants are sufficient for PostgREST. PostgREST respects column-level privileges.
