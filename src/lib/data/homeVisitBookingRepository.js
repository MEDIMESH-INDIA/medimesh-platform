import { supabase } from '../supabase/client';

const BOOKING_SELECT = `
  id, booking_reference, patient_id, doctor_id, patient_display_name,
  scheduled_date, scheduled_start_time, scheduled_end_time,
  address_line_1, address_line_2, locality, city, postal_code, landmark,
  patient_note, status, accepted_at, declined_at, cancelled_at,
  decline_reason, created_at, updated_at,
  doctors(id, slug, full_name, specialization, locality, city, home_visit_fee)
`;

const cleanNullable = value => {
  const cleaned = String(value ?? '').trim();
  return cleaned || null;
};

export class BookingRepositoryError extends Error {
  constructor(message, code = 'BOOKING_ERROR') {
    super(message);
    this.name = 'BookingRepositoryError';
    this.code = code;
  }
}

function mapBookingError(error) {
  if (error?.code === '23505') {
    return new BookingRepositoryError(
      'That time was just requested by someone else. Please choose another slot.',
      'SLOT_CONFLICT',
    );
  }
  if (error?.code === '23514') {
    return new BookingRepositoryError(error.message || 'This visit no longer matches the doctor schedule.', 'INVALID_SLOT');
  }
  if (error?.code === '42501') {
    return new BookingRepositoryError('You do not have permission to complete this booking action.', 'NOT_ALLOWED');
  }
  return new BookingRepositoryError(error?.message || 'The booking action could not be completed.');
}

function normalizeBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.booking_reference,
    patientId: row.patient_id,
    patientName: row.patient_display_name,
    doctorId: row.doctor_id,
    doctor: row.doctors ? {
      id: row.doctors.id,
      slug: row.doctors.slug,
      name: row.doctors.full_name,
      specialization: row.doctors.specialization,
      locality: row.doctors.locality,
      city: row.doctors.city,
      fee: row.doctors.home_visit_fee,
    } : null,
    date: row.scheduled_date,
    startTime: row.scheduled_start_time,
    endTime: row.scheduled_end_time,
    address: {
      line1: row.address_line_1,
      line2: row.address_line_2,
      locality: row.locality,
      city: row.city,
      postalCode: row.postal_code,
      landmark: row.landmark,
    },
    note: row.patient_note,
    status: row.status,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    cancelledAt: row.cancelled_at,
    declineReason: row.decline_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createHomeVisitBooking({ patientId, doctorId, date, startTime, address, note }) {
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      scheduled_date: date,
      scheduled_start_time: startTime,
      address_line_1: String(address.line1 || '').trim(),
      address_line_2: cleanNullable(address.line2),
      locality: String(address.locality || '').trim(),
      city: String(address.city || '').trim(),
      postal_code: cleanNullable(address.postalCode),
      landmark: cleanNullable(address.landmark),
      patient_note: cleanNullable(note),
    })
    .select(BOOKING_SELECT)
    .single();

  if (error) throw mapBookingError(error);
  return normalizeBooking(data);
}

export async function listPatientHomeVisitBookings() {
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .select(BOOKING_SELECT)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_start_time', { ascending: false });
  if (error) throw mapBookingError(error);
  return (data || []).map(normalizeBooking);
}

export async function listDoctorHomeVisitBookings() {
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .select(BOOKING_SELECT)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_start_time', { ascending: true });
  if (error) throw mapBookingError(error);
  return (data || []).map(normalizeBooking);
}

export async function getHomeVisitBooking(id) {
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw mapBookingError(error);
  return normalizeBooking(data);
}

export async function cancelHomeVisitBooking(id) {
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select(BOOKING_SELECT)
    .single();
  if (error) throw mapBookingError(error);
  return normalizeBooking(data);
}

export async function respondToHomeVisitBooking(id, response, declineReason = null) {
  const status = response === 'accept' ? 'confirmed' : 'declined';
  const { data, error } = await supabase
    .from('home_visit_bookings')
    .update({ status, decline_reason: status === 'declined' ? cleanNullable(declineReason) : null })
    .eq('id', id)
    .select(BOOKING_SELECT)
    .single();
  if (error) throw mapBookingError(error);
  return normalizeBooking(data);
}

export async function getUnavailableHomeVisitSlots(doctorId, date) {
  if (!doctorId || !date) return [];
  const { data, error } = await supabase.rpc('get_home_visit_unavailable_slots', {
    requested_doctor_id: doctorId,
    requested_date: date,
  });
  if (error) throw mapBookingError(error);
  return (data || []).map(row => String(row.scheduled_start_time).slice(0, 5));
}

