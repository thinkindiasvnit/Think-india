"use client";

import { useEffect, useRef, useState } from "react";
import AdminNav from "../../../components/AdminNav";
import {
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  TeamMember,
  Designation,
  DESIGNATIONS,
} from "../../../lib/teamService";

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

// ─── Shared class helpers ─────────────────────────────────────────────────────
const inputCls =
  "w-full border border-zinc-300 dark:border-zinc-600 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500";
const labelCls =
  "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5";

// ─── Blank form ───────────────────────────────────────────────────────────────
const blankForm = () => ({
  name: "",
  designation: "Core" as Designation,
  position: "",
  photoURL: "",
  userId: "" as string | null,
  teamOrder: 1,
  overallOrder: 1,
  sessionYear: "",
  linkedin: "",
  email: "",
});

type FormState = ReturnType<typeof blankForm>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [photoUploading, setPhotoUploading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("all");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    setLoading(true);
    try { setMembers(await getAllTeamMembers()); }
    catch (err) { console.error("Error loading team members:", err); }
    finally { setLoading(false); }
  }

  // Unique session years from loaded data (desc)
  const sessionYears = Array.from(
    new Set(members.map((m) => m.sessionYear).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const filteredMembers =
    filterYear === "all"
      ? members
      : members.filter((m) => m.sessionYear === filterYear);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const resetForm = () => {
    setEditId(null);
    setForm(blankForm());
    setIsFormOpen(false);
  };

  const handleEditClick = (m: TeamMember) => {
    setEditId(m.id ?? null);
    setForm({
      name: m.name,
      designation: m.designation,
      position: m.position,
      photoURL: m.photoURL,
      userId: m.userId ?? "",
      teamOrder: m.teamOrder,
      overallOrder: m.overallOrder,
      sessionYear: m.sessionYear,
      linkedin: m.socialLinks.linkedin,
      email: m.socialLinks.email,
    });
    setIsFormOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Delete this member? This cannot be undone.")) return;
    try { await deleteTeamMember(id); alert("Deleted!"); loadMembers(); }
    catch { alert("Failed to delete."); }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoUploading(true);
    try {
      setField("photoURL", await uploadToCloudinary(files[0]));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally { setPhotoUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.position || !form.sessionYear) {
      alert("Please fill in all required (*) fields.");
      return;
    }
    const payload: Omit<TeamMember, "id" | "createdAt" | "updatedAt"> = {
      name: form.name.trim(),
      designation: form.designation,
      position: form.position.trim(),
      photoURL: form.photoURL.trim(),
      userId: form.userId?.trim() || null,
      teamOrder: Number(form.teamOrder) || 1,
      overallOrder: Number(form.overallOrder) || 1,
      sessionYear: form.sessionYear.trim(),
      isCurrent: true,  // always true when added/edited from admin
      socialLinks: {
        linkedin: form.linkedin.trim(),
        email: form.email.trim(),
      },
    };
    try {
      if (editId) { await updateTeamMember(editId, payload); alert("Member updated!"); }
      else { await createTeamMember(payload); alert("Member added!"); }
      resetForm();
      loadMembers();
    } catch (err) {
      console.error(err);
      alert("Failed to save member.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">

      {/* ── Admin Sub-nav ── */}
      <AdminNav />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Team Members</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add, update, and manage all team members for Think India SVNIT.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            ➕ Add Member
          </button>
        )}
      </div>

      {/* ── Form ── */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6">
            {editId ? "✏️ Edit Team Member" : "📝 Add New Member"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                type="text" required placeholder="e.g. Ananya Sharma"
                value={form.name} onChange={(e) => setField("name", e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Designation + Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Designation *</label>
                <select
                  value={form.designation}
                  onChange={(e) => setField("designation", e.target.value as Designation)}
                  className={inputCls}
                >
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-400">Used to group members on the page</p>
              </div>
              <div>
                <label className={labelCls}>Position * <span className="font-normal text-zinc-400">(role title)</span></label>
                <input
                  type="text" required placeholder="e.g. Technical Head, President"
                  value={form.position} onChange={(e) => setField("position", e.target.value)}
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-zinc-400">Displayed on the member card</p>
              </div>
            </div>

            {/* Photo */}
            <div>
              <label className={labelCls}>Profile Photo</label>
              <div className="flex items-start gap-4">
                {/* Preview circle */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {form.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoURL} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-400 text-3xl">👤</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={photoInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                  />
                  <button
                    type="button" onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    {photoUploading ? "Uploading…" : "📤 Upload Photo"}
                  </button>
                  <input
                    type="text" placeholder="Or paste image URL…"
                    value={form.photoURL} onChange={(e) => setField("photoURL", e.target.value)}
                    className={inputCls}
                  />
                  {form.photoURL && (
                    <button
                      type="button" onClick={() => setField("photoURL", "")}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      ✕ Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Session Year + Orders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Session Year *</label>
                <input
                  type="text" required placeholder="2024-25"
                  value={form.sessionYear} onChange={(e) => setField("sessionYear", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Team Order <span className="font-normal text-zinc-400">(within group)</span></label>
                <input
                  type="number" min={1} value={form.teamOrder}
                  onChange={(e) => setField("teamOrder", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Overall Order <span className="font-normal text-zinc-400">(card position)</span></label>
                <input
                  type="number" min={1} value={form.overallOrder}
                  onChange={(e) => setField("overallOrder", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className={labelCls}>Social Links</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-600 mb-1">LinkedIn URL</label>
                  <input
                    type="url" placeholder="https://linkedin.com/in/username"
                    value={form.linkedin} onChange={(e) => setField("linkedin", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-600 mb-1">Email Address</label>
                  <input
                    type="email" placeholder="member@svnit.ac.in"
                    value={form.email} onChange={(e) => setField("email", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Optional userId */}
            <div>
              <label className={labelCls}>
                User ID{" "}
                <span className="font-normal text-zinc-400">(optional — if member has an app account)</span>
              </label>
              <input
                type="text" placeholder="Firebase user UID"
                value={form.userId ?? ""}
                onChange={(e) => setField("userId", e.target.value || null)}
                className={inputCls}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors"
              >
                {editId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
            {filterYear !== "all" ? ` · ${filterYear}` : " · all years"}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Session Year:
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-zinc-300 dark:border-zinc-600 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="all">All Years</option>
              {sessionYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            <span className="mt-4 text-sm text-zinc-500">Loading members…</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No members found.</p>
            <p className="text-sm mt-1">Click &quot;Add Member&quot; to add the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-xs font-black uppercase text-zinc-500 tracking-wider">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Session</th>
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-zinc-800 dark:text-zinc-200">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Member */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                          {m.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photoURL} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-zinc-950 dark:text-white">{m.name}</span>
                      </div>
                    </td>
                    {/* Designation */}
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded ${
                        m.designation === "Core"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}>
                        {m.designation}
                      </span>
                    </td>
                    {/* Position */}
                    <td className="py-4 px-6 text-zinc-700 dark:text-zinc-300 font-medium">
                      {m.position}
                    </td>
                    {/* Session */}
                    <td className="py-4 px-6 font-semibold text-zinc-700 dark:text-zinc-300">
                      {m.sessionYear}
                    </td>
                    {/* Order */}
                    <td className="py-4 px-6 text-xs text-zinc-400">
                      <div>Overall: <span className="font-bold text-zinc-600 dark:text-zinc-300">{m.overallOrder}</span></div>
                      <div>Team: <span className="font-bold text-zinc-600 dark:text-zinc-300">{m.teamOrder}</span></div>
                    </td>
                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(m)}
                        className="px-3 py-1 text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-700 dark:text-zinc-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(m.id!)}
                        className="px-3 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 rounded transition-colors"
                      >
                        Delete
                      </button>
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
