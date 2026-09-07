import { useCallback, useEffect, useState } from 'react';
import {
  getHomeVisitBooking,
  listDoctorHomeVisitBookings,
  listPatientHomeVisitBookings,
} from '../lib/data/homeVisitBookingRepository';

export function useHomeVisitBookings({ audience = 'patient', bookingId = null, limit = null } = {}) {
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (bookingId) {
        setBooking(await getHomeVisitBooking(bookingId));
      } else {
        const result = audience === 'doctor'
          ? await listDoctorHomeVisitBookings()
          : await listPatientHomeVisitBookings();
        setBookings(limit ? result.slice(0, limit) : result);
      }
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [audience, bookingId, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { bookings, booking, loading, error, refresh, setBooking };
}

