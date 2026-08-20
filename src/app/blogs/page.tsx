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
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* header */}
      <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-black tracking-widest text-amber-600 uppercase">
          Think India SVNIT
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Insights, stories, and updates from the Think India community.
        </p>
      </section>

      {/* filters */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* search */}
          <input
            type="text"
            placeholder="Search blogs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />

          {/* category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  filterCategory === cat
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {cat === "all"
                  ? "All"
                  : CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        {filtered.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
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
            <h3 className="mt-4 text-lg font-bold text-zinc-700 dark:text-zinc-300">
              No blogs found
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Check back later for new posts.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Featured Hero Blog */}
            {filtered[0] && (
              <Link
                href={`/blogs/${filtered[0].slug}`}
                className="group flex flex-col lg:flex-row w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mb-12 sm:mb-16"
              >
                {/* Left: Image */}
                <div className="relative w-full lg:w-2/3 aspect-video lg:aspect-auto lg:min-h-[450px] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  {filtered[0].coverImageURL ? (
                    <img
                      src={filtered[0].coverImageURL}
                      alt={filtered[0].title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
                      <span className="text-white/80 text-7xl sm:text-9xl font-black">
                        {filtered[0].title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {filtered[0].isFeatured && (
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-lg">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Right: Colored Block */}
                <div className="w-full lg:w-1/3 bg-amber-600 dark:bg-amber-700 text-white p-8 sm:p-12 flex flex-col justify-center relative overflow-hidden">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex flex-col gap-1 items-center text-center mb-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100/80">
                        {CATEGORY_LABELS[filtered[0].category] || filtered[0].category}
                      </span>
                      <span className="text-xs font-semibold text-amber-100">
                        {fmtDate(filtered[0].publishedAt)}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center leading-[1.1] tracking-tight mb-6 group-hover:text-amber-100 transition-colors">
                      {filtered[0].title}
                    </h2>

                    <p className="text-sm sm:text-base text-amber-50 text-center line-clamp-4 leading-relaxed mb-8 font-medium">
                      {filtered[0].summary}
                    </p>

                    <div className="mt-auto flex justify-center text-xs font-bold uppercase tracking-widest text-amber-100/90">
                      {filtered[0].authorName || "Anonymous"}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining Blogs Grid */}
            {filtered.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filtered.slice(1).map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-5 border border-zinc-200/50 dark:border-zinc-700/50">
                      {blog.coverImageURL ? (
                        <img
                          src={blog.coverImageURL}
                          alt={blog.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
                          <span className="text-white/80 text-5xl font-black">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      {blog.isFeatured && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3">
                        <span>{CATEGORY_LABELS[blog.category] || blog.category}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{fmtDate(blog.publishedAt)}</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-[1.2] tracking-tight mb-3 group-hover:text-amber-600 transition-colors">
                        {blog.title}
                      </h3>
                      
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                        {blog.summary}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3">
                        {blog.authorPhotoURL ? (
                          <img
                            src={blog.authorPhotoURL}
                            alt={blog.authorName}
                            className="w-7 h-7 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shadow-sm">
                            {blog.authorName?.charAt(0) || "A"}
                          </div>
                        )}
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                          {blog.authorName || "Anonymous"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* result count */}
        {filtered.length > 0 && (
          <p className="mt-8 text-center text-xs text-zinc-400">
            Showing {filtered.length} blog{filtered.length !== 1 ? "s" : ""}
            {filterCategory !== "all" &&
              ` in "${CATEGORY_LABELS[filterCategory] || filterCategory}"`}
          </p>
        )}
      </section>
    </div>
  );
}
