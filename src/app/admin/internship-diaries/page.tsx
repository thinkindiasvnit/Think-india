"use client";

import { useState, useEffect, useRef } from "react";
import AdminNav from "../../../components/AdminNav";
import {
  getInternshipDiaries,
  createInternshipDiary,
  updateInternshipDiary,
  deleteInternshipDiary,
  InternshipDiary,
} from "../../../lib/internshipDiaryService";

// ─── Cloudinary uploader ───────────────────────────────────────────────────────
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET)
    throw new Error("Cloudinary env vars missing.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed: " + res.statusText);
  const data = await res.json();
  return data.secure_url as string;
}

/* ── form state ──────────────────────────────────────────────────── */
interface FormState {
  name: string;
  college: string;
  institute: string;
  description: string;
  review: string;
  photoURL: string;
  year: string;
}

function blankForm(): FormState {
  return {
    name: "",
    college: "",
    institute: "",
    description: "",
    review: "",
    photoURL: "",
    year: "2026",
  };
}

/* ── page ────────────────────────────────────────────────────────── */
export default function AdminInternshipDiariesPage() {
  const [diaries, setDiaries] = useState<InternshipDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ── load ────────────────────────────────────────────────────── */
  async function loadDiaries() {
    setLoading(true);
    const data = await getInternshipDiaries();
    setDiaries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDiaries();
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

  function handleEditClick(d: InternshipDiary) {
    setForm({
      name: d.name,
      college: d.college,
      institute: d.institute,
      description: d.description,
      review: d.review,
      photoURL: d.photoURL ?? "",
      year: d.year || "2026",
    });
    setEditId(d.id!);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditId(null);
    setForm(blankForm());
  }

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoUploading(true);
    try {
      const url = await uploadToCloudinary(files[0]);
      set("photoURL", url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  /* ── submit ─────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!form.name.trim()) return alert("Name is required.");
    if (!form.review.trim()) return alert("Review is required.");

    const payload = {
      name: form.name,
      college: form.college,
      institute: form.institute,
      description: form.description,
      review: form.review,
      photoURL: form.photoURL,
      year: form.year,
    };

    try {
      if (editId) {
        await updateInternshipDiary(editId, payload);
      } else {
        await createInternshipDiary(payload);
      }
      closeForm();
      await loadDiaries();
    } catch {
      alert("Failed to save internship diary.");
    }
  }

  /* ── delete ─────────────────────────────────────────────────── */
  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this diary?")) return;
    try {
      await deleteInternshipDiary(id);
      await loadDiaries();
    } catch {
      alert("Failed to delete diary.");
    }
  }

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminNav />

        {/* header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-amber-300 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">
              Internship Diaries
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Manage student internship reviews and experiences.
            </p>
          </div>
          {!isFormOpen && (
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-500/20 transition-all"
            >
              + Add Diary
            </button>
          )}
        </div>

        {/* ── form ──────────────────────────────────────────────── */}
        {isFormOpen && (
          <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-2xl p-8 mb-10 bg-white/95">
            <h2 className="text-xl font-black text-slate-950 font-heading mb-6">
              {editId ? "Edit Internship Diary" : "New Internship Diary"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* name */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Yug Shankhala"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                />
              </div>

              {/* college */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Student College
                </label>
                <input
                  type="text"
                  value={form.college}
                  onChange={(e) => set("college", e.target.value)}
                  placeholder="e.g. SVNIT Surat"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                />
              </div>

              {/* institute */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Interned At (Institute)
                </label>
                <input
                  type="text"
                  value={form.institute}
                  onChange={(e) => set("institute", e.target.value)}
                  placeholder="e.g. IIT Bombay"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                />
              </div>

              {/* year */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Year
                </label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                />
              </div>

              {/* description */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="e.g. 2nd Year, Civil Engineering"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                />
              </div>

              {/* photo URL */}
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.photoURL}
                    onChange={(e) => set("photoURL", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 shadow-sm"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-200 text-slate-800 hover:bg-zinc-300 transition-colors disabled:opacity-50"
                  >
                    {photoUploading ? "..." : "Upload"}
                  </button>
                </div>
              </div>

              {/* review */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5 font-heading">
                  Review *
                </label>
                <textarea
                  value={form.review}
                  onChange={(e) => set("review", e.target.value)}
                  rows={4}
                  placeholder="Share their experience..."
                  className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-950 leading-relaxed shadow-sm"
                />
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
                {editId ? "Save Changes" : "Add Diary"}
              </button>
            </div>
          </div>
        )}

        {/* ── table ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : diaries.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-12 text-center">
            <p className="text-zinc-500">No internship diaries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-amber-300 bg-white shadow-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-100/70 text-left border-b border-amber-300 text-xs font-black uppercase text-amber-950 tracking-wider">
                  <th className="px-4 py-3 font-heading">Name</th>
                  <th className="px-4 py-3 font-heading">College</th>
                  <th className="px-4 py-3 font-heading">Institute</th>
                  <th className="px-4 py-3 font-heading">Year</th>
                  <th className="px-4 py-3 font-heading w-1/3">Review Snippet</th>
                  <th className="px-4 py-3 font-heading text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200 text-slate-900 font-semibold">
                {diaries.map((d) => (
                  <tr key={d.id} className="bg-white hover:bg-amber-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-950">{d.name}</div>
                      <div className="text-xs text-zinc-500">{d.description}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{d.college}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-700">{d.institute}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-700">{d.year || "2026"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500 italic max-w-xs truncate">
                      "{d.review}"
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id!)}
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
    </div>
  );
}
