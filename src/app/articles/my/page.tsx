"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import {
  getArticlesByAuthor,
  resubmitArticle,
  deleteArticle,
  type Article,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../../../lib/articleService";

export default function MyArticlesDashboard() {
  const { user, isAuthenticated, loading: authLoading, signIn } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!authLoading && user) {
      getArticlesByAuthor(user.id).then((data) => {
        if (!cancelled) {
          setArticles(data);
          setLoading(false);
        }
      });
    } else if (!authLoading && !user) {
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleResubmit(id: string) {
    if (!confirm("Are you sure you want to resubmit this article for review?")) return;
    try {
      await resubmitArticle(id);
      // reload
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "pending", rejectionReason: null } : a))
      );
    } catch {
      alert("Failed to resubmit article.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article forever?")) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete article.");
    }
  }

  function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (authLoading || loading) {
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
            Please sign in to view your articles dashboard.
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 rounded-full font-bold bg-amber-600 text-white shadow-md hover:bg-amber-700 transition-all"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white/90 backdrop-blur-md p-6 sm:px-8 sm:py-6 rounded-3xl border border-amber-300 shadow-xl">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.photoURL || "/default-avatar.png"} alt="Avatar" className="w-14 h-14 rounded-full ring-2 ring-amber-300 object-cover shadow-sm" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">
                My Articles
              </h1>
              <p className="text-sm font-semibold text-amber-700 mt-0.5">
                {user.collegeEmail}
              </p>
            </div>
          </div>
          <Link
            href="/articles/write"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-extrabold bg-amber-600 text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
          >
            + Write Article
          </Link>
        </div>

        {/* Dashboard Grid */}
        {articles.length === 0 ? (
          <div className="card-orange-glass-light bg-white/95 rounded-3xl p-12 text-center border border-amber-300 shadow-lg">
            <svg className="w-16 h-16 text-amber-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <h3 className="text-xl font-black text-slate-900 font-heading">You haven&apos;t written any articles yet</h3>
            <p className="mt-2 text-sm font-medium text-slate-600">Share your thoughts with the community!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <div key={article.id} className="card-orange-glass-light bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200 shadow-lg overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl">
                
                {/* Image (Desktop Left) */}
                <div className="w-full md:w-48 h-40 md:h-auto shrink-0 relative bg-amber-100 border-r border-amber-200/50">
                  {article.coverImageURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.coverImageURL} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-200 to-orange-300">
                      <svg className="w-8 h-8 text-amber-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 md:hidden">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[article.status]}`}>
                      {STATUS_LABELS[article.status]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-black text-slate-900 font-heading line-clamp-1">
                        {article.title}
                      </h2>
                      <span className={`hidden md:inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${STATUS_COLORS[article.status]}`}>
                        {STATUS_LABELS[article.status]}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {article.summary}
                    </p>

                    {/* Rejection Alert */}
                    {article.status === "rejected" && article.rejectionReason && (
                      <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start">
                        <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-bold text-rose-900">Admin Feedback</h4>
                          <p className="text-xs font-semibold text-rose-700 mt-1">{article.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>{fmtDate(article.createdAt)}</span>
                      {article.status === "approved" && (
                        <>
                          <span className="text-amber-700">•</span>
                          <span>{article.views} views</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {article.status === "approved" && (
                        <Link
                          href={`/articles/${article.slug}`}
                          className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                        >
                          View Post
                        </Link>
                      )}
                      
                      {article.status === "rejected" && (
                        <button
                          onClick={() => handleResubmit(article.id!)}
                          className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                        >
                          Resubmit
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(article.id!)}
                        className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
