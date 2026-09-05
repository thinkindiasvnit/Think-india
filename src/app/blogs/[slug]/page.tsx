"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getBlogBySlug, incrementViews, Blog, CATEGORY_LABELS } from "../../../lib/blogService";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const viewCounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getBlogBySlug(slug).then((data) => {
      if (!cancelled) {
        setBlog(data);
        setLoading(false);
        // increment views once per visit
        if (data?.id && !viewCounted.current) {
          viewCounted.current = true;
          incrementViews(data.id);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function fmtDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* ── loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-700 font-bold">Loading blog…</p>
      </div>
    );
  }

  /* ── not found ─────────────────────────────────────────────── */
  if (!blog) {
    return (
      <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light flex flex-col selection:bg-amber-600 selection:text-white">
        <div className="max-w-3xl mx-auto px-4 py-32 text-center w-full">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/60 p-12 shadow-sm">
            <h2 className="text-2xl font-black text-zinc-950 font-heading">
              Blog Not Found
            </h2>
            <p className="mt-2 text-sm text-zinc-700 font-medium">
              The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/blogs"
              className="mt-6 inline-block px-6 py-2.5 rounded-full text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── detail ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-zinc-900 flex flex-col flex-1 font-sans selection:bg-amber-600 selection:text-white">
      {/* back link */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-600 hover:text-amber-700 transition-colors uppercase tracking-wider"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* cover banner */}
      {blog.coverImageURL && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-lg shadow-amber-900/5 ring-1 ring-amber-200/50">
            <img
              src={blog.coverImageURL}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {blog.category !== "other" && (
              <span className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-600 text-white shadow-md">
                {CATEGORY_LABELS[blog.category] || blog.category}
              </span>
            )}
          </div>
        </div>
      )}

      {/* content area */}
      <article className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* category*/}
        {!blog.coverImageURL && blog.category !== "other" && (
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-200/60 text-amber-800 mb-6 border border-amber-300/50">
            {CATEGORY_LABELS[blog.category] || blog.category}
          </span>
        )}

        {/* title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.15] font-heading">
          {blog.title}
        </h1>

        {/* summary */}
        <p className="mt-6 text-xl text-zinc-700 leading-relaxed font-medium">
          {blog.summary}
        </p>

        {/* meta row */}
        <div className="mt-8 flex flex-wrap items-center gap-5 pb-8 border-b border-amber-200/60">
          {/* author */}
          <div className="flex items-center gap-3">
            {blog.authorPhotoURL ? (
              <img
                src={blog.authorPhotoURL}
                alt={blog.authorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black shadow-sm">
                {blog.authorName?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-zinc-950 tracking-wide uppercase">
                {blog.authorName || "Anonymous"}
              </p>
              <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase mt-0.5">
                {fmtDate(blog.publishedAt)}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-amber-200/60 hidden sm:block" />

          {/* read time */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 tracking-wider uppercase">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {blog.readTimeMinutes} min read
          </div>

          <div className="h-8 w-px bg-amber-200/60 hidden sm:block" />

          {/* views */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 tracking-wider uppercase">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            {blog.views} views
          </div>
        </div>

        {/* tags */}
        {blog.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2.5">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full bg-white border border-amber-200/60 text-xs font-bold text-zinc-700 tracking-wide shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* content */}
        <div className="mt-10 prose prose-zinc max-w-none text-zinc-800 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-medium">
          {blog.content}
        </div>
      </article>
    </div>
  );
}
