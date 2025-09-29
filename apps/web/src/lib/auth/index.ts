/**
 * Authentication utilities and types
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

/**
 * Mock authentication utilities - to be replaced with Clerk integration
 */
export function getAuthUser(): User | null {
  // This will be replaced with actual Clerk user data
  return null;
}

export function isAuthenticated(): boolean {
  // This will be replaced with actual Clerk authentication check
  return false;
}

/**
 * Authentication-related constants
 */
export const AUTH_ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  AUTH_ROUTES.SIGN_IN,
  AUTH_ROUTES.SIGN_UP,
] as const;