import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

export interface ContactQuery {
  id?: string;
  name: string;
  email: string;
  query: string;
  status: "pending" | "resolved";
  createdAt: string;
}

const COLLECTION_NAME = "contact_queries";
const LOCAL_STORAGE_KEY = "think_india_queries";

const isFirebaseConfigured = (): boolean =>
  !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "undefined"
  );

const getLocalQueries = (): ContactQuery[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ContactQuery[];
  } catch {
    return [];
  }
};

const saveLocalQueries = (queries: ContactQuery[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queries));
  }
};

export async function addQuery(data: Omit<ContactQuery, "id" | "status" | "createdAt">): Promise<string> {
  const newQuery: ContactQuery = {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newQuery);
      return docRef.id;
    } catch (error) {
      console.warn("Firestore add failed, falling back to LocalStorage:", error);
    }
  }

  // LocalStorage Fallback
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const stored = getLocalQueries();
  stored.push({ ...newQuery, id });
  saveLocalQueries(stored);
  return id;
}

export async function getQueries(): Promise<ContactQuery[]> {
  if (isFirebaseConfigured()) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const queries: ContactQuery[] = [];
      querySnapshot.forEach((docSnap) => {
        queries.push({ id: docSnap.id, ...docSnap.data() } as ContactQuery);
      });
      return queries;
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to LocalStorage:", error);
    }
  }

  // LocalStorage Fallback
  const stored = getLocalQueries();
  return stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateQueryStatus(id: string, status: "pending" | "resolved"): Promise<void> {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { status });
      return;
    } catch (error) {
      console.warn("Firestore update failed, falling back to LocalStorage:", error);
    }
  }

  // LocalStorage Fallback
  const stored = getLocalQueries();
  const idx = stored.findIndex((q) => q.id === id);
  if (idx !== -1) {
    stored[idx].status = status;
    saveLocalQueries(stored);
  }
}

export async function deleteQuery(id: string): Promise<void> {
  if (isFirebaseConfigured() && !id.startsWith("local_")) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      console.warn("Firestore delete failed, falling back to LocalStorage:", error);
    }
  }

  // LocalStorage Fallback
  const stored = getLocalQueries();
  saveLocalQueries(stored.filter((q) => q.id !== id));
}
