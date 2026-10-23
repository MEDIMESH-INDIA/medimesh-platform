/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/auth/AuthModal';

const AuthGateContext = createContext(null);

export function AuthGateProvider({ children }) {
  const { user, authLoading } = useAuth();

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Continue with MEDIMESH',
    message: 'Sign in or create an account to continue.',
    returnTo: '/',
    initialMode: 'login',
  });

  const resumeActionRef = useRef(null);

  const openAuthModal = useCallback(({
    message = 'Sign in or create an account to continue.',
    title = 'Continue with MEDIMESH',
    returnTo = '/',
    resumeAction = null,
    initialMode = 'login',
  } = {}) => {
    resumeActionRef.current = typeof resumeAction === 'function' ? resumeAction : null;
    setModalState({
      isOpen: true,
      title,
      message,
      returnTo,
      initialMode,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    resumeActionRef.current = null;
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const requireAuth = useCallback(({
    action,
    message = 'Sign in or create an account to continue.',
    title = 'Continue with MEDIMESH',
    returnTo,
    resumeAction,
    initialMode = 'login',
  } = {}) => {
    // If auth session is still being restored, wait and avoid false guest prompt
    if (authLoading) {
      return false;
    }

    // Authenticated user: immediately proceed with action
    if (user) {
      if (typeof action === 'function') {
        action();
      }
      return true;
    }

    // Unauthenticated visitor: gate action and open authentication modal
    const targetReturnTo = returnTo || (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/');
    const safeResume = resumeAction || action;

    openAuthModal({
      title,
      message,
      returnTo: targetReturnTo,
      resumeAction: safeResume,
      initialMode,
    });

    return false;
  }, [authLoading, user, openAuthModal]);

  const value = {
    requireAuth,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen: modalState.isOpen,
  };

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthModal
        open={modalState.isOpen}
        onClose={closeAuthModal}
        title={modalState.title}
        message={modalState.message}
        returnTo={modalState.returnTo}
        resumeAction={resumeActionRef.current}
        initialMode={modalState.initialMode}
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error('useAuthGate must be used within an AuthGateProvider');
  }
  return context;
}

