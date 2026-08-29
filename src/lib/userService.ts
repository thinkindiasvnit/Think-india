import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { type User as FirebaseUser } from "firebase/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface AppUser {
  /** Firebase Auth UID — also used as the Firestore document ID */
  id: string;
  /** Roll number extracted from email, e.g. "U21CS001" */
  TLRollNo: string;
  /** College email, e.g. "u21cs001@__d.svnit.ac.in" */
  collegeEmail: string;
  /** Display name from Google profile */
  displayName: string;
  /** Photo URL from Google profile */
  photoURL: string;
  /** "user" (default) or "admin" (set via Firestore console) */
  role: UserRole;
  /** ISO timestamp — first login */
  createdAt: string;
  /** ISO timestamp — most recent login / profile update */
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const USERS_COLLECTION = "users";
const LS_KEY = "think_india_users";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function toISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}


export function extractRollNo(email: string): string {
  if (!email) return "";
  const prefix = email.split("@")[0] ?? "";
  return prefix.toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(id: string, data: Record<string, any>): AppUser {
  return {
    id,
    TLRollNo: data.TLRollNo ?? "",
    collegeEmail: data.collegeEmail ?? "",
    displayName: data.displayName ?? "",
    photoURL: data.photoURL ?? "",
    role: (data.role as UserRole) ?? "user",
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  };
}

// ─── LocalStorage Fallback ────────────────────────────────────────────────────

function lsRead(): AppUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(users: AppUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

// ─── Read Operations ──────────────────────────────────────────────────────────

/** Fetch a user by their Firebase Auth UID */
export async function getUserById(uid: string): Promise<AppUser | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (!snap.exists()) {
        // Check localStorage fallback
        return lsRead().find((u) => u.id === uid) ?? null;
      }
      return mapDoc(snap.id, snap.data());
    } catch (err) {
      console.warn("Firestore getUserById failed:", err);
    }
  }
  return lsRead().find((u) => u.id === uid) ?? null;
}

/** Fetch a user by their college email */
export async function getUserByEmail(email: string): Promise<AppUser | null> {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where("collegeEmail", "==", email.toLowerCase())
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        return lsRead().find((u) => u.collegeEmail === email.toLowerCase()) ?? null;
      }
      const d = snap.docs[0];
      return mapDoc(d.id, d.data());
    } catch (err) {
      console.warn("Firestore getUserByEmail failed:", err);
    }
  }
  return lsRead().find((u) => u.collegeEmail === email.toLowerCase()) ?? null;
}

/** Admin: Fetch all users */
export async function getAllUsers(): Promise<AppUser[]> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      const users: AppUser[] = [];
      snap.forEach((d) => users.push(mapDoc(d.id, d.data())));
      // Mirror to localStorage
      lsWrite(users);
      return users.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.warn("Firestore getAllUsers failed:", err);
    }
  }
  return lsRead().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Quick admin check */
export async function isAdmin(uid: string): Promise<boolean> {
  const user = await getUserById(uid);
  return user?.role === "admin";
}

// ─── Write Operations ─────────────────────────────────────────────────────────

/**
 * Upsert user from Firebase Auth profile.
 * - First login: creates user with role "user"
 * - Subsequent logins: updates displayName, photoURL, updatedAt
 * - NEVER overwrites `role` (admin must set it manually in Firestore)
 */
export async function getOrCreateUser(
  firebaseUser: FirebaseUser
): Promise<AppUser> {
  const uid = firebaseUser.uid;
  const email = (firebaseUser.email ?? "").toLowerCase();
  const now = new Date().toISOString();

  // Check if user already exists
  const existing = await getUserById(uid);

  if (existing) {
    // Update profile fields (don't touch role!)
    const updates: Partial<AppUser> = {
      displayName: firebaseUser.displayName ?? existing.displayName,
      photoURL: firebaseUser.photoURL ?? existing.photoURL,
      updatedAt: now,
    };

    if (isFirebaseConfigured()) {
      try {
        await setDoc(doc(db, USERS_COLLECTION, uid), updates, { merge: true });
      } catch (err) {
        console.warn("Firestore updateDoc failed:", err);
      }
    }

    // Update localStorage mirror
    const updated = { ...existing, ...updates };
    const list = lsRead();
    const idx = list.findIndex((u) => u.id === uid);
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    lsWrite(list);

    return updated;
  }

  // Create new user
  const newUser: AppUser = {
    id: uid,
    TLRollNo: extractRollNo(email),
    collegeEmail: email,
    displayName: firebaseUser.displayName ?? "",
    photoURL: firebaseUser.photoURL ?? "",
    role: "user", // Default role — admin must promote via Firestore console
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured()) {
    try {
      // Use setDoc with UID as doc ID so it's deterministic
      await setDoc(doc(db, USERS_COLLECTION, uid), newUser);
    } catch (err) {
      console.warn("Firestore setDoc failed:", err);
    }
  }

  // Mirror to localStorage
  const list = lsRead();
  list.push(newUser);
  lsWrite(list);

  return newUser;
}

/** Admin: Update a user's role */
export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<AppUser> {
  const now = new Date().toISOString();
  const updates = { role, updatedAt: now };

  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, USERS_COLLECTION, uid), updates);
    } catch (err) {
      console.warn("Firestore updateUserRole failed:", err);
    }
  }

  // Update localStorage
  const list = lsRead();
  const idx = list.findIndex((u) => u.id === uid);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    lsWrite(list);
    return list[idx];
  }

  // Fetch fresh from Firestore if not in localStorage
  const user = await getUserById(uid);
  if (!user) throw new Error(`User ${uid} not found`);
  return user;
}
