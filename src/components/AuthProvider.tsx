"use client";

import {
  User,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ALLOWED_DOMAIN = "svnit.ac.in";
const MAX_LOGIN_ATTEMPTS = 3;
const SESSION_DURATION_MS = 3 * 60 * 60 * 1000;
const SESSION_EXPIRY_KEY = "ti_user_session_expires_at";
const ATTEMPTS_KEY = "ti_login_attempts";

type LoginAttempt = { count: number; lockedUntil: number | null };

function normalizedSvnitEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error(`Please use your @${ALLOWED_DOMAIN} email address.`);
  }
  return normalized;
}

async function ensureUserProfile(user: User): Promise<void> {
  const profileRef = doc(db, "users", user.uid);
  const existing = await getDoc(profileRef);
  if (existing.exists()) return;
  await setDoc(profileRef, {
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "Member",
    email: user.email || "",
    createdAt: serverTimestamp(),
  });
}

function readAttempts(email: string): LoginAttempt {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null };
  try {
    const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "{}") as Record<string, LoginAttempt>;
    const result = attempts[email] || { count: 0, lockedUntil: null };
    if (result.lockedUntil && result.lockedUntil <= Date.now()) return { count: 0, lockedUntil: null };
    return result;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function writeAttempts(email: string, value: LoginAttempt | null): void {
  if (typeof window === "undefined") return;
  try {
    const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "{}") as Record<string, LoginAttempt>;
    if (value) attempts[email] = value;
    else delete attempts[email];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // Login may continue even when browser storage is unavailable.
  }
}

function recordFailedAttempt(email: string): boolean {
  const current = readAttempts(email);
  const count = current.count + 1;
  const isLocked = count >= MAX_LOGIN_ATTEMPTS;
  writeAttempts(email, {
    count,
    lockedUntil: isLocked ? Date.now() + SESSION_DURATION_MS : null,
  });
  return isLocked;
}

function startUserSession(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
  }
}

function getSessionExpiry(): number | null {
  if (typeof window === "undefined") return null;
  const value = Number(localStorage.getItem(SESSION_EXPIRY_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        const expiry = getSessionExpiry();
        if (expiry && expiry <= Date.now()) {
          localStorage.removeItem(SESSION_EXPIRY_KEY);
          await signOut(auth);
          return;
        }
        if (!expiry) startUserSession();
      }
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const expiresAt = getSessionExpiry();
    if (!expiresAt) return;
    const timeout = window.setTimeout(() => {
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      void signOut(auth);
    }, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(email, password) {
        const normalizedEmail = normalizedSvnitEmail(email);
        const attempts = readAttempts(normalizedEmail);
        if (attempts.lockedUntil) {
          throw new Error("Too many failed attempts. Try again after 3 hours.");
        }
        await setPersistence(auth, browserLocalPersistence);
        let credential;
        try {
          credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (error) {
          if (recordFailedAttempt(normalizedEmail)) {
            throw new Error("Too many failed attempts. Try again after 3 hours.");
          }
          throw error;
        }
        writeAttempts(normalizedEmail, null);
        startUserSession();
        await ensureUserProfile(credential.user);
      },
      async signUp(name, email, password) {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await createUserWithEmailAndPassword(auth, normalizedSvnitEmail(email), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        startUserSession();
        await ensureUserProfile(credential.user);
      },
      async logOut() {
        if (typeof window !== "undefined") localStorage.removeItem(SESSION_EXPIRY_KEY);
        await signOut(auth);
      },
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
