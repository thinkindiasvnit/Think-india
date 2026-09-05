"use client";

import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ALLOWED_DOMAIN = "svnit.ac.in";

function normalizedSvnitEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error(`Please use your @${ALLOWED_DOMAIN} email address.`);
  }
  return normalized;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, normalizedSvnitEmail(email), password);
      },
      async signUp(name, email, password) {
        const credential = await createUserWithEmailAndPassword(auth, normalizedSvnitEmail(email), password);
        await updateProfile(credential.user, { displayName: name.trim() });
      },
      logOut: () => signOut(auth),
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
