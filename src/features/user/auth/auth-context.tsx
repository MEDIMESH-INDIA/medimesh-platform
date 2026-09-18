'use client';

/**
 * MEDIMESH INDIA 2.0 — Client Authentication Context
 *
 * Lightweight React Context providing authentication state and logged-out save trigger.
 * Interacts with developmentAuth adapter for synthetic demo users (Demo User 001, Demo User 002).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, AuthSession } from './interfaces.ts';
import { developmentAuth, SYNTHETIC_DEMO_USERS } from './development-auth-adapter.ts';
import type { SavedEntityType } from '../domain/index.ts';

export interface PendingSaveRequest {
  entityType: SavedEntityType;
  entityId: string;
}

interface AuthContextValue {
  session: AuthSession;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (userId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  pendingSave: PendingSaveRequest | null;
  isPromptOpen: boolean;
  openAuthPrompt: (pending?: PendingSaveRequest) => void;
  closeAuthPrompt: () => void;
  completePendingSave: () => PendingSaveRequest | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: SYNTHETIC_DEMO_USERS['user-demo-001'] ?? null,
    isAuthenticated: true,
    isLoading: true,
  });
  const [pendingSave, setPendingSave] = useState<PendingSaveRequest | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    developmentAuth.getCurrentSession().then((sess) => {
      if (isMounted) {
        setSession(sess);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (userId: string = 'user-demo-001') => {
    const newSession = await developmentAuth.signInDemoUser(userId);
    setSession(newSession);
    setIsPromptOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await developmentAuth.signOut();
    const newSession = await developmentAuth.getCurrentSession();
    setSession(newSession);
  }, []);

  const switchUser = useCallback(async (userId: string) => {
    const newSession = await developmentAuth.switchDemoUser(userId);
    setSession(newSession);
  }, []);

  const openAuthPrompt = useCallback((pending?: PendingSaveRequest) => {
    if (pending) {
      setPendingSave(pending);
    }
    setIsPromptOpen(true);
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setIsPromptOpen(false);
    setPendingSave(null);
  }, []);

  const completePendingSave = useCallback(() => {
    const req = pendingSave;
    setPendingSave(null);
    return req;
  }, [pendingSave]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session.user,
        isAuthenticated: session.isAuthenticated,
        isLoading: session.isLoading,
        signIn,
        signOut,
        switchUser,
        pendingSave,
        isPromptOpen,
        openAuthPrompt,
        closeAuthPrompt,
        completePendingSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    // Provide a safe fallback if accessed outside AuthProvider so public discovery never crashes
    return {
      session: { user: null, isAuthenticated: false, isLoading: false },
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signIn: async () => {},
      signOut: async () => {},
      switchUser: async () => {},
      pendingSave: null,
      isPromptOpen: false,
      openAuthPrompt: () => {},
      closeAuthPrompt: () => {},
      completePendingSave: () => null,
    };
  }
  return context;
}
