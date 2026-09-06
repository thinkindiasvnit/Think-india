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

export type AlbumCategory = "event" | "campus_life" | "trip" | "workshop" | "other";

export const ALBUM_CATEGORIES: AlbumCategory[] = [
  "event",
  "campus_life",
  "trip",
  "workshop",
  "other",
];

export const CATEGORY_LABELS: Record<AlbumCategory, string> = {
  event: "Event",
  campus_life: "Campus Life",
  trip: "Trip",
  workshop: "Workshop",
  other: "Other",
};

export interface Album {
  id?: string;
  title: string;
  description: string;
  coverImageURL: string;
  eventId: string | null;
  category: AlbumCategory;
  takenAt: string;       // ISO string
  createdBy: string;
  isPublished: boolean;
  imageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Photo {
  id?: string;
  imageURL: string;
  thumbnailURL: string;
  caption: string | null;
  uploadedBy: string;
  order: number;
  uploadedAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALBUMS_COL = "albums";
const ALBUMS_LOCAL_KEY = "think_india_albums";
const photosLocalKey = (albumId: string) => `think_india_photos_${albumId}`;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAlbum = (id: string, d: Record<string, any>): Album => ({
  id,
  title: d.title ?? "",
  description: d.description ?? "",
  coverImageURL: d.coverImageURL ?? "",
  eventId: d.eventId ?? null,
  category: (d.category as AlbumCategory) ?? "other",
  takenAt: toISO(d.takenAt),
  createdBy: d.createdBy ?? "",
  isPublished: d.isPublished ?? false,
  imageCount: d.imageCount ?? 0,
  createdAt: toISO(d.createdAt),
  updatedAt: toISO(d.updatedAt),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPhoto = (id: string, d: Record<string, any>): Photo => ({
  id,
  imageURL: d.imageURL ?? "",
  thumbnailURL: d.thumbnailURL ?? d.imageURL ?? "",
  caption: d.caption ?? null,
  uploadedBy: d.uploadedBy ?? "",
  order: d.order ?? 0,
  uploadedAt: toISO(d.uploadedAt),
});

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const getLocalAlbums = (): Album[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ALBUMS_LOCAL_KEY) ?? "[]"); } catch { return []; }
};
const saveLocalAlbums = (a: Album[]) => {
  if (typeof window !== "undefined") localStorage.setItem(ALBUMS_LOCAL_KEY, JSON.stringify(a));
};
const getLocalPhotos = (albumId: string): Photo[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(photosLocalKey(albumId)) ?? "[]"); } catch { return []; }
};
const saveLocalPhotos = (albumId: string, p: Photo[]) => {
  if (typeof window !== "undefined") localStorage.setItem(photosLocalKey(albumId), JSON.stringify(p));
};

// ─── Albums — Public ─────────────────────────────────────────────────────────

/** Fetch only published albums (public-facing). Optionally filter by category. */
export const getPublishedAlbums = async (category?: AlbumCategory): Promise<Album[]> => {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(
        query(collection(db, ALBUMS_COL), where("isPublished", "==", true))
      );
      const albums: Album[] = [];
      snap.forEach((d) => albums.push(mapAlbum(d.id, d.data())));
      const filtered = category ? albums.filter((a) => a.category === category) : albums;
      return filtered.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
    } catch (err) {
      console.warn("Firestore fetch failed:", err);
    }
  }
  return getLocalAlbums()
    .filter((a) => a.isPublished && (!category || a.category === category))
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
};

export const getAlbumById = async (albumId: string): Promise<Album | null> => {
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    try {
      const snap = await getDoc(doc(db, ALBUMS_COL, albumId));
      if (!snap.exists()) return null;
      return mapAlbum(snap.id, snap.data());
    } catch (err) {
      console.warn("Firestore fetch failed:", err);
    }
  }
  return getLocalAlbums().find((a) => a.id === albumId) ?? null;
};

/** Fetch all albums regardless of publish status (admin use). */
export const getAllAlbums = async (): Promise<Album[]> => {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDocs(collection(db, ALBUMS_COL));
      const albums: Album[] = [];
      snap.forEach((d) => albums.push(mapAlbum(d.id, d.data())));
      return albums.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
    } catch (err) {
      console.warn("Firestore fetch failed:", err);
    }
  }
  return getLocalAlbums().sort((a, b) => b.takenAt.localeCompare(a.takenAt));
};

export const createAlbum = async (
  data: Omit<Album, "id" | "createdAt" | "updatedAt" | "imageCount">
): Promise<Album> => {
  const now = new Date().toISOString();
  const payload: Album = { ...data, imageCount: 0, createdAt: now, updatedAt: now };
  if (isFirebaseConfigured()) {
    const ref = await addDoc(collection(db, ALBUMS_COL), payload);
    return { ...payload, id: ref.id };
  }
  const local = { ...payload, id: `local_${Date.now()}` };
  const albums = getLocalAlbums();
  albums.push(local);
  saveLocalAlbums(albums);
  return local;
};

export const updateAlbum = async (
  albumId: string,
  data: Partial<Omit<Album, "id" | "createdAt">>
): Promise<Album> => {
  const now = new Date().toISOString();
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    const ref = doc(db, ALBUMS_COL, albumId);
    await updateDoc(ref, { ...data, updatedAt: now });
    const snap = await getDoc(ref);
    return mapAlbum(snap.id, snap.data()!);
  }
  const albums = getLocalAlbums();
  const idx = albums.findIndex((a) => a.id === albumId);
  if (idx === -1) throw new Error(`Album ${albumId} not found`);
  const updated = { ...albums[idx], ...data, updatedAt: now };
  albums[idx] = updated;
  saveLocalAlbums(albums);
  return updated;
};

export const deleteAlbum = async (albumId: string): Promise<void> => {
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    const photosSnap = await getDocs(collection(db, ALBUMS_COL, albumId, "photos"));
    await Promise.all(photosSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, ALBUMS_COL, albumId));
    return;
  }
  if (typeof window !== "undefined") localStorage.removeItem(photosLocalKey(albumId));
  saveLocalAlbums(getLocalAlbums().filter((a) => a.id !== albumId));
};

// ─── Photos (Subcollection) ───────────────────────────────────────────────────

export const getPhotos = async (albumId: string): Promise<Photo[]> => {
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    try {
      const snap = await getDocs(collection(db, ALBUMS_COL, albumId, "photos"));
      const photos: Photo[] = [];
      snap.forEach((d) => photos.push(mapPhoto(d.id, d.data())));
      return photos.sort((a, b) => a.order - b.order);
    } catch (err) {
      console.warn("Firestore fetch failed:", err);
    }
  }
  return getLocalPhotos(albumId).sort((a, b) => a.order - b.order);
};

export const addPhoto = async (
  albumId: string,
  photoData: Omit<Photo, "id" | "uploadedAt">
): Promise<Photo> => {
  const now = new Date().toISOString();
  const payload: Photo = { ...photoData, uploadedAt: now };

  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    const photosCol = collection(db, ALBUMS_COL, albumId, "photos");
    const ref = await addDoc(photosCol, payload);
    const newCount = (await getDocs(photosCol)).size;
    await updateDoc(doc(db, ALBUMS_COL, albumId), { imageCount: newCount, updatedAt: now });
    return { ...payload, id: ref.id };
  }

  const photos = getLocalPhotos(albumId);
  const local = { ...payload, id: `photo_${Date.now()}_${Math.random()}` };
  photos.push(local);
  saveLocalPhotos(albumId, photos);
  const albums = getLocalAlbums();
  const idx = albums.findIndex((a) => a.id === albumId);
  if (idx !== -1) { albums[idx].imageCount = photos.length; saveLocalAlbums(albums); }
  return local;
};

export const deletePhoto = async (albumId: string, photoId: string): Promise<void> => {
  const now = new Date().toISOString();
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    await deleteDoc(doc(db, ALBUMS_COL, albumId, "photos", photoId));
    const photosCol = collection(db, ALBUMS_COL, albumId, "photos");
    const newCount = (await getDocs(photosCol)).size;
    await updateDoc(doc(db, ALBUMS_COL, albumId), { imageCount: newCount, updatedAt: now });
    return;
  }
  const photos = getLocalPhotos(albumId).filter((p) => p.id !== photoId);
  saveLocalPhotos(albumId, photos);
  const albums = getLocalAlbums();
  const idx = albums.findIndex((a) => a.id === albumId);
  if (idx !== -1) { albums[idx].imageCount = photos.length; saveLocalAlbums(albums); }
};

export const updatePhotoCaption = async (
  albumId: string,
  photoId: string,
  caption: string
): Promise<void> => {
  if (isFirebaseConfigured() && !albumId.startsWith("local_")) {
    await updateDoc(doc(db, ALBUMS_COL, albumId, "photos", photoId), { caption });
    return;
  }
  const photos = getLocalPhotos(albumId);
  const idx = photos.findIndex((p) => p.id === photoId);
  if (idx !== -1) { photos[idx].caption = caption; saveLocalPhotos(albumId, photos); }
};
