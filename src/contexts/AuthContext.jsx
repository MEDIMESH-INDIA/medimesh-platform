/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { getAuthIdentityTransition, getCachedUserId } from '../routes/authGuardState';
import { clearPersistedComparison } from '../hooks/useCompare';

const logAuth = (action, details = {}) => {
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    const sanitized = { ...details };
    delete sanitized.access_token;
    delete sanitized.refresh_token;
    delete sanitized.password;
    delete sanitized.token;
    console.debug(`[MEDIMESH:Auth:${action}]`, sanitized);
  }
};

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const cachedUserId = getCachedUserId();
  const [profileLoading, setProfileLoading] = useState(Boolean(cachedUserId));
  const [authError, setAuthError] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const mountedRef = useRef(false);
  const activeUserIdRef = useRef(cachedUserId);
  const profileLoadedUserIdRef = useRef(null);
  const profileRef = useRef(null);
  const profileLoadingRef = useRef(Boolean(cachedUserId));
  const profileRequestRef = useRef(0);

  const clearProfileState = useCallback(() => {
    profileRequestRef.current += 1;
    profileLoadedUserIdRef.current = null;
    profileRef.current = null;
    profileLoadingRef.current = false;
    setProfile(null);
    setRole(null);
    setProfileError(null);
    setProfileLoading(false);
  }, []);

  const fetchProfile = useCallback(async (userId, { keepExisting = false } = {}) => {
    const requestId = ++profileRequestRef.current;
    profileLoadedUserIdRef.current = userId;

    logAuth('ProfileFetchStart', { userId, requestId });

    if (!keepExisting) {
      setProfile(null);
      setRole(null);
      profileRef.current = null;
    }
    setProfileError(null);
    profileLoadingRef.current = true;
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
        logAuth('ProfileFetchStaleDiscarded', { userId, requestId });
        return null;
      }

      logAuth('ProfileFetchSuccess', {
        userId,
        requestId,
        role: data.role ?? null,
        hasAvatar: Boolean(data.avatar_url),
      });

      profileRef.current = data;
      setProfile(data);
      setRole(data.role ?? null);
      return data;
    } catch (error) {
      if (
        mountedRef.current
        && requestId === profileRequestRef.current
        && activeUserIdRef.current === userId
      ) {
        console.error('[MEDIMESH:Auth:ProfileFetchError]', {
          userId,
          requestId,
          message: error.message,
          code: error.code || error.status || 'UNKNOWN',
        });
        profileLoadedUserIdRef.current = null;
        profileRef.current = null;
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
        profileLoadingRef.current = false;
        setProfileLoading(false);
      }
    }
  }, []);

  const applySession = useCallback((nextSession, eventSource = 'session') => {
    const nextUserId = nextSession?.user?.id ?? null;
    const isNewUser = activeUserIdRef.current !== nextUserId;
    const profileNotYetLoaded = profileLoadedUserIdRef.current !== nextUserId;
    const profileMissing = !profileRef.current && !profileLoadingRef.current;

    const transition = getAuthIdentityTransition(activeUserIdRef.current, nextSession, {
      requireProfileHydration: profileNotYetLoaded,
    });

    const shouldFetchProfile = Boolean(transition.nextUser) && (
      isNewUser || profileNotYetLoaded || profileMissing || transition.shouldLoadProfile
    );

    logAuth('IdentityTransition', {
      eventSource,
      currentUserId: activeUserIdRef.current,
      nextUserId,
      identityChanged: transition.identityChanged,
      shouldFetchProfile,
      hasLoadedProfile: profileLoadedUserIdRef.current === nextUserId,
    });

    setSession(nextSession);
    setUser(transition.nextUser);
    setAuthError(null);

    if (transition.shouldClearProfile) {
      activeUserIdRef.current = transition.nextUserId;
      clearProfileState();
    }

    if (transition.identityChanged) {
      clearPersistedComparison();
      logAuth('IdentityChanged', { from: activeUserIdRef.current, to: transition.nextUserId });
    }

    if (!transition.nextUser) {
      activeUserIdRef.current = null;
      profileLoadedUserIdRef.current = null;
      profileRef.current = null;
      profileLoadingRef.current = false;
      setAuthLoading(false);
      setProfileLoading(false);
      return;
    }

    activeUserIdRef.current = transition.nextUserId;

    if (shouldFetchProfile) {
      profileLoadedUserIdRef.current = transition.nextUserId;
      profileLoadingRef.current = true;
      setProfileLoading(true);
      setAuthLoading(false);
      void fetchProfile(transition.nextUserId);
    } else {
      setAuthLoading(false);
    }
  }, [clearProfileState, fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let authEventSeen = false;

    logAuth('InitSubscription');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (cancelled) return;
        authEventSeen = true;
        logAuth('AuthStateChange', { event, userId: nextSession?.user?.id ?? null });

        if (event === 'SIGNED_OUT' || !nextSession?.user) {
          clearPersistedComparison();
          if (event === 'SIGNED_OUT' && activeUserIdRef.current) {
            try {
              localStorage.removeItem(`medimesh_compare_v1_${activeUserIdRef.current}`);
            } catch {
              // Ignore storage cleanup issues
            }
          }
        }
        applySession(nextSession, event);
      }
    );

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (cancelled || authEventSeen) return;
        if (error) throw error;
        logAuth('SessionRestored', { userId: data.session?.user?.id ?? null });
        applySession(data.session, 'INITIAL_GET_SESSION');
      })
      .catch((error) => {
        if (cancelled || authEventSeen) return;

        console.error('[MEDIMESH:Auth:RestoreSessionError]', error.message);
        activeUserIdRef.current = null;
        profileLoadedUserIdRef.current = null;
        setSession(null);
        setUser(null);
        setAuthError(error);
        setAuthLoading(false);
        setProfileLoading(false);
        clearProfileState();
        clearPersistedComparison();
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
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
    clearPersistedComparison();
    logAuth('SignOut');
    const userIdToClean = activeUserIdRef.current;
    if (userIdToClean) {
      try {
        localStorage.removeItem(`medimesh_compare_v1_${userIdToClean}`);
      } catch {
        // Ignore storage cleanup issues
      }
    }
    activeUserIdRef.current = null;
    profileLoadedUserIdRef.current = null;
    clearProfileState();
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
    if (!userId) return Promise.resolve(null);
    logAuth('ManualProfileRefresh', { userId });
    profileLoadedUserIdRef.current = null;
    return fetchProfile(userId, { keepExisting: Boolean(profileRef.current) });
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
