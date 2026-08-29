"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { type AppUser } from "../lib/userService";
import {
  signInWithGoogle,
  signOutUser,
  onAuthChange,
} from "../lib/authService";

// ─── Context Types ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The full AppUser profile from Firestore/localStorage */
  user: AppUser | null;
  /** Raw Firebase Auth user (includes token, etc.) */
  firebaseUser: FirebaseUser | null;
  /** True while auth state is being determined on mount */
  loading: boolean;
  /** Convenience: true if user?.role === "admin" */
  isAdmin: boolean;
  /** True if any user is signed in */
  isAuthenticated: boolean;
  /** Trigger Google sign-in popup (validates SVNIT email domain) */
  signIn: () => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Last auth error message (e.g. domain restriction) */
  error: string | null;
  /** Clear the error */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
});

// ─── Provider Component ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((appUser, fbUser) => {
      setUser(appUser);
      setFirebaseUser(fbUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      const appUser = await signInWithGoogle();
      setUser(appUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(message);
      console.error("Auth sign-in error:", err);
      // Show the popup to the user!
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error("Auth sign-out error:", err);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
    signIn,
    signOut,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access the auth context from any client component.
 *
 * @example
 * const { user, isAdmin, signIn, signOut } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

export default AuthProvider;
