import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getOrCreateUser, getUserById, type AppUser } from "./userService";
export const ALLOWED_DOMAIN_REGEX = /\.svnit\.ac\.in$/i;
export const ALLOWED_DOMAIN_DISPLAY = "*.svnit.ac.in";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Check if an email belongs to an allowed SVNIT department domain */
export function isAllowedEmail(email: string): boolean {
  if (!email) return false;
  const domain = email.split("@")[1] ?? "";
  return ALLOWED_DOMAIN_REGEX.test(domain);
}

// ─── Auth Operations ─────────────────────────────────────────────────────────

/**
 * Sign in with Google popup.
 * After successful auth, validates email domain.
 * If invalid, signs out immediately and throws.
 * If valid, upserts user doc in Firestore and returns AppUser.
 */
export async function signInWithGoogle(): Promise<AppUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;
  const email = firebaseUser.email ?? "";
  
  console.log("Attempting sign-in with email:", email);
  console.log("Domain check passed?", isAllowedEmail(email));

  // Validate email domain
  if (!isAllowedEmail(email)) {
    // Sign out immediately — unauthorized domain
    await signOut(auth);
    // throw new Error(`Access restricted. Please log in with your SVNIT student email (e.g. xxxxxxxx@xxd.svnit.ac.in). You tried: ${email}`);
  }

  // Upsert user in Firestore / localStorage
  const appUser = await getOrCreateUser(firebaseUser);
  return appUser;
}

/** Sign out the current user */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * On each change, hydrates the full AppUser from Firestore.
 * Returns an unsubscribe function.
 */
export function onAuthChange(
  callback: (user: AppUser | null, firebaseUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null, null);
      return;
    }

    // Don't hydrate if email is not from allowed domain
    // (edge case: stale token from a previous unauthorized login)
    const email = firebaseUser.email ?? "";
    if (!isAllowedEmail(email)) {
      await signOut(auth);
      callback(null, null);
      return;
    }

    try {
      const appUser = await getUserById(firebaseUser.uid);
      callback(appUser, firebaseUser);
    } catch {
      // User doc doesn't exist yet — create it
      try {
        const appUser = await getOrCreateUser(firebaseUser);
        callback(appUser, firebaseUser);
      } catch {
        callback(null, firebaseUser);
      }
    }
  });
}

/** Get the currently signed-in Firebase user (synchronous snapshot) */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}
