"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPublishedBlogs,
  Blog,
  CATEGORY_LABELS,
} from "../../lib/blogService";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;
    getPublishedBlogs().then((data) => {
      if (!cancelled) {
        setBlogs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* derive unique categories from fetched blogs */
  const categories = [
    "all",
    ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean))),
  ];

  const filtered = blogs.filter((b) => {
    if (filterCategory !== "all" && b.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
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

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading blogs…</p>
      </div>
    );
  }

  /* ── page ── */
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* header */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-xl py-12 px-6 text-center bg-white/95 backdrop-blur-md">
          <span className="text-xs font-black tracking-widest text-amber-700 uppercase font-heading">
            Think India SVNIT Chapter
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-heading">
            Blog & Articles
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-slate-800 font-semibold leading-relaxed">
            Insights, stories, and research updates from the Think India community.
          </p>
        </div>
      </section>

      {/* filters */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* search */}
          <input
            type="text"
            placeholder="Search blogs…"
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
              No blogs found
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Check back later for new posts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group card-orange-glass-light bg-white/95 rounded-3xl border border-amber-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* cover */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-amber-100">
                    {blog.coverImageURL ? (
                      <img
                        src={blog.coverImageURL}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
                        <span className="text-white/90 text-5xl font-black font-heading">
                          {blog.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* category badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm font-heading">
                      {CATEGORY_LABELS[blog.category] || blog.category}
                    </span>
                    {/* featured badge */}
                    {blog.isFeatured && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-sm font-heading">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* body */}
                  <div className="p-6">
                    {/* meta row */}
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 mb-3">
                      {blog.authorPhotoURL ? (
                        <img
                          src={blog.authorPhotoURL}
                          alt={blog.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-amber-300"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center text-[10px] font-black">
                          {blog.authorName?.charAt(0) || "A"}
                        </div>
                      )}
                      <span className="font-extrabold text-slate-950">
                        {blog.authorName || "Anonymous"}
                      </span>
                      <span>·</span>
                      <span>{fmtDate(blog.publishedAt)}</span>
                      <span>·</span>
                      <span>{blog.readTimeMinutes} min read</span>
                    </div>

                    {/* title */}
                    <h2 className="text-lg font-black text-slate-950 font-heading line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {blog.title}
                    </h2>

                    {/* summary */}
                    <p className="mt-2 text-sm text-slate-800 line-clamp-3 leading-relaxed font-medium">
                      {blog.summary}
                    </p>

                    {/* tags */}
                    {blog.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {blog.tags.slice(0, 3).map((tag) => (
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

        {/* result count */}
        {filtered.length > 0 && (
          <p className="mt-8 text-center text-xs font-bold text-slate-700">
            Showing {filtered.length} blog{filtered.length !== 1 ? "s" : ""}
            {filterCategory !== "all" &&
              ` in "${CATEGORY_LABELS[filterCategory] || filterCategory}"`}
          </p>
        )}
      </section>
    </div>
  );
}
