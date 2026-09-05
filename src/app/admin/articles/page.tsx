"use client";

import { useEffect, useState } from "react";
import AdminNav from "../../../components/AdminNav";
import { useRequireAdminAuth } from "../../../components/useRequireAdminAuth";
import { Article, ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS, deleteArticle, getAllArticles, reviewArticle, saveArticlePreview, updateArticle } from "../../../lib/articleService";

type EditValues = Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags">;

export default function AdminArticlesPage() {
  const admin = useRequireAdminAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<EditValues | null>(null);

  async function load() { setLoading(true); try { setArticles(await getAllArticles()); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);

  function startEdit(article: Article) {
    setEditing(article);
    setForm({ title: article.title, summary: article.summary, content: article.content, coverImageURL: article.coverImageURL, category: article.category, tags: article.tags });
  }

  async function saveEdit() {
    if (!editing?.id || !form) return;
    try { await updateArticle(editing.id, form); setEditing(null); setForm(null); await load(); } catch { alert("Unable to save this article."); }
  }

  async function moderate(id: string, status: "published" | "rejected") {
    try { await reviewArticle(id, status); await load(); } catch { alert("Unable to update this article."); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this article permanently?")) return;
    try { await deleteArticle(id); await load(); } catch { alert("Unable to delete this article."); }
  }

  function preview(article: Article) {
    saveArticlePreview(article);
    window.open("/Article?preview=1", "_blank", "noopener");
  }

  if (!admin) return null;
  return (
    <div className="min-h-screen bg-orange-50 px-4 pb-16 pt-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <div className="mb-8"><p className="text-xs font-black uppercase tracking-widest text-amber-700">Editorial workflow</p><h1 className="mt-2 text-4xl font-black text-zinc-950">Article moderation</h1><p className="mt-2 text-zinc-600">Preview, edit, approve, or reject member-submitted articles.</p></div>
        {editing && form && (
          <section className="mb-8 rounded-3xl border border-amber-300 bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-black text-zinc-950">Edit article</h2>
            <div className="mt-5 grid gap-4"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-zinc-300 px-4 py-3" placeholder="Title" /><textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="rounded-xl border border-zinc-300 px-4 py-3" rows={3} placeholder="Summary" /><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="rounded-xl border border-zinc-300 px-4 py-3" rows={12} placeholder="Article content" /><div className="grid gap-4 sm:grid-cols-2"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-zinc-300 px-4 py-3">{ARTICLE_CATEGORIES.map((category) => <option key={category} value={category}>{ARTICLE_CATEGORY_LABELS[category]}</option>)}</select><input value={form.tags.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} className="rounded-xl border border-zinc-300 px-4 py-3" placeholder="Tags" /></div><input value={form.coverImageURL} onChange={(e) => setForm({ ...form, coverImageURL: e.target.value })} className="rounded-xl border border-zinc-300 px-4 py-3" placeholder="Cover image URL" /></div>
            <div className="mt-5 flex gap-3"><button onClick={() => void saveEdit()} className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white">Save changes</button><button onClick={() => { setEditing(null); setForm(null); }} className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700">Cancel</button></div>
          </section>
        )}
        {loading ? <p className="py-12 text-zinc-600">Loading submissions…</p> : articles.length === 0 ? <p className="rounded-2xl bg-white p-8 text-zinc-600">No article submissions yet.</p> : <div className="space-y-4">{articles.map((article) => <article key={article.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">{article.status}</span><span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{ARTICLE_CATEGORY_LABELS[article.category]}</span></div><h2 className="mt-3 text-2xl font-black text-zinc-950">{article.title}</h2><p className="mt-2 text-zinc-600">{article.summary}</p><p className="mt-3 text-sm font-bold text-zinc-800">By {article.authorName}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{article.content}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button onClick={() => preview(article)} className="rounded-xl border border-amber-400 px-4 py-2 text-sm font-bold text-amber-800">Preview in Article UI</button><button onClick={() => startEdit(article)} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700">Edit</button>{article.status === "review" && <><button onClick={() => moderate(article.id!, "published")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Approve</button><button onClick={() => moderate(article.id!, "rejected")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">Reject</button></>}<button onClick={() => remove(article.id!)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Delete</button></div></div></article>)}</div>}
      </div>
    </div>
  );
}
