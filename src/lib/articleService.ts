import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
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
}

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
  };
}

export async function submitArticle(
  input: Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags">,
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
  changes: Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags">
): Promise<void> {
  await updateDoc(doc(db, ARTICLES_COLLECTION, id), changes);
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
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
