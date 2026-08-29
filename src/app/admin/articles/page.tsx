"use client";

import { useState, useEffect } from "react";
import AdminNav from "../../../components/AdminNav";
import {
  getAllArticles,
  approveArticle,
  rejectArticle,
  archiveArticle,
  deleteArticle,
  type Article,
  type ArticleStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  ARTICLE_STATUSES,
} from "../../../lib/articleService";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | "all">("all");

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filtered = filterStatus === "all" 
    ? articles 
    : articles.filter(a => a.status === filterStatus);

  async function handleApprove(id: string) {
    if (!confirm("Approve this article and publish it live?")) return;
    try {
      await approveArticle(id, "admin-uid", "System Admin");
      loadArticles();
    } catch {
      alert("Failed to approve article.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to completely delete this article? This action cannot be undone.")) return;
    try {
      await deleteArticle(id);
      loadArticles();
    } catch {
      alert("Failed to delete article.");
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;
    try {
      await rejectArticle(rejectingId, "admin-uid", "System Admin", rejectionReason);
      setRejectingId(null);
      setRejectionReason("");
      loadArticles();
    } catch {
      alert("Failed to reject article.");
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this article? It will be hidden from public view.")) return;
    try {
      await archiveArticle(id);
      loadArticles();
    } catch {
      alert("Failed to archive article.");
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

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminNav />

        {/* header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-amber-300 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">
              Student Articles Queue
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Review, approve, and manage user-submitted articles.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterStatus === "all"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Articles
          </button>
          {ARTICLE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? STATUS_COLORS[s] + " ring-2 ring-offset-2 ring-slate-900"
                  : STATUS_COLORS[s] + " opacity-70 hover:opacity-100"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Reject Modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <form onSubmit={handleRejectSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 font-heading mb-2">Reject Article</h3>
              <p className="text-sm text-slate-600 font-semibold mb-4">
                Please provide a reason so the author can edit and resubmit.
              </p>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Please fix typos and add a cover image."
                className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-orange-glass-light bg-white/95 rounded-3xl p-12 text-center border border-amber-300 shadow-lg">
            <h3 className="text-xl font-black text-slate-900 font-heading">Queue is Empty</h3>
            <p className="mt-2 text-sm font-medium text-slate-600">No articles match the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map((article) => (
              <div key={article.id} className="card-orange-glass-light bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200 shadow-lg overflow-hidden flex flex-col md:flex-row transition-all">
                
                {/* Meta & Info */}
                <div className="p-6 flex-1 flex flex-col justify-between border-r border-amber-100/50">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[article.status]}`}>
                        {STATUS_LABELS[article.status]}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {fmtDate(article.createdAt)}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 font-heading line-clamp-1 mb-1">
                      {article.title}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-bold text-slate-700">{article.authorName}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                        {article.authorRollNo}
                      </span>
                      <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                        ({article.authorEmail})
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {article.summary}
                    </p>

                    <div className="mt-4 pt-4 border-t border-amber-100 flex gap-4 text-xs font-bold text-slate-500">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.readTimeMinutes} min read</span>
                    </div>
                  </div>
                </div>

                {/* Actions Sidebar */}
                <div className="w-full md:w-56 bg-amber-50/50 p-6 flex flex-col justify-center gap-3">
                  {/* View details - in a real app, this might open a modal or new tab with full content */}
                  <a
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shadow-sm"
                  >
                    View Details ↗
                  </a>

                  {article.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(article.id!)}
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(article.id!)}
                        className="w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {article.status === "approved" && (
                    <button
                      onClick={() => handleArchive(article.id!)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-sm"
                    >
                      Archive Post
                    </button>
                  )}

                  {article.status === "archived" && (
                    <button
                      onClick={() => handleApprove(article.id!)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Restore (Approve)
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(article.id!)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white border border-rose-600 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-sm mt-4"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
