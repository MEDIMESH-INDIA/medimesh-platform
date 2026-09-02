/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { getAuthIdentityTransition } from '../routes/authGuardState';

const AuthContext = createContext({});

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const mountedRef = useRef(false);
  const activeUserIdRef = useRef(null);
  const profileRequestRef = useRef(0);

  const clearProfileState = useCallback(() => {
    profileRequestRef.current += 1;
    setProfile(null);
    setRole(null);
    setProfileError(null);
    setProfileLoading(false);
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    const requestId = ++profileRequestRef.current;

    setProfile(null);
    setRole(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No profile is associated with this account.');

      if (
        !mountedRef.current
        || requestId !== profileRequestRef.current
        || activeUserIdRef.current !== userId
      ) {
        return null;
      }

      setProfile(data);
      setRole(data.role ?? null);
      return data;
    } catch (error) {
      if (
        mountedRef.current
        && requestId === profileRequestRef.current
        && activeUserIdRef.current === userId
      ) {
        console.error('Error loading user profile:', error.message);
        setProfile(null);
        setRole(null);
        setProfileError(error);
      }

      return null;
    } finally {
      if (
        mountedRef.current
        && requestId === profileRequestRef.current
        && activeUserIdRef.current === userId
      ) {
        setProfileLoading(false);
      }
    }
  }, []);

  const applySession = useCallback((nextSession) => {
    const transition = getAuthIdentityTransition(activeUserIdRef.current, nextSession);

    setSession(nextSession);
    setUser(transition.nextUser);
    setAuthError(null);
    setAuthLoading(false);

    if (transition.shouldClearProfile) {
      activeUserIdRef.current = transition.nextUserId;
      clearProfileState();
    }

    if (!transition.nextUser) {
      activeUserIdRef.current = null;
      return;
    }

    if (transition.shouldLoadProfile) {
      void fetchProfile(transition.nextUserId);
    }
  }, [clearProfileState, fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let authEventSeen = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (cancelled) return;
        authEventSeen = true;
        applySession(nextSession);
      }
    );

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (cancelled || authEventSeen) return;
        if (error) throw error;
        applySession(data.session);
      })
      .catch((error) => {
        if (cancelled || authEventSeen) return;

        console.error('Error restoring authentication session:', error.message);
        activeUserIdRef.current = null;
        setSession(null);
        setUser(null);
        setAuthError(error);
        setAuthLoading(false);
        clearProfileState();
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      activeUserIdRef.current = null;
      profileRequestRef.current += 1;
      subscription.unsubscribe();
    };
  }, [applySession, clearProfileState]);

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });
  };

  const signUp = async (email, password, profileData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData
      }
    });

    if (error) throw error;
    return { data, error };
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const updatePassword = async (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword });
  };

  const resendVerification = async (email) => {
    return supabase.auth.resend({
      type: 'signup',
      email,
    });
  };

  const refreshProfile = useCallback(() => {
    const userId = activeUserIdRef.current;
    return userId ? fetchProfile(userId) : Promise.resolve(null);
  }, [fetchProfile]);

  const loading = authLoading || (Boolean(user) && profileLoading);

  const value = {
    user,
    session,
    profile,
    role,
    loading,
    authLoading,
    profileLoading,
    authError,
    profileError,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
