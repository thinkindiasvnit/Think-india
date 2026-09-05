"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS, submitArticle } from "../../lib/articleService";

export default function SubmitArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/submit-article");
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setMessage("");
    try {
      await submitArticle(
        { title: title.trim(), summary: summary.trim(), content: content.trim(), coverImageURL: coverImageURL.trim(), category, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) },
        { authorId: user.uid, authorName: user.displayName || user.email?.split("@")[0] || "Member", authorPhotoURL: user.photoURL || "" }
      );
      setMessage("Your article has been submitted for review. It will appear publicly after approval.");
      setTitle(""); setSummary(""); setContent(""); setTags(""); setCoverImageURL("");
    } catch {
      setMessage("We could not submit your article. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return <div className="min-h-screen pt-36 text-center text-zinc-600">Checking your account…</div>;

  return (
    <section className="min-h-screen pt-36 pb-16 px-4 bg-orange-50">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-white p-6 sm:p-10 shadow-xl space-y-5">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Member contribution</p><h1 className="mt-2 text-3xl font-black text-zinc-950">Submit an article</h1><p className="mt-2 text-sm text-zinc-600">Your submission will be reviewed by the Think India admin team before it is published.</p></div>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        <textarea required value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" rows={3} className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your article…" rows={14} className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        <div className="grid gap-4 sm:grid-cols-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-zinc-300 px-4 py-3">{ARTICLE_CATEGORIES.map((item) => <option key={item} value={item}>{ARTICLE_CATEGORY_LABELS[item]}</option>)}</select><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, separated by commas" className="rounded-xl border border-zinc-300 px-4 py-3" /></div>
        <input type="url" value={coverImageURL} onChange={(e) => setCoverImageURL(e.target.value)} placeholder="Cover image URL (optional)" className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        {message && <p className={`rounded-xl p-3 text-sm font-medium ${message.startsWith("Your") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{message}</p>}
        <button disabled={submitting} className="rounded-xl bg-amber-600 px-6 py-3 font-bold text-white disabled:opacity-60">{submitting ? "Submitting…" : "Submit for review"}</button>
      </form>
    </section>
  );
}
