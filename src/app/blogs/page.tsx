"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getPublishedBlogs,
  Blog,
  CATEGORY_LABELS,
} from "../../lib/blogService";

function AnimatedBlogRow({ blog, index }: { blog: Blog; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  function fmtDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Link
      ref={ref}
      href={`/blogs/${blog.slug}`}
      className={`group flex flex-col ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      } w-full overflow-hidden mb-24 lg:mb-32`}
    >
      {/* Image Container */}
      <div
        className={`relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-[500px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 transition-all duration-[800ms] ease-out delay-100 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {blog.coverImageURL ? (
          <img
            src={blog.coverImageURL}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 transition-transform duration-[1500ms] group-hover:scale-105">
            <span className="text-white/80 text-7xl font-black">
              {blog.title.charAt(0)}
            </span>
          </div>
        )}
        {blog.isFeatured && (
          <span className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-600 text-white shadow-lg">
            Featured
          </span>
        )}
      </div>

      {/* Content Container */}
      <div
        className={`w-full lg:w-1/2 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-16 xl:px-24 py-12 lg:py-0 transition-all duration-[800ms] ease-out delay-300 ${
          isVisible
            ? "translate-y-0 translate-x-0 opacity-100"
            : isEven
            ? "translate-y-8 lg:translate-y-0 translate-x-0 lg:-translate-x-8 opacity-0"
            : "translate-y-8 lg:translate-y-0 translate-x-0 lg:translate-x-8 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
            {CATEGORY_LABELS[blog.category] || blog.category}
          </span>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            {fmtDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white leading-[1.15] tracking-tight mb-6 group-hover:text-amber-600 transition-colors">
          {blog.title}
        </h2>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed mb-10 font-medium max-w-xl mx-auto">
          {blog.summary}
        </p>

        <div className="mt-auto flex flex-col items-center gap-2 pt-2">
          <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            {blog.authorName || "Anonymous"}
          </div>
        </div>
      </div>
    </Link>
  );
}

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

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading stories…</p>
      </div>
    );
  }

  /* ── page ── */
  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-zinc-950">
      {/* header */}
      <section className="bg-zinc-50 dark:bg-zinc-900/50 py-24 px-4 sm:px-6 lg:px-8 text-center border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-black tracking-[0.2em] text-amber-600 uppercase">
          Think India SVNIT
        </span>
        <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight text-zinc-900 dark:text-white">
          Editorial
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          Insights, stories, and updates from the Think India community, curated for our readers.
        </p>
      </section>

      {/* filters */}
      <section className="max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
          {/* category pills */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filterCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {cat === "all"
                  ? "All Stories"
                  : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* search */}
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Search stories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </section>

      {/* blogs list */}
      <section className="max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              No stories found
            </h3>
            <p className="mt-2 text-zinc-500">
              Try adjusting your search or category filters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((blog, index) => (
              <AnimatedBlogRow key={blog.id} blog={blog} index={index} />
            ))}
          </div>
        )}

        {/* result count */}
        {filtered.length > 0 && (
          <p className="mt-12 mb-20 text-center text-sm font-bold tracking-widest uppercase text-zinc-400">
            — Showing {filtered.length} {filtered.length === 1 ? "Story" : "Stories"} —
          </p>
        )}
      </section>
    </div>
  );
}
