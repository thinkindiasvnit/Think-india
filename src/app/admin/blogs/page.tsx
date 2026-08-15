"use client";

import { useState, useEffect, useRef } from "react";
import AdminNav from "../../../components/AdminNav";
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
  Blog,
  BlogStatus,
  BLOG_STATUSES,
  STATUS_LABELS,
  BLOG_CATEGORIES,
  CATEGORY_LABELS,
} from "../../../lib/blogService";

/* ── form state ──────────────────────────────────────────────────── */
interface FormState {
  title: string;
  summary: string;
  content: string;
  coverImageURL: string;
  category: string;
  tagsText: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  status: BlogStatus;
  isFeatured: boolean;
}

function blankForm(): FormState {
  return {
    title: "",
    summary: "",
    content: "",
    coverImageURL: "",
    category: "other",
    tagsText: "",
    authorId: "",
    authorName: "",
    authorPhotoURL: "",
    status: "draft",
    isFeatured: false,
  };
}

/* ── page ────────────────────────────────────────────────────────── */
export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [authorPhotoUploading, setAuthorPhotoUploading] = useState(false);
  const authorPhotoInputRef = useRef<HTMLInputElement>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");

  /* ── load ────────────────────────────────────────────────────── */
  async function loadBlogs() {
    setLoading(true);
    const data = await getAllBlogs();
    setBlogs(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  /* ── form helpers ───────────────────────────────────────────── */
  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function openCreate() {
    setForm(blankForm());
    setEditId(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditClick(b: Blog) {
    setForm({
      title: b.title,
      summary: b.summary,
      content: b.content,
      coverImageURL: b.coverImageURL,
      category: b.category,
      tagsText: b.tags.join(", "),
      authorId: b.authorId,
      authorName: b.authorName,
      authorPhotoURL: b.authorPhotoURL,
      status: b.status,
      isFeatured: b.isFeatured,
    });
    setEditId(b.id!);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditId(null);
    setForm(blankForm());
  }

  /* ── uploads ────────────────────────────────────────────────── */
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      set("coverImageURL", url);
    } catch {
      alert("Cover image upload failed.");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handleAuthorPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorPhotoUploading(true);
    try {
      const url = await uploadImage(file);
      set("authorPhotoURL", url);
    } catch {
      alert("Author photo upload failed.");
    } finally {
      setAuthorPhotoUploading(false);
      if (authorPhotoInputRef.current) authorPhotoInputRef.current.value = "";
    }
  }

  /* ── submit ─────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!form.title.trim()) return alert("Title is required.");
    if (!form.content.trim()) return alert("Content is required.");

    const tags = form.tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      coverImageURL: form.coverImageURL,
      category: form.category,
      tags,
      authorId: form.authorId || "admin",
      authorName: form.authorName || "Admin",
      authorPhotoURL: form.authorPhotoURL,
      status: form.status,
      isFeatured: form.isFeatured,
      publishedAt: null as string | null,
    };

    try {
      if (editId) {
        await updateBlog(editId, payload);
      } else {
        await createBlog(payload);
      }
      closeForm();
      await loadBlogs();
    } catch {
      alert("Failed to save blog.");
    }
  }

  /* ── delete ─────────────────────────────────────────────────── */
  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id);
      await loadBlogs();
    } catch {
      alert("Failed to delete blog.");
    }
  }

  /* ── filtered list ──────────────────────────────────────────── */
  const filteredBlogs =
    filterStatus === "all"
      ? blogs
      : blogs.filter((b) => b.status === filterStatus);

  /* ── format date ────────────────────────────────────────────── */
  function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* ── status badge color ─────────────────────────────────────── */
  function statusColor(s: BlogStatus): string {
    switch (s) {
      case "published":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "draft":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
      case "review":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "archived":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    }
  }

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminNav />

      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create, edit, and manage blog posts.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-500/20 transition-all"
          >
            ➕ Add Blog Post
          </button>
        )}
      </div>

      {/* ── form ──────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            {editId ? "Edit Blog Post" : "New Blog Post"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* title */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Blog post title"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* summary */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Summary
              </label>
              <input
                type="text"
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="Brief summary shown on cards"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* content */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Content *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={12}
                placeholder="Full blog content…"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 leading-relaxed"
              />
            </div>

            {/* cover image */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Cover Image
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {coverUploading ? "Uploading…" : "Upload Image"}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={form.coverImageURL}
                  onChange={(e) => set("coverImageURL", e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              {form.coverImageURL && (
                <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={form.coverImageURL}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => set("coverImageURL", "")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* category */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* tags */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tagsText}
                onChange={(e) => set("tagsText", e.target.value)}
                placeholder="react, nextjs, firebase"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* status */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as BlogStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              >
                {BLOG_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* author name */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Author Name
              </label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => set("authorName", e.target.value)}
                placeholder="Author display name"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* author id */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Author ID
              </label>
              <input
                type="text"
                value={form.authorId}
                onChange={(e) => set("authorId", e.target.value)}
                placeholder="Optional identifier"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* author photo */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Author Photo URL
              </label>
              <input
                type="text"
                value={form.authorPhotoURL}
                onChange={(e) => set("authorPhotoURL", e.target.value)}
                placeholder="Photo URL for author avatar"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* featured */}
            <div className="flex items-center gap-3 lg:col-span-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="w-4 h-4 accent-amber-600"
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Feature this blog post
              </label>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={closeForm}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-500/20 transition-all"
            >
              {editId ? "Save Changes" : "Create Blog Post"}
            </button>
          </div>
        </div>
      )}

      {/* ── status filter ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...BLOG_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              filterStatus === s
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                : "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {s === "all" ? `All (${blogs.length})` : `${STATUS_LABELS[s as BlogStatus]} (${blogs.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* ── table ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-12 text-center">
          <p className="text-zinc-500">No blog posts yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/50 text-left">
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Blog
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Category
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Author
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Stats
                </th>
                <th className="px-4 py-3 font-bold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredBlogs.map((b) => (
                <tr
                  key={b.id}
                  className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {/* blog info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.coverImageURL ? (
                        <img
                          src={b.coverImageURL}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                          {b.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white truncate max-w-[220px]">
                          {b.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate max-w-[220px]">
                          /{b.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* category */}
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                      {CATEGORY_LABELS[b.category] || b.category}
                    </span>
                  </td>

                  {/* status */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor(b.status)}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                    {b.isFeatured && (
                      <span className="ml-1.5 text-amber-500" title="Featured">
                        ⭐
                      </span>
                    )}
                  </td>

                  {/* author */}
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {b.authorName || "—"}
                  </td>

                  {/* date */}
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {fmtDate(b.publishedAt || b.createdAt)}
                  </td>

                  {/* stats */}
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs text-zinc-500">
                      <span>{b.views} views</span>
                      <span>{b.readTimeMinutes}m read</span>
                    </div>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id!)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
