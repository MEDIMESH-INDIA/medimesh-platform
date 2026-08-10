import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, userEmail, userMetadata) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found. This happens on first OAuth login.
          // Create a default patient profile securely.
          const newProfile = {
            id: userId,
            email: userEmail,
            role: 'patient',
            first_name: userMetadata?.full_name?.split(' ')[0] || '',
            last_name: userMetadata?.full_name?.split(' ').slice(1).join(' ') || '',
            display_name: userMetadata?.full_name || userEmail?.split('@')[0] || 'User',
            avatar_url: userMetadata?.avatar_url || '',
            verification_status: 'pending'
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (createError) throw createError;
          
          setProfile(createdProfile);
          setRole(createdProfile.role);
          return;
        }
        throw error;
      }
      
      setProfile(data);
      setRole(data.role);
    } catch (error) {
      console.error('Error loading user profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

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
        data: {
          role: profileData.role,
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email,
            ...profileData
          }
        ]);
        
      if (profileError) throw profileError;
    }

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

  const value = {
    user,
    session,
    profile,
    role,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
    refreshProfile: () => user && fetchProfile(user.id, user.email, user.user_metadata),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
