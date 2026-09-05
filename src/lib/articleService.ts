import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const ARTICLES_COLLECTION = "articles";
const PREVIEW_KEY = "ti_article_preview";

export type ArticleStatus = "review" | "published" | "rejected";

export const ARTICLE_CATEGORIES = ["technology", "culture", "education", "opinion", "news", "other"];
export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology", culture: "Culture", education: "Education", opinion: "Opinion", news: "News", other: "Other",
};

export interface Article {
  id?: string;
  title: string;
  summary: string;
  content: string;
  coverImageURL: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  status: ArticleStatus;
  createdAt: string;
  reviewedAt: string | null;
  editionId?: string;
}

export interface NewspaperPage {
  id: number;
  label: string;
  headline: string;
  deck: string;
  dropCapLetter: string;
  dropCapRest: string;
  paragraphs: string[];
  pullQuote: { text: string; attribution: string };
  photo: string;
  photoAlt: string;
  imageCaption: string;
  columns: { title: string; body: string }[];
  authorName?: string;
}

export interface NewspaperEdition {
  id: string;
  title: string;
  editionName: string;
  volume: string;
  date: string;
  price: string;
  tagline: string;
  description: string;
  coverStoryHeadline: string;
  coverStoryDeck: string;
  coverPhoto: string;
  status: "published" | "draft";
  createdAt: string;
  pages: NewspaperPage[];
}

export const DEFAULT_EDITIONS: NewspaperEdition[] = [];

function toArticle(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    title: (data.title as string) || "",
    summary: (data.summary as string) || "",
    content: (data.content as string) || "",
    coverImageURL: (data.coverImageURL as string) || "",
    category: (data.category as string) || "other",
    tags: (data.tags as string[]) || [],
    authorId: (data.authorId as string) || "",
    authorName: (data.authorName as string) || "Member",
    authorPhotoURL: (data.authorPhotoURL as string) || "",
    status: (data.status as ArticleStatus) || "review",
    createdAt: (data.createdAt as string) || new Date().toISOString(),
    reviewedAt: (data.reviewedAt as string | null) || null,
    editionId: (data.editionId as string | undefined) || undefined,
  };
}

export async function submitArticle(
  input: Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags"> & { editionId?: string },
  author: Pick<Article, "authorId" | "authorName" | "authorPhotoURL">
): Promise<Article> {
  const record: Omit<Article, "id"> = { ...input, ...author, status: "review", createdAt: new Date().toISOString(), reviewedAt: null };
  const ref = await addDoc(collection(db, ARTICLES_COLLECTION), record);
  return { id: ref.id, ...record };
}

export async function getPublishedArticles(): Promise<Article[]> {
  const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), where("status", "==", "published")));
  return snapshot.docs.map((item) => toArticle(item.id, item.data() as Record<string, unknown>)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedArticle(id: string): Promise<Article | null> {
  const snapshot = await getDoc(doc(db, ARTICLES_COLLECTION, id));
  if (!snapshot.exists()) return null;
  const article = toArticle(snapshot.id, snapshot.data() as Record<string, unknown>);
  return article.status === "published" ? article : null;
}

export async function getAllArticles(): Promise<Article[]> {
  const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => toArticle(item.id, item.data() as Record<string, unknown>));
}

export async function reviewArticle(id: string, status: "published" | "rejected"): Promise<void> {
  await updateDoc(doc(db, ARTICLES_COLLECTION, id), { status, reviewedAt: new Date().toISOString() });
}

export async function updateArticle(
  id: string,
  changes: Partial<Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags" | "editionId">>
): Promise<void> {
  await updateDoc(doc(db, ARTICLES_COLLECTION, id), changes);
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
}

const EDITIONS_COLLECTION = "newspaper_editions";
const DELETED_EDITIONS_KEY = "ti_deleted_newspaper_editions";

export async function getNewspaperEditions(): Promise<NewspaperEdition[]> {
  try {
    const snapshot = await getDocs(query(collection(db, EDITIONS_COLLECTION)));
    const custom = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      return {
        id: docSnap.id,
        title: (data.title as string) || "Untitled Edition",
        editionName: (data.editionName as string) || "CAMPUS EDITION",
        volume: (data.volume as string) || "VOL. 1",
        date: (data.date as string) || new Date().toLocaleDateString(),
        price: (data.price as string) || "FREE",
        tagline: (data.tagline as string) || "IDEAS THAT INSPIRE. ACTION THAT TRANSFORMS.",
        description: (data.description as string) || "",
        coverStoryHeadline: (data.coverStoryHeadline as string) || "",
        coverStoryDeck: (data.coverStoryDeck as string) || "",
        coverPhoto: (data.coverPhoto as string) || "",
        status: (data.status as "published" | "draft") || "published",
        createdAt: (data.createdAt as string) || new Date().toISOString(),
        pages: (data.pages as NewspaperPage[]) || [],
      };
    });

    const deletedIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem(DELETED_EDITIONS_KEY) || "[]") as string[];
        stored.forEach((item) => deletedIds.add(item));
      } catch {}
    }
    try {
      const deletedSnap = await getDocs(collection(db, "deleted_newspaper_editions"));
      deletedSnap.docs.forEach((d) => deletedIds.add(d.id));
    } catch {}

    return custom.filter((e) => !deletedIds.has(e.id));
  } catch (err) {
    console.warn("Unable to fetch newspaper editions from Firestore", err);
    return [];
  }
}

export async function createNewspaperEdition(
  input: Omit<NewspaperEdition, "id" | "createdAt">
): Promise<NewspaperEdition> {
  const record = {
    ...input,
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, EDITIONS_COLLECTION), record);
  return { id: ref.id, ...record };
}

export async function deleteNewspaperEdition(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EDITIONS_COLLECTION, id));
  } catch {}
  try {
    await setDoc(doc(db, "deleted_newspaper_editions", id), {
      deletedAt: new Date().toISOString(),
    });
  } catch {}
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(DELETED_EDITIONS_KEY) || "[]") as string[];
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem(DELETED_EDITIONS_KEY, JSON.stringify(stored));
      }
    } catch {}
  }
}

export async function getUserArticles(authorId: string): Promise<Article[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, ARTICLES_COLLECTION), where("authorId", "==", authorId))
    );
    return snapshot.docs
      .map((item) => toArticle(item.id, item.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.warn("Unable to fetch user articles", err);
    return [];
  }
}

/** Stores a local, admin-only preview used by the existing /Article presentation UI. */
export function saveArticlePreview(article: Article): void {
  if (typeof window !== "undefined") localStorage.setItem(PREVIEW_KEY, JSON.stringify(article));
}

export function getArticlePreview(): Article | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? (JSON.parse(raw) as Article) : null;
  } catch {
    return null;
  }
}
