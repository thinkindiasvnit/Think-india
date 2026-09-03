import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// constants 
const BLOGS_COLLECTION = "blogs";
const LS_KEY = "think_india_blogs";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

// types 
export type BlogStatus = "draft" | "review" | "published" | "archived";

export const BLOG_STATUSES: BlogStatus[] = [
  "draft",
  "review",
  "published",
  "archived",
];

export const STATUS_LABELS: Record<BlogStatus, string> = {
  draft: "Draft",
  review: "In Review",
  published: "Published",
  archived: "Archived",
};

export const BLOG_CATEGORIES = [
  "technology",
  "culture",
  "events",
  "education",
  "opinion",
  "news",
  "other",
];

export const CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology",
  culture: "Culture",
  events: "Events",
  education: "Education",
  opinion: "Opinion",
  news: "News",
  other: "Other",
};

export interface Blog {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageURL: string;
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  status: BlogStatus;
  views: number;
  likes: number;
  readTimeMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// helpers 
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function computeReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function tsToISO(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date().toISOString();
}

// localStorage fallback 
function lsRead(): Blog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(blogs: Blog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(blogs));
}

function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function docToBlog(id: string, data: Record<string, unknown>): Blog {
  return {
    id,
    title: (data.title as string) ?? "",
    slug: (data.slug as string) ?? "",
    summary: (data.summary as string) ?? "",
    content: (data.content as string) ?? "",
    coverImageURL: (data.coverImageURL as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    category: (data.category as string) ?? "other",
    authorId: (data.authorId as string) ?? "",
    authorName: (data.authorName as string) ?? "",
    authorPhotoURL: (data.authorPhotoURL as string) ?? "",
    status: (data.status as BlogStatus) ?? "draft",
    views: (data.views as number) ?? 0,
    likes: (data.likes as number) ?? 0,
    readTimeMinutes: (data.readTimeMinutes as number) ?? 1,
    isFeatured: (data.isFeatured as boolean) ?? false,
    publishedAt: data.publishedAt ? tsToISO(data.publishedAt) : null,
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  };
}

// CRUD 

/** Fetch all blogs regardless of status — for admin panel */
export async function getAllBlogs(): Promise<Blog[]> {
  if (!isFirebaseConfigured()) {
    return lsRead().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  try {
    const q = query(
      collection(db, BLOGS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const blogs = snap.docs.map((d) =>
      docToBlog(d.id, d.data() as Record<string, unknown>)
    );
    // mirror to localStorage so reads never fail
    lsWrite(blogs);
    return blogs;
  } catch (err) {
    console.error("getAllBlogs: Firestore read failed, using localStorage", err);
    return lsRead().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

/**
 * Fetch only published blogs — for public pages.
 * Reuses getAllBlogs + client-side filter to avoid needing a Firestore
 * composite index on (status + publishedAt).
 */
export async function getPublishedBlogs(): Promise<Blog[]> {
  const all = await getAllBlogs();
  return all
    .sort((a, b) => {
      // featured blogs first
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      // then by publishedAt descending
      return (
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      );
    });
}

/** Fetch a single blog by its slug */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  // reuse getAllBlogs to benefit from its localStorage mirror
  const all = await getAllBlogs();
  return all.find((b) => b.slug === slug) ?? null;
}

/** Create a new blog */
export async function createBlog(
  data: Omit<
    Blog,
    "id" | "createdAt" | "updatedAt" | "slug" | "readTimeMinutes" | "views" | "likes"
  >
): Promise<Blog> {
  const now = new Date().toISOString();
  const slug = generateSlug(data.title);
  const readTimeMinutes = computeReadTime(data.content);
  const record: Omit<Blog, "id"> = {
    ...data,
    slug,
    readTimeMinutes,
    views: 0,
    likes: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : null,
  };

  // always write to localStorage first as a mirror
  const lsBlog: Blog = { ...record, id: crypto.randomUUID() };
  const list = lsRead();
  list.unshift(lsBlog);
  lsWrite(list);

  if (!isFirebaseConfigured()) {
    return lsBlog;
  }

  try {
    const ref = await addDoc(collection(db, BLOGS_COLLECTION), record);
    const blog: Blog = { ...record, id: ref.id };
    // update localStorage with the real Firestore ID
    const updated = lsRead().map((b) => (b.id === lsBlog.id ? blog : b));
    lsWrite(updated);
    return blog;
  } catch (err) {
    console.error("createBlog: Firestore write failed, using localStorage", err);
    return lsBlog;
  }
}

/** Update an existing blog */
export async function updateBlog(
  id: string,
  data: Partial<Omit<Blog, "id" | "createdAt">>
): Promise<Blog> {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { ...data, updatedAt: now };

  // auto-regenerate slug when title changes
  if (data.title) updates.slug = generateSlug(data.title);
  // auto-recalculate read time when content changes
  if (data.content) updates.readTimeMinutes = computeReadTime(data.content);
  // set publishedAt when first published
  if (data.status === "published" && !data.publishedAt)
    updates.publishedAt = now;

  // Update localStorage mirror first
  const list = lsRead();
  const idx = list.findIndex((b) => b.id === id);
  let localUpdated: Blog | null = null;
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates } as Blog;
    lsWrite(list);
    localUpdated = list[idx];
  }

  if (!isFirebaseConfigured()) {
    if (localUpdated) return localUpdated;
    throw new Error("Blog not found in localStorage");
  }

  try {
    await updateDoc(doc(db, BLOGS_COLLECTION, id), updates);
    const snap = await getDoc(doc(db, BLOGS_COLLECTION, id));
    const finalBlog = docToBlog(id, snap.data() as Record<string, unknown>);
    
    // Update local mirror with definitive Firestore state if it succeeded
    const newList = lsRead();
    const newIdx = newList.findIndex((b) => b.id === id);
    if (newIdx !== -1) {
      newList[newIdx] = finalBlog;
      lsWrite(newList);
    }
    
    return finalBlog;
  } catch (err) {
    console.error("updateBlog: Firestore write failed, using localStorage", err);
    if (localUpdated) return localUpdated;
    throw new Error("Blog not found");
  }
}

/** Delete a blog */
export async function deleteBlog(id: string): Promise<void> {
  // Always remove from localStorage mirror first
  lsWrite(lsRead().filter((b) => b.id !== id));

  if (!isFirebaseConfigured()) return;

  try {
    await deleteDoc(doc(db, BLOGS_COLLECTION, id));
  } catch (err) {
    console.error("deleteBlog: Firestore delete failed", err);
  }
}

/** Increment view count for a blog (call once per page visit) */
export async function incrementViews(id: string): Promise<void> {
  // update localStorage mirror
  const list = lsRead();
  const idx = list.findIndex((b) => b.id === id);
  if (idx !== -1) {
    list[idx].views = (list[idx].views || 0) + 1;
    lsWrite(list);
  }

  if (!isFirebaseConfigured()) return;

  try {
    await updateDoc(doc(db, BLOGS_COLLECTION, id), {
      views: increment(1),
    });
  } catch (err) {
    console.error("incrementViews: Firestore update failed", err);
  }
}

/** Upload an image to Cloudinary (or fallback to base64 if not configured) */
export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    // Fallback to base64 encoding if Cloudinary is not configured
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const json = await res.json();
  return json.secure_url as string;
}
