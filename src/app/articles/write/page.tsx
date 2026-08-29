"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/AuthProvider";
import {
  createArticle,
  uploadArticleImage,
  ARTICLE_CATEGORIES,
  CATEGORY_LABELS,
} from "../../../lib/articleService";

export default function WriteArticlePage() {
  const { user, isAuthenticated, loading: authLoading, signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: ARTICLE_CATEGORIES[0],
    tagsText: "",
    coverImageURL: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Redirect to home if not logged in after auth finishes loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Show login prompt instead of harsh redirect
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-screen">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-glow-radial-light bg-amber-grid-pattern-light p-4">
        <div className="card-orange-glass-light bg-white/95 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl border border-amber-300">
          <svg className="w-16 h-16 text-amber-600 mx-auto mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <h2 className="text-2xl font-black text-slate-900 font-heading mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 font-semibold mb-8">
            You must be logged in with your SVNIT email to write and submit articles.
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 rounded-full font-bold bg-amber-600 text-white shadow-md hover:bg-amber-700 transition-all"
          >
            Sign In with Google
          </button>
          <Link href="/articles" className="inline-block mt-4 text-xs font-bold text-slate-500 hover:text-amber-700">
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadArticleImage(file);
      set("coverImageURL", url);
    } catch {
      alert("Cover image upload failed.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Title and content are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const tags = form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await createArticle({
        title: form.title,
        summary: form.summary,
        content: form.content,
        category: form.category,
        tags,
        coverImageURL: form.coverImageURL,
        status: "pending",
        authorId: user!.id,
        authorName: user!.displayName,
        authorEmail: user!.collegeEmail,
        authorPhotoURL: user!.photoURL,
        authorRollNo: user!.TLRollNo,
      });
      
      // Redirect to author dashboard after submission
      router.push("/articles/my");
    } catch (err) {
      console.error(err);
      alert("Failed to submit article.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">
              Write an Article
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Share your insights with the Think India SVNIT community.
            </p>
          </div>
          <Link
            href="/articles"
            className="text-sm font-bold text-slate-500 hover:text-amber-700 bg-white/50 px-4 py-2 rounded-full border border-amber-200"
          >
            Cancel
          </Link>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="card-orange-glass-light bg-white/95 rounded-3xl p-8 border border-amber-300 shadow-xl space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="A catchy title for your article"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">
              Short Summary
            </label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="A brief 1-2 sentence description"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">
                Tags
              </label>
              <input
                type="text"
                value={form.tagsText}
                onChange={(e) => set("tagsText", e.target.value)}
                placeholder="tech, research, events (comma separated)"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">
              Cover Image
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="px-5 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm font-bold hover:bg-amber-100 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {coverUploading ? "Uploading…" : "Upload Image"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <input
                type="text"
                value={form.coverImageURL}
                onChange={(e) => set("coverImageURL", e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1 px-4 py-3 rounded-xl border border-amber-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 shadow-sm"
              />
            </div>
            {form.coverImageURL && (
              <div className="mt-4 relative w-full h-48 rounded-xl overflow-hidden border-2 border-amber-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImageURL}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => set("coverImageURL", "")}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-sm text-white text-sm font-bold flex items-center justify-center hover:bg-rose-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-black text-amber-900 uppercase tracking-widest">
                Article Content *
              </label>
              <span className="text-xs font-semibold text-slate-500">Supports Markdown</span>
            </div>
            <textarea
              required
              rows={12}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write your article here..."
              className="w-full px-4 py-4 rounded-xl border border-amber-200 bg-white text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm resize-y"
            />
          </div>

          {/* Submit */}
          <div className="pt-6 mt-6 border-t border-amber-200 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 max-w-sm">
              By submitting, your article will be sent to the admin team for review before publishing.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !form.title || !form.content}
              className="px-8 py-3.5 rounded-full text-sm font-extrabold bg-amber-600 text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
