"use client";

import { useEffect, useState } from "react";
import AdminNav from "../../../components/AdminNav";
import { useRequireAdminAuth } from "../../../components/useRequireAdminAuth";
import {
  Article,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  createNewspaperEdition,
  DEFAULT_EDITIONS,
  deleteArticle,
  deleteNewspaperEdition,
  getAllArticles,
  getNewspaperEditions,
  NewspaperEdition,
  reviewArticle,
  saveArticlePreview,
  updateArticle,
} from "../../../lib/articleService";
import {
  Library,
  Newspaper,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  BookOpen,
} from "lucide-react";

type EditValues = Pick<Article, "title" | "summary" | "content" | "coverImageURL" | "category" | "tags"> & {
  editionId?: string;
};

export default function AdminArticlesPage() {
  const admin = useRequireAdminAuth();
  const [activeTab, setActiveTab] = useState<"articles" | "editions">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [editions, setEditions] = useState<NewspaperEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<EditValues | null>(null);
  const [proofArticle, setProofArticle] = useState<Article | null>(null);

  // New edition form state
  const [showNewEditionModal, setShowNewEditionModal] = useState(false);
  const [newEdition, setNewEdition] = useState({
    title: "",
    editionName: "CAMPUS EDITION",
    volume: "VOL. 2 · ISSUE 1",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
    price: "FREE",
    tagline: "IDEAS THAT INSPIRE. ACTION THAT TRANSFORMS.",
    description: "",
    coverStoryHeadline: "",
    coverStoryDeck: "",
    coverPhoto: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop&auto=format",
    status: "published" as "published" | "draft",
  });
  const [creatingEdition, setCreatingEdition] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [arts, eds] = await Promise.all([
        getAllArticles(),
        getNewspaperEditions(),
      ]);
      setArticles(arts);
      if (eds && eds.length > 0) setEditions(eds);
    } catch (err) {
      console.error("Error loading articles and editions", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([getAllArticles(), getNewspaperEditions()])
      .then(([arts, eds]) => {
        if (!active) return;
        setArticles(arts);
        if (eds && eds.length > 0) setEditions(eds);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function startEdit(article: Article) {
    setEditing(article);
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      coverImageURL: article.coverImageURL,
      category: article.category,
      tags: article.tags,
      editionId: article.editionId || editions[0]?.id || "edition-1",
    });
  }

  async function saveEdit() {
    if (!editing?.id || !form) return;
    try {
      await updateArticle(editing.id, form);
      setEditing(null);
      setForm(null);
      await loadData();
    } catch {
      alert("Unable to save this article.");
    }
  }

  async function moderate(id: string, status: "published" | "rejected") {
    try {
      await reviewArticle(id, status);
      await loadData();
    } catch {
      alert("Unable to update this article status.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle(id);
      await loadData();
    } catch {
      alert("Unable to delete this article.");
    }
  }

  async function removeEdition(id: string, title: string) {
    if (
      !window.confirm(
        `Are you sure you want to delete the entire newspaper edition "${title}"?\n\nThis will permanently remove it from the newspaper stand.`
      )
    ) {
      return;
    }
    try {
      await deleteNewspaperEdition(id);
      await loadData();
    } catch {
      alert("Unable to delete this newspaper edition.");
    }
  }

  function previewInReader(article: Article) {
    saveArticlePreview(article);
    window.open(`/article?preview=1&edition=${article.editionId || "edition-1"}`, "_blank", "noopener");
  }

  async function handleCreateEdition(e: React.FormEvent) {
    e.preventDefault();
    if (!newEdition.title || !newEdition.coverStoryHeadline) {
      alert("Please provide at least a title and cover story headline.");
      return;
    }
    setCreatingEdition(true);
    try {
      const created = await createNewspaperEdition({
        ...newEdition,
        pages: [
          {
            id: 1,
            label: "COVER STORY",
            headline: newEdition.coverStoryHeadline,
            deck: newEdition.coverStoryDeck || newEdition.description,
            dropCapLetter: newEdition.coverStoryHeadline.charAt(0).toUpperCase() || "T",
            dropCapRest: newEdition.coverStoryHeadline.slice(1),
            paragraphs: [
              newEdition.description || "The newest edition published by Think India SVNIT editorial board.",
              "Students, researchers, and campus changemakers have contributed their insights and policy perspectives to this issue.",
            ],
            pullQuote: {
              text: "Ideas that inspire. Action that transforms.",
              attribution: "– Think India SVNIT",
            },
            photo: newEdition.coverPhoto,
            photoAlt: newEdition.title,
            imageCaption: `Cover dispatch for ${newEdition.title}.`,
            columns: [
              { title: "CAMPUS VOICES", body: "Articles authored by members of Think India SVNIT." },
              { title: "POLICY & ACTION", body: "Research and youth perspectives on national development." },
              { title: "EDITORIAL", body: "Reviewed and published for the campus community." },
            ],
          },
        ],
      });
      setEditions((prev) => [...prev, created]);
      setShowNewEditionModal(false);
      alert(`Newspaper edition "${created.title}" created successfully!`);
    } catch (err) {
      console.error(err);
      alert("Unable to create newspaper edition.");
    } finally {
      setCreatingEdition(false);
    }
  }

  if (!admin) return null;

  const reviewCount = articles.filter((a) => a.status === "review").length;
  const publishedCount = articles.filter((a) => a.status === "published").length;

  return (
    <div className="min-h-screen bg-[#fffdfa] px-4 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        {/* ── Header & Telemetry ── */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-amber-200/80 pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-600" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-800">
                Editorial Newsroom & Press Desk
              </p>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-black text-zinc-950 sm:text-4xl">
              Newspaper & Articles Desk
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage multiple newspaper editions, review member dispatches, and typeset articles for print.
            </p>
          </div>

          {/* Quick Desk Counters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2">
              <Clock size={16} className="text-amber-700" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">{reviewCount}</span>
                <span className="ml-1 text-zinc-500">On Wire</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2">
              <CheckCircle size={16} className="text-emerald-700" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900">{publishedCount}</span>
                <span className="ml-1 text-zinc-500">In Print</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2">
              <Library size={16} className="text-zinc-700" />
              <div className="text-xs">
                <span className="font-bold text-zinc-900">{editions.length}</span>
                <span className="ml-1 text-zinc-500">Newspapers</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="mb-8 flex items-center justify-between border-b border-zinc-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                activeTab === "articles"
                  ? "border-amber-700 text-amber-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Newspaper size={16} />
              <span>Articles & Dispatches ({articles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("editions")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                activeTab === "editions"
                  ? "border-amber-700 text-amber-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Library size={16} />
              <span>Newspaper Editions ({editions.length})</span>
            </button>
          </div>

          {activeTab === "editions" && (
            <button
              onClick={() => setShowNewEditionModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-800"
            >
              <Plus size={15} />
              <span>Create Newspaper Edition</span>
            </button>
          )}
        </div>

        {/* ── Edit Article Drawer / Form ── */}
        {editing && form && (
          <section className="mb-10 rounded-3xl border-2 border-amber-400 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Typesetting & Copy Editor</p>
                <h2 className="text-2xl font-black text-zinc-950">Edit Article Manuscript</h2>
              </div>
              <button
                onClick={() => { setEditing(null); setForm(null); }}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Headline</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 font-serif font-bold text-zinc-900"
                  placeholder="Article Headline"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Deck / Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-800"
                  rows={2}
                  placeholder="Summary deck"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Article Body Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 font-mono text-sm leading-relaxed text-zinc-800"
                  rows={10}
                  placeholder="Article text"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Target Newspaper Edition</label>
                  <select
                    value={form.editionId || "edition-1"}
                    onChange={(e) => setForm({ ...form, editionId: e.target.value })}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-4 py-3 text-sm font-semibold text-zinc-900"
                  >
                    {editions.map((ed) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.volume} - {ed.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                  >
                    {ARTICLE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {ARTICLE_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Tags</label>
                  <input
                    value={form.tags.join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                    placeholder="policy, campus, youth"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Cover Photo URL</label>
                <input
                  value={form.coverImageURL}
                  onChange={(e) => setForm({ ...form, coverImageURL: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => void saveEdit()}
                className="rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-800"
              >
                Save Changes to Manuscript
              </button>
              <button
                onClick={() => { setEditing(null); setForm(null); }}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ── TAB 1: Articles Queue ── */}
        {activeTab === "articles" && (
          <div>
            {loading ? (
              <p className="py-12 text-center text-zinc-500">Loading submissions from the wire…</p>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center">
                <Newspaper className="mx-auto mb-3 text-zinc-400" size={32} />
                <h3 className="font-serif text-lg font-bold text-zinc-800">No Articles on the Wire</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Submissions from SVNIT members will appear here for editorial review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => {
                  const targetEdition = editions.find((e) => e.id === (article.editionId || "edition-1"));
                  return (
                    <article
                      key={article.id}
                      className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          {/* Status and Edition badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {article.status === "published" && (
                              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-emerald-800">
                                🟢 Approved For Print
                              </span>
                            )}
                            {article.status === "review" && (
                              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-amber-800">
                                🟡 On The Wire (Pending)
                              </span>
                            )}
                            {article.status === "rejected" && (
                              <span className="rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-red-800">
                                🔴 Spiked / Rejected
                              </span>
                            )}

                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                              {ARTICLE_CATEGORY_LABELS[article.category] || article.category}
                            </span>

                            <label className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 cursor-pointer">
                              <Library size={12} className="text-amber-700" />
                              <span className="text-[10px] font-mono uppercase font-bold text-amber-800">Edition:</span>
                              <select
                                value={article.editionId || "edition-1"}
                                onChange={async (e) => {
                                  const newEd = e.target.value;
                                  try {
                                    await updateArticle(article.id!, { editionId: newEd });
                                    await loadData();
                                  } catch {
                                    alert("Unable to reassign newspaper edition.");
                                  }
                                }}
                                className="bg-transparent text-xs font-bold text-amber-950 outline-none cursor-pointer"
                              >
                                {editions.map((ed) => (
                                  <option key={ed.id} value={ed.id}>
                                    {ed.volume} - {ed.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <h2 className="mt-3 font-serif text-2xl font-bold text-zinc-950">
                            {article.title}
                          </h2>
                          <p className="mt-1.5 text-sm text-zinc-600">{article.summary}</p>
                          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                            <span className="font-bold text-zinc-800">By {article.authorName}</span>
                            <span>•</span>
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            {article.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{article.tags.map((t) => `#${t}`).join(" ")}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Editorial Actions */}
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            onClick={() => setProofArticle(article)}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                            title="Quick proof sheet preview"
                          >
                            <Eye size={14} />
                            <span>Galley Proof</span>
                          </button>

                          <button
                            onClick={() => previewInReader(article)}
                            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
                            title="Open in full 3D newspaper reader"
                          >
                            <ExternalLink size={14} />
                            <span>In Newspaper</span>
                          </button>

                          <button
                            onClick={() => startEdit(article)}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>

                          {article.status === "review" && (
                            <>
                              <button
                                onClick={() => moderate(article.id!, "published")}
                                className="flex items-center gap-1 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                              >
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => moderate(article.id!, "rejected")}
                                className="flex items-center gap-1 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => remove(article.id!)}
                            className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Delete article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Newspaper Editions Management ── */}
        {activeTab === "editions" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {editions.map((edition) => (
              <div
                key={edition.id}
                className="flex flex-col rounded-2xl border-2 border-[#1a1209]/15 bg-[#f4ede2] p-5 shadow-sm transition-all hover:border-[#1a1209]/40 hover:shadow-md"
              >
                {/* Masthead snippet */}
                <div className="border-b border-[#1a1209]/20 pb-3">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-amber-900">
                    <span>{edition.volume}</span>
                    <span>{edition.date}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-xl font-black text-zinc-950">
                    {edition.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    {edition.editionName}
                  </p>
                </div>

                {/* Cover Image */}
                <div className="my-3 h-36 overflow-hidden rounded border border-[#1a1209]/20 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={edition.coverPhoto}
                    alt={edition.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="font-serif text-xs font-bold text-zinc-900 line-clamp-2">
                  "{edition.coverStoryHeadline.replace("\n", " ")}"
                </p>
                <p className="mt-1 flex-1 text-xs text-zinc-600 line-clamp-3">
                  {edition.description}
                </p>

                {/* Meta & Button */}
                <div className="mt-4 flex items-center justify-between border-t border-[#1a1209]/15 pt-3">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {edition.pages?.length || 4} Editorial Pages
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void removeEdition(edition.id, edition.title)}
                      className="flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                      title="Delete this entire newspaper edition"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                    <a
                      href={`/article?edition=${edition.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-[#1a1209] px-3.5 py-1.5 text-xs font-bold text-[#f4ede2] hover:bg-amber-950"
                    >
                      <BookOpen size={13} />
                      <span>Read Newspaper →</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Galley Proof Quick Preview Modal ── */}
        {proofArticle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setProofArticle(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-4 border-[#1a1209] bg-[#f4ede2] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-[#1a1209] pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1a1209]">
                  EDITORIAL GALLEY PROOF
                </span>
                <button
                  onClick={() => setProofArticle(null)}
                  className="rounded-full p-1 text-[#1a1209] hover:bg-black/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 font-serif">
                <div className="text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-800">
                    {ARTICLE_CATEGORY_LABELS[proofArticle.category] || proofArticle.category}
                  </span>
                  <h2 className="mt-2 text-3xl font-black text-[#1a1209]">
                    {proofArticle.title}
                  </h2>
                  <p className="mt-2 font-serif italic text-zinc-700">
                    {proofArticle.summary}
                  </p>
                  <p className="mt-2 font-mono text-xs font-bold tracking-wider text-zinc-600">
                    BY {proofArticle.authorName.toUpperCase()}
                  </p>
                </div>

                <div className="my-6 border-b border-t border-[#1a1209] py-1 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                  PROOFED FOR: {proofArticle.editionId || "EDITION-1"} · STATUS: {proofArticle.status.toUpperCase()}
                </div>

                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
                  {proofArticle.content}
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-[#1a1209] pt-4">
                  <button
                    onClick={() => previewInReader(proofArticle)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#1a1209] px-4 py-2 text-xs font-bold text-[#f4ede2]"
                  >
                    <ExternalLink size={13} />
                    <span>Open in 3D Newspaper</span>
                  </button>
                  <button
                    onClick={() => setProofArticle(null)}
                    className="rounded-xl border border-zinc-400 px-4 py-2 text-xs font-bold text-zinc-800"
                  >
                    Close Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Create New Edition Modal ── */}
        {showNewEditionModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowNewEditionModal(false)}
          >
            <div
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-amber-300 bg-white p-6 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">New Publication</p>
                  <h2 className="text-2xl font-black text-zinc-950">Create Newspaper Edition</h2>
                </div>
                <button
                  onClick={() => setShowNewEditionModal(false)}
                  className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateEdition} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Edition Title / Theme</label>
                  <input
                    required
                    value={newEdition.title}
                    onChange={(e) => setNewEdition({ ...newEdition, title: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold"
                    placeholder="e.g. Technology & Sustainable Bharat"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Edition Subtitle</label>
                    <input
                      required
                      value={newEdition.editionName}
                      onChange={(e) => setNewEdition({ ...newEdition, editionName: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                      placeholder="e.g. CAMPUS EDITION / TECH SPECIAL"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Volume & Issue</label>
                    <input
                      required
                      value={newEdition.volume}
                      onChange={(e) => setNewEdition({ ...newEdition, volume: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                      placeholder="e.g. VOL. 2 · ISSUE 1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Publication Date</label>
                    <input
                      required
                      value={newEdition.date}
                      onChange={(e) => setNewEdition({ ...newEdition, date: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                      placeholder="e.g. 15 NOV 2026"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Price / Access</label>
                    <input
                      required
                      value={newEdition.price}
                      onChange={(e) => setNewEdition({ ...newEdition, price: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                      placeholder="FREE"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Masthead Tagline</label>
                  <input
                    required
                    value={newEdition.tagline}
                    onChange={(e) => setNewEdition({ ...newEdition, tagline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                    placeholder="IDEAS THAT INSPIRE. ACTION THAT TRANSFORMS."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Editorial Summary</label>
                  <textarea
                    required
                    value={newEdition.description}
                    onChange={(e) => setNewEdition({ ...newEdition, description: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                    rows={2}
                    placeholder="Summary of this newspaper issue..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Cover Story Headline</label>
                  <input
                    required
                    value={newEdition.coverStoryHeadline}
                    onChange={(e) => setNewEdition({ ...newEdition, coverStoryHeadline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 font-serif font-bold text-sm"
                    placeholder="Front-page headline for this edition"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">Cover Photo URL</label>
                  <input
                    required
                    type="url"
                    value={newEdition.coverPhoto}
                    onChange={(e) => setNewEdition({ ...newEdition, coverPhoto: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewEditionModal(false)}
                    className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingEdition}
                    className="rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-60"
                  >
                    {creatingEdition ? "Creating Edition…" : "Publish Newspaper Edition"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
