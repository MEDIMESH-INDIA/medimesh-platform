import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getHospitalWorkspace } from '../lib/data/hospitalPortalRepository';

export function useHospitalPortal() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setWorkspace({ linked: false });
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const nextWorkspace = await getHospitalWorkspace(user.id);
      setWorkspace(nextWorkspace);
      return nextWorkspace;
    } catch (nextError) {
      console.error('Hospital portal workspace failed to load:', nextError);
      setError(nextError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, workspace, loading, error, refresh };
}
