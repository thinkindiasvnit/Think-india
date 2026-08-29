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
  where,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Constants ────────────────────────────────────────────────────────────────

const ARTICLES_COLLECTION = "articles";
const LS_KEY = "think_india_articles";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "archived";

export const ARTICLE_STATUSES: ArticleStatus[] = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "archived",
];

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  pending: "Pending Review",
  approved: "Approved & Published",
  rejected: "Rejected",
  archived: "Archived",
};

export const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: "bg-zinc-200 text-zinc-800",
  pending: "bg-amber-200 text-amber-900",
  approved: "bg-emerald-200 text-emerald-900",
  rejected: "bg-rose-200 text-rose-900",
  archived: "bg-slate-200 text-slate-800",
};

export const ARTICLE_CATEGORIES = [
  "technology",
  "culture",
  "events",
  "education",
  "opinion",
  "research",
  "campus_life",
  "career",
  "news",
  "other",
];

export const CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology",
  culture: "Culture",
  events: "Events",
  education: "Education",
  opinion: "Opinion",
  research: "Research",
  campus_life: "Campus Life",
  career: "Career",
  news: "News",
  other: "Other",
};

export interface Article {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageURL: string;
  tags: string[];
  category: string;
  /** Firebase Auth UID of the author */
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorPhotoURL: string;
  /** Roll number from user profile */
  authorRollNo: string;
  /** Moderation status */
  status: ArticleStatus;
  /** Admin's reason for rejection (shown to author) */
  rejectionReason: string | null;
  /** Firebase UID of the admin who reviewed */
  reviewedBy: string | null;
  /** Name of the admin who reviewed */
  reviewedByName: string | null;
  /** When the review decision was made */
  reviewedAt: string | null;
  /** Metrics */
  views: number;
  likes: number;
  readTimeMinutes: number;
  isFeatured: boolean;
  /** Set when status becomes "approved" */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function docToArticle(id: string, data: Record<string, unknown>): Article {
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
    authorEmail: (data.authorEmail as string) ?? "",
    authorPhotoURL: (data.authorPhotoURL as string) ?? "",
    authorRollNo: (data.authorRollNo as string) ?? "",
    status: (data.status as ArticleStatus) ?? "draft",
    rejectionReason: (data.rejectionReason as string) ?? null,
    reviewedBy: (data.reviewedBy as string) ?? null,
    reviewedByName: (data.reviewedByName as string) ?? null,
    reviewedAt: data.reviewedAt ? tsToISO(data.reviewedAt) : null,
    views: (data.views as number) ?? 0,
    likes: (data.likes as number) ?? 0,
    readTimeMinutes: (data.readTimeMinutes as number) ?? 1,
    isFeatured: (data.isFeatured as boolean) ?? false,
    publishedAt: data.publishedAt ? tsToISO(data.publishedAt) : null,
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  };
}

// ─── LocalStorage Fallback ────────────────────────────────────────────────────

function lsRead(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(articles: Article[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(articles));
}

// ─── Read Operations ──────────────────────────────────────────────────────────

/** Admin: Fetch all articles regardless of status */
export async function getAllArticles(): Promise<Article[]> {
  if (!isFirebaseConfigured()) {
    return lsRead().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION)
    );
    const snap = await getDocs(q);
    const articles = snap.docs.map((d) =>
      docToArticle(d.id, d.data() as Record<string, unknown>)
    );
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // Mirror to localStorage
    lsWrite(articles);
    return articles;
  } catch (err) {
    console.error("getAllArticles: Firestore read failed, using localStorage", err);
    return lsRead().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

/** Public: Fetch only approved (published) articles */
export async function getApprovedArticles(): Promise<Article[]> {
  if (!isFirebaseConfigured()) {
    return lsRead()
      .filter((a) => a.status === "approved")
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return (
          new Date(b.publishedAt || b.createdAt).getTime() -
          new Date(a.publishedAt || a.createdAt).getTime()
        );
      });
  }
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where("status", "==", "approved")
    );
    const snap = await getDocs(q);
    const articles = snap.docs.map((d) =>
      docToArticle(d.id, d.data() as Record<string, unknown>)
    );
    return articles.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      );
    });
  } catch (err) {
    console.error("getApprovedArticles: Firestore read failed", err);
    return lsRead()
      .filter((a) => a.status === "approved")
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return (
          new Date(b.publishedAt || b.createdAt).getTime() -
          new Date(a.publishedAt || a.createdAt).getTime()
        );
      });
  }
}

/** Admin: Fetch articles pending review */
export async function getPendingArticles(): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.status === "pending");
}

/** Authenticated user: Fetch all articles by a specific author */
export async function getArticlesByAuthor(
  authorId: string
): Promise<Article[]> {
  if (!isFirebaseConfigured()) {
    return lsRead()
      .filter((a) => a.authorId === authorId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where("authorId", "==", authorId)
    );
    const snap = await getDocs(q);
    const articles = snap.docs.map((d) =>
      docToArticle(d.id, d.data() as Record<string, unknown>)
    );
    return articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("getArticlesByAuthor: Firestore read failed", err);
    return lsRead()
      .filter((a) => a.authorId === authorId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

/** Public: Fetch a single article by its slug */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // Reuse getAllArticles to benefit from localStorage mirror
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

/** Fetch a single article by its Firestore document ID */
export async function getArticleById(id: string): Promise<Article | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDoc(doc(db, ARTICLES_COLLECTION, id));
      if (!snap.exists()) {
        return lsRead().find((a) => a.id === id) ?? null;
      }
      return docToArticle(snap.id, snap.data() as Record<string, unknown>);
    } catch (err) {
      console.warn("getArticleById: Firestore read failed", err);
    }
  }
  return lsRead().find((a) => a.id === id) ?? null;
}

// ─── Write Operations ─────────────────────────────────────────────────────────

/** Create a new article (by authenticated user) */
export async function createArticle(
  data: Omit<
    Article,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "slug"
    | "readTimeMinutes"
    | "views"
    | "likes"
    | "reviewedBy"
    | "reviewedByName"
    | "reviewedAt"
    | "publishedAt"
    | "rejectionReason"
    | "isFeatured"
  >
): Promise<Article> {
  const now = new Date().toISOString();
  const slug = generateSlug(data.title);
  const readTimeMinutes = computeReadTime(data.content);

  const record: Omit<Article, "id"> = {
    ...data,
    slug,
    readTimeMinutes,
    views: 0,
    likes: 0,
    isFeatured: false,
    rejectionReason: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  // Always write to localStorage first as a mirror
  const lsArticle: Article = { ...record, id: crypto.randomUUID() };
  const list = lsRead();
  list.unshift(lsArticle);
  lsWrite(list);

  if (!isFirebaseConfigured()) {
    return lsArticle;
  }

  try {
    const ref = await addDoc(collection(db, ARTICLES_COLLECTION), record);
    const article: Article = { ...record, id: ref.id };
    // Update localStorage with the real Firestore ID
    const updated = lsRead().map((a) => (a.id === lsArticle.id ? article : a));
    lsWrite(updated);
    return article;
  } catch (err) {
    console.error("createArticle: Firestore write failed, using localStorage", err);
    return lsArticle;
  }
}

/** Update an existing article (by author or admin) */
export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article> {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { ...data, updatedAt: now };

  // Auto-regenerate slug when title changes
  if (data.title) updates.slug = generateSlug(data.title);
  // Auto-recalculate read time when content changes
  if (data.content) updates.readTimeMinutes = computeReadTime(data.content);

  // Update localStorage mirror first
  const list = lsRead();
  const idx = list.findIndex((a) => a.id === id);
  let localUpdated: Article | null = null;
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates } as Article;
    lsWrite(list);
    localUpdated = list[idx];
  }

  if (!isFirebaseConfigured()) {
    if (localUpdated) return localUpdated;
    throw new Error("Article not found in localStorage");
  }

  try {
    await updateDoc(doc(db, ARTICLES_COLLECTION, id), updates);
    const snap = await getDoc(doc(db, ARTICLES_COLLECTION, id));
    const finalArticle = docToArticle(
      id,
      snap.data() as Record<string, unknown>
    );

    // Update local mirror with definitive Firestore state
    const newList = lsRead();
    const newIdx = newList.findIndex((a) => a.id === id);
    if (newIdx !== -1) {
      newList[newIdx] = finalArticle;
      lsWrite(newList);
    }

    return finalArticle;
  } catch (err) {
    console.error("updateArticle: Firestore write failed, using localStorage", err);
    if (localUpdated) return localUpdated;
    throw new Error("Article not found");
  }
}

/** Delete an article (by author or admin) */
export async function deleteArticle(id: string): Promise<void> {
  // Remove from localStorage mirror first
  lsWrite(lsRead().filter((a) => a.id !== id));

  if (!isFirebaseConfigured()) return;

  try {
    await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
  } catch (err) {
    console.error("deleteArticle: Firestore delete failed", err);
  }
}

// ─── Approval Workflow ────────────────────────────────────────────────────────

/**
 * Author submits their article for admin review.
 * Status: draft → pending
 */
export async function submitForReview(id: string): Promise<Article> {
  return updateArticle(id, {
    status: "pending",
    rejectionReason: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
  });
}

/**
 * Admin approves an article.
 * Status: pending → approved
 * Sets publishedAt timestamp.
 */
export async function approveArticle(
  id: string,
  adminUid: string,
  adminName: string
): Promise<Article> {
  const now = new Date().toISOString();
  return updateArticle(id, {
    status: "approved",
    rejectionReason: null,
    reviewedBy: adminUid,
    reviewedByName: adminName,
    reviewedAt: now,
    publishedAt: now,
  });
}

/**
 * Admin rejects an article with a reason.
 * Status: pending → rejected
 * Author can see the reason and edit/resubmit.
 */
export async function rejectArticle(
  id: string,
  adminUid: string,
  adminName: string,
  reason: string
): Promise<Article> {
  const now = new Date().toISOString();
  return updateArticle(id, {
    status: "rejected",
    rejectionReason: reason || "No reason provided",
    reviewedBy: adminUid,
    reviewedByName: adminName,
    reviewedAt: now,
  });
}

/**
 * Admin archives an article.
 * Status: approved → archived
 */
export async function archiveArticle(id: string): Promise<Article> {
  return updateArticle(id, { status: "archived" });
}

/**
 * Author resubmits a rejected article after edits.
 * Status: rejected → pending
 * Clears previous rejection data.
 */
export async function resubmitArticle(id: string): Promise<Article> {
  return updateArticle(id, {
    status: "pending",
    rejectionReason: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
  });
}

/** Admin toggles featured status */
export async function featureArticle(
  id: string,
  isFeatured: boolean
): Promise<Article> {
  return updateArticle(id, { isFeatured });
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

/** Increment view count for an article (call once per page visit) */
export async function incrementArticleViews(id: string): Promise<void> {
  // Update localStorage mirror
  const list = lsRead();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx].views = (list[idx].views || 0) + 1;
    lsWrite(list);
  }

  if (!isFirebaseConfigured()) return;

  try {
    await updateDoc(doc(db, ARTICLES_COLLECTION, id), {
      views: increment(1),
    });
  } catch (err) {
    console.error("incrementArticleViews: Firestore update failed", err);
  }
}

/** Increment like count for an article */
export async function incrementArticleLikes(id: string): Promise<void> {
  // Update localStorage mirror
  const list = lsRead();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx].likes = (list[idx].likes || 0) + 1;
    lsWrite(list);
  }

  if (!isFirebaseConfigured()) return;

  try {
    await updateDoc(doc(db, ARTICLES_COLLECTION, id), {
      likes: increment(1),
    });
  } catch (err) {
    console.error("incrementArticleLikes: Firestore update failed", err);
  }
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

/** Upload an image to Cloudinary (for article cover/content images) */
export async function uploadArticleImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Article image upload failed");
  const json = await res.json();
  return json.secure_url as string;
}


