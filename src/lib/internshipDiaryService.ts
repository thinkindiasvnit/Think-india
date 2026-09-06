import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InternshipDiary {
  id?: string;
  name: string;
  college: string;
  institute: string;
  description: string;
  review: string;
  photoURL?: string;
  year?: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIARY_COLLECTION = "internshipDiaries";
const LOCAL_STORAGE_KEY = "think_india_internship_diaries";

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

/** Map a raw Firestore doc to a typed InternshipDiary */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDoc = (id: string, data: Record<string, any>): InternshipDiary => ({
  id,
  name: data.name ?? "",
  college: data.college ?? "",
  institute: data.institute ?? "",
  description: data.description ?? "",
  review: data.review ?? "",
  photoURL: data.photoURL ?? "",
  year: data.year ?? "2026",
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt),
});

// ─── LocalStorage fallback ────────────────────────────────────────────────────

const getLocalDiaries = (): InternshipDiary[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      // Default initial diaries if nothing exists (same as hardcoded originally)
      const defaultDiaries = [
        {
          id: "local_1",
          name: "Yug Shankhala",
          college: "SVNIT Surat",
          institute: "IIT Roorkee",
          description: "2nd Year, Civil Engineering",
          review: "I got to explore a bunch of new software and concepts, which helped me deepen my structural concepts. Also, it was fun exploring the campus, which made the experience more valuable.",
          year: "2026",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "local_2",
          name: "Samarth Mandage",
          college: "SVNIT Surat",
          institute: "IIT Bombay",
          description: "2nd Year, Chemical Engineering",
          review: "Had a fantastic experience. Getting to know different topics and doing something different from learning was fine experience. Plus the professor was so supportive. Credits to Think India",
          year: "2026",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "local_3",
          name: "Arpita",
          college: "SVNIT Surat",
          institute: "IIT Kharagpur",
          description: "2nd Year, Civil Engineering",
          review: "helped me strengthen my understanding of artificial intelligence and computer vision. Working on real-world research problems gave me practical exposure beyond classroom concepts and improved my problem-solving skills.",
          year: "2026",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "local_4",
          name: "Sneha Kumari",
          college: "SVNIT Surat",
          institute: "IIT Bombay",
          description: "2nd Year, Computer Science & Engineering",
          review: "I got to work on a project that was related to my field of interest. The professor was also very supportive and guided me throughout the project. Overall it was a great learning experience.",
          year: "2026",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDiaries));
      return defaultDiaries;
    }
    return JSON.parse(stored) as InternshipDiary[];
  } catch {
    return [];
  }
};

const saveLocalDiaries = (diaries: InternshipDiary[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  }
};

// ─── Read Operations ──────────────────────────────────────────────────────────

export const getInternshipDiaries = async (): Promise<InternshipDiary[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, DIARY_COLLECTION), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const diaries: InternshipDiary[] = [];
      snapshot.forEach((docSnap) => diaries.push(mapDoc(docSnap.id, docSnap.data())));
      return diaries;
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to LocalStorage:", error);
      return getLocalDiaries().sort((a, b) => 
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
    }
  }
  return getLocalDiaries().sort((a, b) => 
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
};

export const getInternshipDiaryById = async (id: string): Promise<InternshipDiary | null> => {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    try {
      const docSnap = await getDoc(doc(db, DIARY_COLLECTION, id));
      if (!docSnap.exists()) return null;
      return mapDoc(docSnap.id, docSnap.data());
    } catch (error) {
      console.warn("Firestore fetch failed:", error);
    }
  }
  return getLocalDiaries().find((d) => d.id === id) ?? null;
};

// ─── Write Operations ─────────────────────────────────────────────────────────

export const createInternshipDiary = async (
  data: Omit<InternshipDiary, "id" | "createdAt" | "updatedAt">
): Promise<InternshipDiary> => {
  const now = new Date().toISOString();
  const payload: InternshipDiary = { ...data, createdAt: now, updatedAt: now };

  if (isFirebaseConfigured()) {
    const docRef = await addDoc(collection(db, DIARY_COLLECTION), payload);
    return { ...payload, id: docRef.id };
  }

  // localStorage-only fallback (Firebase not configured at all)
  const diaries = getLocalDiaries();
  const local = { ...payload, id: `local_${Date.now()}` };
  diaries.push(local);
  saveLocalDiaries(diaries);
  return local;
};

export const updateInternshipDiary = async (
  id: string,
  data: Partial<Omit<InternshipDiary, "id" | "createdAt">>
): Promise<InternshipDiary> => {
  const now = new Date().toISOString();

  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    const docRef = doc(db, DIARY_COLLECTION, id);
    await updateDoc(docRef, { ...data, updatedAt: now });
    const snap = await getDoc(docRef);
    return mapDoc(snap.id, snap.data()!);
  }

  const diaries = getLocalDiaries();
  const idx = diaries.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error(`Diary ${id} not found.`);
  const updated = { ...diaries[idx], ...data, updatedAt: now };
  diaries[idx] = updated;
  saveLocalDiaries(diaries);
  return updated;
};

export const deleteInternshipDiary = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    await deleteDoc(doc(db, DIARY_COLLECTION, id));
    return;
  }
  saveLocalDiaries(getLocalDiaries().filter((d) => d.id !== id));
};
