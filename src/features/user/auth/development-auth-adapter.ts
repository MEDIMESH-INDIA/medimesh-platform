/**
 * MEDIMESH INDIA 2.0 — Development Authentication Adapter
 *
 * DEVELOPMENT / DEMO / TESTING ONLY.
 *
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * 1. This adapter is strictly for local development, demo flows, and automated testing.
 * 2. It DOES NOT provide real authentication or production security claims.
 * 3. It uses solely unmistakably synthetic demo identities (Demo User 001, Demo User 002).
 * 4. Production deployment MUST replace this adapter with a real identity provider (e.g., Auth.js).
 */

import type { AuthUser, AuthSession, IAuthService } from './interfaces.ts';

/** Strictly synthetic demo user profiles */
export const SYNTHETIC_DEMO_USERS: Record<string, AuthUser> = {
  'user-demo-001': {
    id: 'user-demo-001',
    authIdentifier: 'auth-demo-001',
    displayName: 'Demo User 001',
    preferredLanguage: 'en',
  },
  'user-demo-002': {
    id: 'user-demo-002',
    authIdentifier: 'auth-demo-002',
    displayName: 'Demo User 002',
    preferredLanguage: 'en',
  },
};

const STORAGE_KEY = 'medimesh_demo_auth_user_id';

export class DevelopmentAuthAdapter implements IAuthService {
  private activeUserId: string | null = 'user-demo-001';

  constructor(initialUserId: string | null = 'user-demo-001') {
    this.activeUserId = initialUserId;
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          this.activeUserId = stored === 'GUEST' ? null : stored;
        }
      } catch {
        // Fallback to in-memory activeUserId
      }
    }
  }

  /**
   * Retrieves the current active session.
   */
  async getCurrentSession(): Promise<AuthSession> {
    if (!this.activeUserId || !SYNTHETIC_DEMO_USERS[this.activeUserId]) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    return {
      user: { ...SYNTHETIC_DEMO_USERS[this.activeUserId] },
      isAuthenticated: true,
      isLoading: false,
    };
  }

  /**
   * Terminates active session (transitions to guest mode).
   */
  async signOut(): Promise<void> {
    this.activeUserId = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, 'GUEST');
      } catch {
        // Storage unavailable
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Development / Demo / Test Operations (Isolated from production contract)
  // ---------------------------------------------------------------------------

  /**
   * Signs in a synthetic demo user (defaults to Demo User 001).
   * Development / Test only.
   */
  async signInDemoUser(userId: string = 'user-demo-001'): Promise<AuthSession> {
    if (!SYNTHETIC_DEMO_USERS[userId]) {
      throw new Error(`[DevelopmentAuthAdapter] Unknown synthetic demo user: ${userId}`);
    }

    this.activeUserId = userId;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, userId);
      } catch {
        // Storage unavailable
      }
    }

    return this.getCurrentSession();
  }

  /**
   * Switches the active synthetic demo user.
   * DEVELOPMENT/DEMO ONLY: Guarded to ensure it never becomes production behavior.
   */
  async switchDemoUser(userId: string): Promise<AuthSession> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[DevelopmentAuthAdapter] switchDemoUser is prohibited in production');
    }
    return this.signInDemoUser(userId);
  }

  /**
   * Explicitly enters guest mode (unauthenticated public browsing).
   */
  async setGuestMode(): Promise<AuthSession> {
    await this.signOut();
    return this.getCurrentSession();
  }
}

/** Singleton instance for shared client-side development state */
export const developmentAuth = new DevelopmentAuthAdapter();
