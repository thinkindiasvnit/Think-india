import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  name: string;
  email: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_COLLECTION = "admin";
const SESSION_KEY = "ti_admin_session";

// ─── Session helpers (sessionStorage — cleared on tab/browser close) ──────────

export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminSession(user: AdminUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Checks the Firestore `admin` collection for a matching email + password.
 * Returns the admin user on success, throws on failure.
 *
 * NOTE: Passwords are stored as plain text per project requirements.
 * Consider hashing (bcrypt) before going to production.
 */
const ALLOWED_DOMAIN = "svnit.ac.in";

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminUser> {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  // Domain check — only @svnit.ac.in addresses are permitted
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1];
  if (domain !== ALLOWED_DOMAIN) {
    throw new Error(`Access restricted to @${ALLOWED_DOMAIN} email addresses only.`);
  }

  const q = query(
    collection(db, ADMIN_COLLECTION),
    where("email", "==", normalizedEmail),
    where("password", "==", password)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Invalid email or password.");
  }

  const data = snap.docs[0].data();
  const user: AdminUser = {
    name: (data.name as string) ?? "Admin",
    email: (data.email as string) ?? normalizedEmail,
  };

  setAdminSession(user);
  return user;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logoutAdmin(): void {
  clearAdminSession();
}
