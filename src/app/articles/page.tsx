"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import {
  getApprovedArticles,
  type Article,
  CATEGORY_LABELS,
} from "../../lib/articleService";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { isAuthenticated, signIn, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    getApprovedArticles().then((data) => {
      if (!cancelled) {
        setArticles(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* derive unique categories from fetched articles */
  const categories = [
    "all",
    ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean))),
  ];

  const filtered = articles.filter((a) => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.authorName.toLowerCase().includes(q) ||
        a.authorRollNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function fmtDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const handleWriteArticle = async () => {
    if (isAuthenticated) {
      router.push("/articles/write");
    } else {
      await signIn();
      // AuthProvider will re-render and user state will update
    }
  };

  /* ── loading ── */
  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading articles…</p>
      </div>
    );
  }

  /* ── page ── */
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* header */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-xl py-12 px-6 text-center bg-white/95 backdrop-blur-md relative overflow-hidden">
          {/* CTA Button placed absolutely within the header block for desktop, but stacked on mobile */}
          <div className="absolute top-6 right-6 hidden md:block">
            <button
              onClick={handleWriteArticle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-amber-600 text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 hover:-translate-y-0.5 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
              </svg>
              Write an Article
            </button>
          </div>

          <span className="text-xs font-black tracking-widest text-amber-700 uppercase font-heading">
            Student Voices
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-heading">
            SVNIT Articles
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-slate-800 font-semibold leading-relaxed">
            Read perspectives, research, and experiences shared by fellow SVNITians. Log in with your college email to publish yours.
          </p>
          
          {/* Mobile CTA */}
          <div className="mt-6 flex justify-center md:hidden">
            <button
              onClick={handleWriteArticle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-amber-600 text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
              </svg>
              Write an Article
            </button>
          </div>
        </div>
      </section>

      {/* filters */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* search */}
          <input
            type="text"
            placeholder="Search by title, tag, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-2xl border border-amber-300 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 placeholder:text-slate-400 shadow-sm"
          />

          {/* category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                  filterCategory === cat
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-white border border-amber-300 text-slate-900 hover:bg-amber-100/60 shadow-sm"
                }`}
              >
                {cat === "all"
                  ? "All Categories"
                  : CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        {filtered.length === 0 ? (
          <div className="card-orange-glass-light bg-white/95 border border-amber-300 rounded-3xl p-12 text-center shadow-md">
            <svg
              className="mx-auto h-12 w-12 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <h3 className="mt-4 text-lg font-black text-slate-950 font-heading">
              No articles found
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Be the first to share your thoughts with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group card-orange-glass-light bg-white/95 rounded-3xl border border-amber-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* cover */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-amber-100">
                    {article.coverImageURL ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.coverImageURL}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
                        <span className="text-white/90 text-5xl font-black font-heading">
                          {article.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* category badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm font-heading">
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>
                    {/* featured badge */}
                    {article.isFeatured && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-sm font-heading">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* body */}
                  <div className="p-6">
                    {/* meta row */}
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 mb-3">
                      {article.authorPhotoURL ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.authorPhotoURL}
                            alt={article.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-amber-300"
                          />
                        </>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center text-[10px] font-black">
                          {article.authorName?.charAt(0) || "A"}
                        </div>
                      )}
                      <span className="font-extrabold text-slate-950 flex items-center gap-1.5">
                        {article.authorName || "Anonymous"}
                        {article.authorRollNo && (
                          <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 text-[10px] uppercase font-bold hidden sm:inline-block">
                            {article.authorRollNo}
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      <span>{fmtDate(article.publishedAt || article.createdAt)}</span>
                      <span>·</span>
                      <span>{article.readTimeMinutes} min read</span>
                    </div>

                    {/* title */}
                    <h2 className="text-lg font-black text-slate-950 font-heading line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {article.title}
                    </h2>

                    {/* summary */}
                    <p className="mt-2 text-sm text-slate-800 line-clamp-3 leading-relaxed font-medium">
                      {article.summary}
                    </p>

                    {/* tags */}
                    {article.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-lg bg-amber-100/70 border border-amber-300/80 text-[10px] font-bold text-amber-950"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-amber-200/60 mt-4 flex items-center text-xs font-black text-amber-700 group-hover:gap-2 transition-all">
                  Read Article
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
