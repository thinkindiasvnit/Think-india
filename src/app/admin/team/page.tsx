"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../../../components/AdminNav";
import { useRequireAdminAuth } from "../../../components/useRequireAdminAuth";
import { logoutAdmin } from "../../../lib/adminAuth";
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
  "w-full border border-amber-300 rounded-xl py-2.5 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder-slate-400 shadow-sm";
const labelCls =
  "block text-sm font-extrabold text-slate-800 mb-1.5";

// ─── Blank form ───────────────────────────────────────────────────────────────
const blankForm = () => ({
  name: "",
  designation: "Core" as Designation,
  position: "",
  photoURL: "",
  description: "",
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
  const router = useRouter();
  const admin = useRequireAdminAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [photoUploading, setPhotoUploading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("all");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => { logoutAdmin(); router.replace("/admin/login"); };

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
      description: m.description ?? "",
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
      description: form.description.trim(),
      userId: form.userId?.trim() || null,
      teamOrder: Number(form.teamOrder) || 1,
      overallOrder: Number(form.overallOrder) || 1,
      sessionYear: form.sessionYear.trim(),
      isCurrent: true,
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

  if (!admin) return null;
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans pt-32 pb-10 selection:bg-amber-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Admin Sub-nav ── */}
        <AdminNav />

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-300 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">Team Management</h1>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Add, update, and manage core executive committee members for Think India SVNIT.
            </p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200 border border-amber-500"
            >
              + Add Member
            </button>
          )}
        </div>

        {/* ── Form ── */}
        {isFormOpen && (
          <div className="bg-white/95 rounded-3xl border border-amber-300 shadow-2xl p-6 sm:p-8 mb-10">
            <h2 className="text-xl font-black text-slate-950 font-heading mb-6">
              {editId ? "Edit Team Member" : "Add New Member"}
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
                  <p className="mt-1 text-xs text-slate-500 font-semibold">Used to group members on the page</p>
                </div>
                <div>
                  <label className={labelCls}>Position * <span className="font-normal text-slate-400">(role title)</span></label>
                  <input
                    type="text" required placeholder="e.g. Technical Head, President"
                    value={form.position} onChange={(e) => setField("position", e.target.value)}
                    className={inputCls}
                  />
                  <p className="mt-1 text-xs text-slate-500 font-semibold">Displayed on the member card</p>
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className={labelCls}>
                  Description / Bio{" "}
                  <span className="font-normal text-slate-400">(optional — short member bio)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a short summary about the member..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Photo */}
              <div>
                <label className={labelCls}>Profile Photo</label>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-300 flex-shrink-0 bg-amber-50 flex items-center justify-center shadow-sm">
                    {form.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-amber-700 text-2xl font-bold">👤</span>
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
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-300 hover:bg-amber-50 disabled:opacity-50 transition-colors text-slate-700 bg-white shadow-sm"
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
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
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
                  <label className={labelCls}>Team Order <span className="font-normal text-slate-400">(within group)</span></label>
                  <input
                    type="number" min={1} value={form.teamOrder}
                    onChange={(e) => setField("teamOrder", Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Overall Order <span className="font-normal text-slate-400">(card position)</span></label>
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
                    <label className="block text-xs font-extrabold text-blue-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url" placeholder="https://linkedin.com/in/username"
                      value={form.linkedin} onChange={(e) => setField("linkedin", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-amber-800 mb-1">Email Address</label>
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
                  <span className="font-normal text-slate-400">(optional — if member has an app account)</span>
                </label>
                <input
                  type="text" placeholder="Firebase user UID"
                  value={form.userId ?? ""}
                  onChange={(e) => setField("userId", e.target.value || null)}
                  className={inputCls}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-amber-200">
                <button
                  type="button" onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-amber-300 text-sm font-bold text-slate-700 hover:bg-amber-50 transition-colors bg-white shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors border border-amber-500"
                >
                  {editId ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Table Section ── */}
        <div className="bg-white rounded-3xl border border-amber-300 shadow-xl overflow-hidden">

          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-amber-200 bg-amber-50/50">
            <p className="text-sm font-bold text-slate-700">
              {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
              {filterYear !== "all" ? ` · ${filterYear}` : " · all years"}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Session Year:
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="border border-amber-300 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 shadow-sm"
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
              <span className="mt-4 text-sm font-bold text-slate-800">Loading members…</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-slate-700">
              <p className="text-lg font-bold text-slate-950 font-heading">No members found.</p>
              <p className="text-sm mt-1">Click &quot;Add Member&quot; to add the first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/70 border-b border-amber-300 text-xs font-black uppercase text-amber-950 tracking-wider font-heading">
                    <th className="py-4 px-6">Member</th>
                    <th className="py-4 px-6">Designation</th>
                    <th className="py-4 px-6">Position</th>
                    <th className="py-4 px-6">Session</th>
                    <th className="py-4 px-6">Order</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200 text-sm text-slate-900 font-semibold">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-amber-50/60 transition-colors">
                      {/* Member */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-sm border border-amber-400">
                            {m.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.photoURL} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                            )}
                          </div>
                          <span className="font-extrabold text-slate-950 font-heading">{m.name}</span>
                        </div>
                      </td>
                      {/* Designation */}
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase rounded shadow-sm ${
                          m.designation === "Core"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}>
                          {m.designation}
                        </span>
                      </td>
                      {/* Position */}
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {m.position}
                      </td>
                      {/* Session */}
                      <td className="py-4 px-6 font-bold text-slate-700">
                        {m.sessionYear}
                      </td>
                      {/* Order */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <div>Overall: <span className="font-bold text-slate-700">{m.overallOrder}</span></div>
                        <div>Team: <span className="font-bold text-slate-700">{m.teamOrder}</span></div>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="px-3 py-1 text-xs font-bold border border-amber-300 hover:bg-amber-50 rounded-lg transition-colors text-slate-700 bg-white shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(m.id!)}
                          className="px-3 py-1 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shadow-sm"
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
    </div>
  );
}