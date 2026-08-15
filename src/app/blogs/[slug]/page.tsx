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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading blog…</p>
      </div>
    );
  }

  /* ── not found ─────────────────────────────────────────────── */
  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Blog Not Found
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/blogs"
            className="mt-6 inline-block px-6 py-2.5 rounded-full text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  /* ── detail ────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* back link */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-amber-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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
          <div className="relative h-[300px] sm:h-[400px] rounded-3xl overflow-hidden">
            <img
              src={blog.coverImageURL}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-600 text-white">
              {CATEGORY_LABELS[blog.category] || blog.category}
            </span>
          </div>
        </div>
      )}

      {/* content area */}
      <article className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* category (if no cover) */}
        {!blog.coverImageURL && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-600 mb-4">
            {CATEGORY_LABELS[blog.category] || blog.category}
          </span>
        )}

        {/* title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
          {blog.title}
        </h1>

        {/* summary */}
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {blog.summary}
        </p>

        {/* meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-4 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          {/* author */}
          <div className="flex items-center gap-3">
            {blog.authorPhotoURL ? (
              <img
                src={blog.authorPhotoURL}
                alt={blog.authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                {blog.authorName?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {blog.authorName || "Anonymous"}
              </p>
              <p className="text-xs text-zinc-500">
                {fmtDate(blog.publishedAt)}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

          {/* read time */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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

          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

          {/* views */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
          <div className="mt-6 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* content */}
        <div className="mt-8 prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </article>
    </div>
  );
}
