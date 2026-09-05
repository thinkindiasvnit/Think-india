"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import {
  Article,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  DEFAULT_EDITIONS,
  getNewspaperEditions,
  getUserArticles,
  NewspaperEdition,
  submitArticle,
} from "../../lib/articleService";
import {
  PenSquare,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Eye,
  X,
  RefreshCw,
  Library,
} from "lucide-react";

export default function SubmitArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"submit" | "my-articles">("submit");
  const [editions, setEditions] = useState<NewspaperEdition[]>(DEFAULT_EDITIONS);
  const [selectedEditionId, setSelectedEditionId] = useState<string>("edition-1");

  // Write Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // User articles state
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/submit-article");
  }, [loading, router, user]);

  // Read URL tab query parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "my-articles") {
        setActiveTab("my-articles");
      }
    }
  }, []);

  // Fetch editions
  useEffect(() => {
    getNewspaperEditions()
      .then((loaded) => {
        if (loaded && loaded.length > 0) {
          setEditions(loaded);
          setSelectedEditionId(loaded[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Load user's articles
  const loadUserSubmissions = async (uid: string) => {
    setLoadingArticles(true);
    try {
      const list = await getUserArticles(uid);
      setUserArticles(list);
    } catch (err) {
      console.error("Error loading user articles", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      void loadUserSubmissions(user.uid);
    }
  }, [user?.uid]);

  const switchTab = (tab: "submit" | "my-articles") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "my-articles") {
        url.searchParams.set("tab", "my-articles");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setMessage("");
    try {
      await submitArticle(
        {
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          coverImageURL: coverImageURL.trim(),
          category,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          editionId: selectedEditionId,
        },
        {
          authorId: user.uid,
          authorName: user.displayName || user.email?.split("@")[0] || "Member",
          authorPhotoURL: user.photoURL || "",
        }
      );
      setMessage("Your article has been submitted for editorial review. It will appear in the newspaper after approval.");
      setTitle("");
      setSummary("");
      setContent("");
      setTags("");
      setCoverImageURL("");
      if (user.uid) {
        void loadUserSubmissions(user.uid);
      }
    } catch {
      setMessage("We could not submit your article. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f2ea] text-zinc-600">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <p className="mt-3 font-serif text-sm">Verifying SVNIT student authentication…</p>
        </div>
      </div>
    );
  }

  const reviewCount = userArticles.filter((a) => a.status === "review").length;
  const publishedCount = userArticles.filter((a) => a.status === "published").length;
  const rejectedCount = userArticles.filter((a) => a.status === "rejected").length;

  return (
    <section className="min-h-screen bg-[#f7f2ea] px-4 pb-20 pt-36">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb & Newsstand Quick Link */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/Article"
            className="inline-flex items-center gap-2 rounded-full border border-[#1a1209]/20 bg-[#f4ede2] px-4 py-1.5 font-mono text-xs font-bold text-[#1a1209] transition-all hover:border-[#1a1209] hover:shadow-sm"
          >
            <Library size={13} />
            <span>← Open Newspaper Stand</span>
          </Link>
          <div className="font-mono text-xs text-zinc-500">
            LOGGED IN AS: <span className="font-bold text-zinc-800">{user.email}</span>
          </div>
        </div>

        {/* ── Tabs Selector ── */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-amber-300/80 bg-amber-100/70 p-1.5 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => switchTab("submit")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "submit"
                  ? "bg-[#1a1209] text-[#f5ecdf] shadow-md"
                  : "text-amber-950 hover:bg-amber-200/50"
              }`}
            >
              <PenSquare size={16} />
              <span>Write Dispatch</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab("my-articles")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "my-articles"
                  ? "bg-[#1a1209] text-[#f5ecdf] shadow-md"
                  : "text-amber-950 hover:bg-amber-200/50"
              }`}
            >
              <FileText size={16} />
              <span>My Submissions & Status</span>
              {userArticles.length > 0 && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-black ${
                    activeTab === "my-articles"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-800 text-amber-100"
                  }`}
                >
                  {userArticles.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── TAB 1: Write & Submit Article Form ── */}
        {activeTab === "submit" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-10"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                Think India SVNIT Publication Desk
              </p>
              <h1 className="mt-2 font-serif text-3xl font-black text-zinc-950">
                Submit an Article to IKIGAI
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Your dispatch will be typeset and reviewed by the editorial board before appearing in the newspaper.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Article Headline</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Accelerating Clean Energy: Gujarat's Solar Innovation"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 font-serif text-lg font-bold text-zinc-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Short Summary / Deck</label>
              <textarea
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A compelling 1-2 sentence lead summarising the key thesis of your dispatch…"
                rows={2}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Manuscript Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your full article manuscript here (paragraphs, insights, recommendations)…"
                rows={12}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm leading-relaxed text-zinc-800"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Target Newspaper</label>
                <select
                  value={selectedEditionId}
                  onChange={(e) => setSelectedEditionId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold"
                >
                  {editions.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.volume}: {ed.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                >
                  {ARTICLE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {ARTICLE_CATEGORY_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Tags (comma separated)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="policy, youth, tech"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Cover Image URL (optional)</label>
              <input
                type="url"
                value={coverImageURL}
                onChange={(e) => setCoverImageURL(e.target.value)}
                placeholder="https://images.unsplash.com/…"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
              />
            </div>

            {message && (
              <div
                className={`rounded-2xl p-4 text-sm font-medium ${
                  message.startsWith("Your")
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border border-red-300 bg-red-50 text-red-700"
                }`}
              >
                <p>{message}</p>
                {message.startsWith("Your") && (
                  <button
                    type="button"
                    onClick={() => switchTab("my-articles")}
                    className="mt-2 inline-flex items-center gap-1.5 font-bold text-emerald-800 underline hover:text-emerald-950"
                  >
                    <span>Check manuscript review status in My Submissions</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                disabled={submitting}
                className="rounded-xl bg-amber-600 px-7 py-3 font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
              >
                {submitting ? "Submitting to Editorial Board…" : "Submit Dispatch for Review"}
              </button>

              <button
                type="button"
                onClick={() => switchTab("my-articles")}
                className="text-center text-sm font-semibold text-amber-900 hover:underline"
              >
                View your {userArticles.length} submitted article{userArticles.length === 1 ? "" : "s"} →
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 2: My Submitted Articles & Status Tracker ── */}
        {activeTab === "my-articles" && (
          <div className="space-y-6">
            {/* Header & Status Summary Bar */}
            <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-serif text-2xl font-black text-zinc-950 sm:text-3xl">
                    My Submissions & Status
                  </h1>
                  <p className="mt-1 text-sm text-zinc-600">
                    Track the editorial review lifecycle of your articles submitted to Think India SVNIT.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => user?.uid && void loadUserSubmissions(user.uid)}
                    disabled={loadingArticles}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                    title="Refresh submissions"
                  >
                    <RefreshCw size={14} className={loadingArticles ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => switchTab("submit")}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                  >
                    <PenSquare size={14} />
                    <span>Write New</span>
                  </button>
                </div>
              </div>

              {/* Status tally cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total</p>
                  <p className="mt-1 font-serif text-2xl font-black text-zinc-900">{userArticles.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700">Under Review</p>
                  <p className="mt-1 font-serif text-2xl font-black text-amber-800">{reviewCount}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">Published</p>
                  <p className="mt-1 font-serif text-2xl font-black text-emerald-800">{publishedCount}</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-700">Declined</p>
                  <p className="mt-1 font-serif text-2xl font-black text-red-800">{rejectedCount}</p>
                </div>
              </div>
            </div>

            {/* List of Submissions */}
            {loadingArticles ? (
              <div className="rounded-3xl border border-amber-200 bg-white p-12 text-center text-zinc-500">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <p className="mt-3 font-serif text-sm">Fetching your submitted dispatches…</p>
              </div>
            ) : userArticles.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/70 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <PenSquare size={28} />
                </div>
                <h3 className="mt-4 font-serif text-xl font-black text-zinc-950">
                  No Articles Submitted Yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
                  You have not submitted any manuscripts under this SVNIT account yet. Write an article on policy, technology, student research, or campus life to be featured in the next edition.
                </p>
                <button
                  onClick={() => switchTab("submit")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a1209] px-6 py-3 text-sm font-bold text-[#f5ecdf] shadow-md hover:bg-amber-950"
                >
                  <PenSquare size={16} />
                  <span>Write Your First Article</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userArticles.map((article) => {
                  const targetEdition = editions.find((e) => e.id === article.editionId);
                  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={article.id}
                      className="rounded-3xl border border-amber-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Top Meta & Status Pill */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                            {ARTICLE_CATEGORY_LABELS[article.category] || article.category}
                          </span>
                          <span className="font-mono text-xs text-zinc-500">
                            Submitted on {formattedDate}
                          </span>
                          {targetEdition && (
                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-bold text-amber-900">
                              Target: {targetEdition.volume} · {targetEdition.title}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        {article.status === "review" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                            <Clock size={14} className="text-amber-600" />
                            <span>Under Editorial Review</span>
                          </span>
                        )}

                        {article.status === "published" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Approved & Published</span>
                          </span>
                        )}

                        {article.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold text-red-800">
                            <XCircle size={14} className="text-red-600" />
                            <span>Declined / Revisions</span>
                          </span>
                        )}
                      </div>

                      {/* Headline & Deck */}
                      <div className="mt-4">
                        <h2 className="font-serif text-xl font-bold text-zinc-950 sm:text-2xl">
                          {article.title}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>

                      {/* Status explanation & actions */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                        <div className="text-xs text-zinc-500">
                          {article.status === "review" && (
                            <p className="italic text-amber-800">
                              ⏳ Manuscript is queued with the student editorial board. You will be notified once reviewed.
                            </p>
                          )}
                          {article.status === "published" && (
                            <p className="font-semibold text-emerald-700">
                              ✓ Live in print! Readers can turn to your article in the newspaper stand.
                            </p>
                          )}
                          {article.status === "rejected" && (
                            <p className="text-red-700">
                              ✕ This manuscript was declined for this issue. You may revise and submit an updated angle.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReadingArticle(article)}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-100"
                          >
                            <Eye size={14} />
                            <span>Read Manuscript</span>
                          </button>

                          {article.status === "published" && (
                            <a
                              href={`/Article?edition=${article.editionId || "edition-1"}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-xl bg-[#1a1209] px-4 py-2 text-xs font-bold text-[#f5ecdf] hover:bg-amber-950"
                            >
                              <BookOpen size={14} />
                              <span>View in Newspaper →</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Manuscript Read Modal ── */}
        {readingArticle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setReadingArticle(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#1a1209] bg-[#f4ede2] p-6 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-[#1a1209] pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1a1209]">
                  MANUSCRIPT PREVIEW
                </span>
                <button
                  onClick={() => setReadingArticle(null)}
                  className="rounded-full p-1 text-[#1a1209] hover:bg-black/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 font-serif">
                <div className="text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-800">
                    {ARTICLE_CATEGORY_LABELS[readingArticle.category] || readingArticle.category}
                  </span>
                  <h2 className="mt-2 text-2xl font-black text-[#1a1209] sm:text-3xl">
                    {readingArticle.title}
                  </h2>
                  <p className="mt-2 font-serif italic text-zinc-700">
                    {readingArticle.summary}
                  </p>
                  <p className="mt-2 font-mono text-xs font-bold tracking-wider text-zinc-600">
                    BY {readingArticle.authorName.toUpperCase()}
                  </p>
                </div>

                <div className="my-6 border-b border-t border-[#1a1209] py-1 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  STATUS: {readingArticle.status.toUpperCase()} · TARGET: {readingArticle.editionId || "EDITION-1"}
                </div>

                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
                  {readingArticle.content}
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-[#1a1209] pt-4">
                  {readingArticle.status === "published" && (
                    <a
                      href={`/Article?edition=${readingArticle.editionId || "edition-1"}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-[#1a1209] px-4 py-2 text-xs font-bold text-[#f4ede2]"
                    >
                      <ExternalLink size={13} />
                      <span>Open in Newspaper</span>
                    </a>
                  )}
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="rounded-xl border border-zinc-400 px-4 py-2 text-xs font-bold text-zinc-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

