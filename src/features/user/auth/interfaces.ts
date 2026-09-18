/**
 * MEDIMESH INDIA 2.0 — Provider-Neutral Authentication Boundary
 *
 * Establishes a clean interface for session retrieval and termination.
 * Decoupled from provider-specific APIs (Auth.js, Firebase, Supabase, etc.).
 *
 * NOTE: Development/demo sign-in and user-switching operations are isolated
 * to the development adapter and are NOT part of this production contract.
 */

export interface AuthUser {
  id: string;
  authIdentifier: string;
  displayName: string;
  preferredLanguage: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IAuthService {
  /**
   * Retrieves the current active session.
   * Returns isAuthenticated: false with user: null when logged out.
   */
  getCurrentSession(): Promise<AuthSession>;

  /**
   * Terminates the current session.
   */
  signOut(): Promise<void>;
}
