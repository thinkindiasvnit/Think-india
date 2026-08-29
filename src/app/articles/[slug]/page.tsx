"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getArticleBySlug,
  incrementArticleViews,
  type Article,
  CATEGORY_LABELS,
} from "../../../lib/articleService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const viewCounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getArticleBySlug(slug).then((data) => {
      if (!cancelled) {
        setArticle(data);
        setLoading(false);
        // increment views once per visit
        if (data?.id && !viewCounted.current) {
          viewCounted.current = true;
          incrementArticleViews(data.id);
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
        <p className="text-sm text-zinc-500">Loading article…</p>
      </div>
    );
  }

  /* ── not found ─────────────────────────────────────────────── */
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xl p-12">
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            Article Not Found
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            The article you&apos;re looking for doesn&apos;t exist, hasn&apos;t been approved yet, or has been removed.
          </p>
          <Link
            href="/articles"
            className="mt-6 inline-block px-6 py-2.5 rounded-full text-sm font-extrabold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  /* ── detail ────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col flex-1 bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans selection:bg-amber-600 selection:text-white pb-20">
      {/* back link */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-600 hover:text-amber-700 transition-colors bg-white/60 px-4 py-2 rounded-full border border-amber-200 backdrop-blur-md shadow-sm"
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
          Back to Articles
        </Link>
      </div>

      {/* cover banner */}
      {article.coverImageURL && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative h-[300px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-amber-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageURL}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white shadow-md">
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
          </div>
        </div>
      )}

      {/* content area */}
      <article className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-6 card-orange-glass-light bg-white/95 backdrop-blur-md rounded-3xl border border-amber-300 shadow-xl">
        {/* category if no cover */}
        {!article.coverImageURL && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-700 mb-6 shadow-sm">
            {CATEGORY_LABELS[article.category] || article.category}
          </span>
        )}

        {/* title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-[1.1] font-heading">
          {article.title}
        </h1>

        {/* summary */}
        <p className="mt-6 text-lg sm:text-xl font-medium text-slate-700 leading-relaxed">
          {article.summary}
        </p>

        {/* meta row */}
        <div className="mt-8 flex flex-wrap items-center gap-4 pb-8 border-b border-amber-200">
          {/* author */}
          <div className="flex items-center gap-3 bg-amber-50/50 px-4 py-2 rounded-full border border-amber-100 shadow-sm">
            {article.authorPhotoURL ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.authorPhotoURL}
                  alt={article.authorName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-300 shadow-sm"
                />
              </>
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center font-black shadow-sm ring-2 ring-amber-300">
                {article.authorName?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <p className="text-sm font-black text-slate-950 flex items-center gap-2">
                {article.authorName || "Anonymous"}
                {article.authorRollNo && (
                  <span className="bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 text-[10px] uppercase font-bold tracking-wider">
                    {article.authorRollNo}
                  </span>
                )}
              </p>
              <p className="text-xs font-bold text-amber-700 mt-0.5">
                {fmtDate(article.publishedAt || article.createdAt)}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-amber-200 hidden sm:block" />

          {/* read time */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {article.readTimeMinutes} min read
          </div>

          {/* views */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {article.views} views
          </div>
        </div>

        {/* tags */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/80 text-[11px] font-black text-amber-950 uppercase tracking-widest shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* content */}
        <div className="mt-10 prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-amber-600 hover:prose-a:text-amber-700 prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
