import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Designation = "Core" | "Cell Head";

export interface SocialLinks {
  linkedin: string;
  email: string;
}

export interface TeamMember {
  id?: string;
  userId: string | null;
  name: string;
  photoURL: string;
  /** Broad category — used to group members on the page */
  designation: Designation;
  /** Specific role title — e.g. "Technical Head", "President" */
  description?: string;
  position: string;
  /** Display order within their designation group (1, 2, 3…) */
  teamOrder: number;
  /** Display order of the designation section on the page */
  overallOrder: number;
  sessionYear: string;    // e.g. "2024-25"
  isCurrent: boolean;     // managed by admin — not shown in form
  socialLinks: SocialLinks;
  createdAt?: string;     // ISO string
  updatedAt?: string;     // ISO string
}

export interface TeamGroup {
  designation: Designation;
  overallOrder: number;
  members: TeamMember[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_COLLECTION = "team";
const LOCAL_STORAGE_KEY = "think_india_team";
export const DESIGNATIONS: Designation[] = ["Core", "Cell Head"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isFirebaseConfigured = (): boolean =>
  !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "undefined"
  );

const toISO = (val: unknown): string => {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return "";
};

/** Map a raw Firestore doc to a typed TeamMember */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDoc = (id: string, data: Record<string, any>): TeamMember => ({
  id,
  userId: data.userId ?? null,
  name: data.name ?? "",
  photoURL: data.photoURL ?? "",
  designation: (data.designation as Designation) ?? "Core",
  position: data.position ?? data.teamName ?? "",  // graceful fallback for old data
  teamOrder: data.teamOrder ?? 0,
  overallOrder: data.overallOrder ?? 0,
  sessionYear: data.sessionYear ?? "",
  isCurrent: data.isCurrent ?? true,
  socialLinks: {
    linkedin: data.socialLinks?.linkedin ?? "",
    email: data.socialLinks?.email ?? "",
  },
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt),
});

// ─── LocalStorage fallback ────────────────────────────────────────────────────

const getLocalMembers = (): TeamMember[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as TeamMember[];
  } catch {
    return [];
  }
};

const saveLocalMembers = (members: TeamMember[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  }
};

// ─── Read Operations ──────────────────────────────────────────────────────────

/**
 * Fetch team members for a given sessionYear (or isCurrent=true if no year given).
 * Sorted client-side to avoid requiring Firestore composite indexes.
 */
export const getTeamMembers = async (sessionYear?: string): Promise<TeamMember[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = sessionYear
        ? query(collection(db, TEAM_COLLECTION), where("sessionYear", "==", sessionYear))
        : query(collection(db, TEAM_COLLECTION), where("isCurrent", "==", true));

      const snapshot = await getDocs(q);
      const members: TeamMember[] = [];
      snapshot.forEach((docSnap) => members.push(mapDoc(docSnap.id, docSnap.data())));
      return sortMembers(members);
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to LocalStorage:", error);
      return getLocalFallback(sessionYear);
    }
  }
  return getLocalFallback(sessionYear);
};

const sortMembers = (members: TeamMember[]) =>
  members.sort((a, b) =>
    a.overallOrder !== b.overallOrder
      ? a.overallOrder - b.overallOrder
      : a.teamOrder - b.teamOrder
  );

const getLocalFallback = (sessionYear?: string): TeamMember[] => {
  const all = getLocalMembers();
  const filtered = sessionYear
    ? all.filter((m) => m.sessionYear === sessionYear)
    : all.filter((m) => m.isCurrent);
  return sortMembers(filtered);
};

/**
 * Returns all unique sessionYear values sorted descending (newest first).
 * index[0] is always the default/most-recent year to display.
 */
export const getSessionYears = async (): Promise<string[]> => {
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(db, TEAM_COLLECTION));
      const yearSet = new Set<string>();
      snapshot.forEach((docSnap) => {
        const sy = docSnap.data().sessionYear as string | undefined;
        if (sy) yearSet.add(sy);
      });
      return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
    } catch (error) {
      console.warn("Firestore fetch failed:", error);
    }
  }
  const yearSet = new Set(getLocalMembers().map((m) => m.sessionYear).filter(Boolean));
  return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
};

/** Fetch ALL members across all years (used by admin table). */
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(db, TEAM_COLLECTION));
      const members: TeamMember[] = [];
      snapshot.forEach((docSnap) => members.push(mapDoc(docSnap.id, docSnap.data())));
      return members.sort((a, b) =>
        a.sessionYear !== b.sessionYear
          ? b.sessionYear.localeCompare(a.sessionYear)
          : a.overallOrder !== b.overallOrder
          ? a.overallOrder - b.overallOrder
          : a.teamOrder - b.teamOrder
      );
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to LocalStorage:", error);
    }
  }
  return getLocalMembers();
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    try {
      const docSnap = await getDoc(doc(db, TEAM_COLLECTION, id));
      if (!docSnap.exists()) return null;
      return mapDoc(docSnap.id, docSnap.data());
    } catch (error) {
      console.warn("Firestore fetch failed:", error);
    }
  }
  return getLocalMembers().find((m) => m.id === id) ?? null;
};

// ─── Write Operations ─────────────────────────────────────────────────────────

export const createTeamMember = async (
  data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">
): Promise<TeamMember> => {
  const now = new Date().toISOString();
  const payload: TeamMember = { ...data, createdAt: now, updatedAt: now };

  if (isFirebaseConfigured()) {
    const docRef = await addDoc(collection(db, TEAM_COLLECTION), payload);
    return { ...payload, id: docRef.id };
  }

  const members = getLocalMembers();
  const local = { ...payload, id: `local_${Date.now()}` };
  members.push(local);
  saveLocalMembers(members);
  return local;
};

export const updateTeamMember = async (
  id: string,
  data: Partial<Omit<TeamMember, "id" | "createdAt">>
): Promise<TeamMember> => {
  const now = new Date().toISOString();

  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    const docRef = doc(db, TEAM_COLLECTION, id);
    await updateDoc(docRef, { ...data, updatedAt: now });
    const snap = await getDoc(docRef);
    return mapDoc(snap.id, snap.data()!);
  }

  const members = getLocalMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Member ${id} not found.`);
  const updated = { ...members[idx], ...data, updatedAt: now };
  members[idx] = updated;
  saveLocalMembers(members);
  return updated;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    await deleteDoc(doc(db, TEAM_COLLECTION, id));
    return;
  }
  saveLocalMembers(getLocalMembers().filter((m) => m.id !== id));
};

// ─── Grouping Utility ─────────────────────────────────────────────────────────

/**
 * Groups members by `designation` ("Core" | "Cell Head").
 * "Core" always appears first, then "Cell Head".
 * Within each group members are sorted by overallOrder → teamOrder.
 */
export const groupMembersByTeam = (members: TeamMember[]): TeamGroup[] => {
  const map = new Map<Designation, TeamGroup>();

  for (const m of members) {
    if (!map.has(m.designation)) {
      map.set(m.designation, {
        designation: m.designation,
        overallOrder: m.overallOrder,
        members: [],
      });
    }
    map.get(m.designation)!.members.push(m);
  }

  for (const group of map.values()) {
    group.members.sort((a, b) =>
      a.overallOrder !== b.overallOrder ? a.overallOrder - b.overallOrder : a.teamOrder - b.teamOrder
    );
  }

  // Enforce Core → Cell Head order
  const ORDER: Designation[] = ["Core", "Cell Head"];
  return Array.from(map.values()).sort(
    (a, b) => ORDER.indexOf(a.designation) - ORDER.indexOf(b.designation)
  );
};
