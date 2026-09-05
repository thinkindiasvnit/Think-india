"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../../../components/AdminNav";
import { useRequireAdminAuth } from "../../../components/useRequireAdminAuth";
import { logoutAdmin } from "../../../lib/adminAuth";
import {
  getAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPhotos,
  addPhoto,
  deletePhoto,
  Album,
  Photo,
  AlbumCategory,
  ALBUM_CATEGORIES,
  CATEGORY_LABELS,
} from "../../../lib/galleryService";

// ─── Cloudinary uploader ─────────────────────────────────────────────────────
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url as string;
}

// ─── Style helpers ───────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-zinc-300 dark:border-zinc-600 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500";
const labelCls =
  "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5";

// ─── Blank form factory ───────────────────────────────────────────────────────
const blankForm = () => ({
  title: "",
  description: "",
  coverImageURL: "",
  eventId: "",
  category: "other" as AlbumCategory,
  takenAt: new Date().toISOString().slice(0, 10),
  createdBy: "admin",
  isPublished: false,
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminGalleryPage() {
  const router = useRouter();
  const admin = useRequireAdminAuth();

  // ── Albums state ──
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Form state ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());

  // ── Photo management state ──
  const [managingAlbum, setManagingAlbum] = useState<Album | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosUploading, setPhotosUploading] = useState(false);

  // ── Cover upload ──
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => { logoutAdmin(); router.replace("/admin/login"); };

  useEffect(() => { loadAlbums(); }, []);

  // ─── Load albums ─────────────────────────────────────────────────────────
  async function loadAlbums() {
    setLoading(true);
    try { setAlbums(await getAllAlbums()); }
    catch (err) { console.error("Error loading albums:", err); }
    finally { setLoading(false); }
  }

  // ─── Load photos for an album ─────────────────────────────────────────────
  async function loadPhotos(albumId: string) {
    setPhotosLoading(true);
    try { setPhotos(await getPhotos(albumId)); }
    catch (err) { console.error("Error loading photos:", err); }
    finally { setPhotosLoading(false); }
  }

  // ─── Manage photos panel ──────────────────────────────────────────────────
  function handleManagePhotos(album: Album) {
    setManagingAlbum(album);
    loadPhotos(album.id!);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  // ─── Photo upload ─────────────────────────────────────────────────────────
  async function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0 || !managingAlbum) return;
    setPhotosUploading(true);
    try {
      const fileArray = Array.from(files);
      const urls = await Promise.all(fileArray.map(uploadToCloudinary));
      const currentAlbum = albums.find((a) => a.id === managingAlbum.id);
      const hasCover = !!currentAlbum?.coverImageURL;
      await Promise.all(
        urls.map((url, i) =>
          addPhoto(managingAlbum.id!, {
            imageURL: url,
            thumbnailURL: url,
            caption: null,
            uploadedBy: "admin",
            order: (photos?.length ?? 0) + i,
          })
        )
      );
      if (!hasCover && urls.length > 0) {
        await updateAlbum(managingAlbum.id!, { coverImageURL: urls[0] });
        setManagingAlbum((prev) => prev ? { ...prev, coverImageURL: urls[0] } : prev);
      }
      await loadPhotos(managingAlbum.id!);
      await loadAlbums();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Photo upload failed");
    } finally {
      setPhotosUploading(false);
      if (photosInputRef.current) photosInputRef.current.value = "";
    }
  }

  // ─── Delete photo ─────────────────────────────────────────────────────────
  async function handleDeletePhoto(photoId: string) {
    if (!managingAlbum) return;
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    try {
      await deletePhoto(managingAlbum.id!, photoId);
      await loadPhotos(managingAlbum.id!);
      await loadAlbums();
    } catch (err) { console.error(err); alert("Failed to delete photo."); }
  }

  // ─── Delete album ─────────────────────────────────────────────────────────
  async function handleDeleteAlbum(id: string) {
    if (!confirm("Delete this album and all its photos? This cannot be undone.")) return;
    try { await deleteAlbum(id); alert("Album deleted!"); loadAlbums(); }
    catch { alert("Failed to delete album."); }
  }

  // ─── Edit album ───────────────────────────────────────────────────────────
  function handleEditClick(album: Album) {
    setEditId(album.id ?? null);
    setForm({
      title: album.title,
      description: album.description,
      coverImageURL: album.coverImageURL,
      eventId: album.eventId ?? "",
      category: album.category,
      takenAt: album.takenAt ? album.takenAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      createdBy: album.createdBy,
      isPublished: album.isPublished,
    });
    setIsFormOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  // ─── Reset form ───────────────────────────────────────────────────────────
  function resetForm() {
    setEditId(null);
    setForm(blankForm());
    setIsFormOpen(false);
  }

  // ─── Cover image upload ───────────────────────────────────────────────────
  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setCoverUploading(true);
    try {
      const url = await uploadToCloudinary(files[0]);
      setForm((f) => ({ ...f, coverImageURL: url }));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally { setCoverUploading(false); }
  }

  // ─── Submit form ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.category || !form.takenAt) {
      alert("Please fill in all required (*) fields."); return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      coverImageURL: form.coverImageURL,
      eventId: form.eventId || null,
      category: form.category,
      takenAt: new Date(form.takenAt).toISOString(),
      createdBy: form.createdBy,
      isPublished: form.isPublished,
    };
    try {
      if (editId) { await updateAlbum(editId, payload); alert("Album updated!"); }
      else { await createAlbum(payload); alert("Album created!"); }
      resetForm(); loadAlbums();
    } catch (err) { console.error(err); alert("Failed to save album."); }
  }

  if (!admin) return null;
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans pt-32 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminNav />

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-300 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">Gallery Management</h1>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Manage photo albums and upload images for Think India SVNIT.
            </p>
          </div>
        {!isFormOpen && !managingAlbum && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            &#43; Add Album
          </button>
        )}
      </div>

      {/* ── Album Form ── */}
      {isFormOpen && (
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-2xl p-6 sm:p-8 mb-10 bg-white/95">
          <h2 className="text-xl font-black text-slate-950 font-heading mb-6">
            {editId ? "Edit Album" : "Create New Album"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text" required placeholder="e.g. Annual Fest 2026"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3} placeholder="Brief description of this album..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Category *</label>
                <select required value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AlbumCategory }))}
                  className={inputCls}
                >
                  {ALBUM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date Taken *</label>
                <input type="date" required value={form.takenAt}
                  onChange={(e) => setForm((f) => ({ ...f, takenAt: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className={labelCls}>Cover Image</label>
              {form.coverImageURL && (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 h-36 w-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImageURL} alt="Cover preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, coverImageURL: "" }))}
                    className="absolute top-2 right-2 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-rose-700">
                    &#10005;
                  </button>
                </div>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleCoverUpload(e.target.files)} />
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-zinc-700 dark:text-zinc-300">
                  {coverUploading ? "Uploading..." : "Upload from PC"}
                </button>
                <span className="text-xs text-zinc-400">or paste URL below</span>
              </div>
              <input type="text" placeholder="https://res.cloudinary.com/..."
                value={form.coverImageURL}
                onChange={(e) => setForm((f) => ({ ...f, coverImageURL: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Event ID & Created By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Event ID (optional &mdash; link to event)</label>
                <input type="text" placeholder="e.g. abc123EventDocId"
                  value={form.eventId}
                  onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Created By</label>
                <input type="text" placeholder="admin"
                  value={form.createdBy}
                  onChange={(e) => setForm((f) => ({ ...f, createdBy: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Published */}
            <div>
              <label className="inline-flex items-center cursor-pointer gap-2">
                <input type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-5 h-5 accent-amber-600"
                />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Published (visible to public)
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors">
                {editId ? "Save Changes" : "Create Album"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Photos Management Panel ── */}
      {managingAlbum && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                Photos in:{" "}
                <span className="text-amber-600">{managingAlbum.title}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => { setManagingAlbum(null); setPhotos([]); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              &#8592; Back to Albums
            </button>
          </div>

          {/* Multi-photo upload */}
          <div className="mb-6">
            <input ref={photosInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files)} />
            <button type="button" onClick={() => photosInputRef.current?.click()}
              disabled={photosUploading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 border-dashed border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50 transition-all duration-200">
              {photosUploading ? (
                <><span className="inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> Uploading photos...</>
              ) : (
                <>Upload Photos (select multiple)</>
              )}
            </button>
            <p className="text-xs text-zinc-400 mt-2">
              Select multiple images at once. First image will be set as cover if album has none.
            </p>
          </div>

          {/* Photo grid */}
          {photosLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
              <span className="mt-4 text-sm text-zinc-500">Loading photos...</span>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl">
              <p className="text-4xl mb-3">&#127758;</p>
              <p className="text-sm font-semibold">No photos yet.</p>
              <p className="text-xs mt-1">Upload some photos to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id}
                  className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailURL || photo.imageURL}
                      alt={photo.caption ?? "Photo"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(photo.id!)}
                    className="absolute top-2 right-2 w-7 h-7 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    title="Delete photo">
                    &#10005;
                  </button>
                  {photo.caption && (
                    <div className="px-2 py-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 truncate border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Albums Table ── */}
      {!managingAlbum && (
        <div className="bg-white border border-amber-300 rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
              <span className="mt-4 text-sm font-bold text-slate-800">Loading albums...</span>
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-16 text-slate-700">
              <p className="text-4xl mb-3">&#128194;</p>
              <p className="text-lg font-bold text-slate-950 font-heading">No albums yet.</p>
              <p className="text-sm mt-1">Click &quot;Add Album&quot; to create the first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/70 border-b border-amber-300 text-xs font-black uppercase text-amber-950 tracking-wider font-heading">
                    <th className="py-4 px-4">Cover</th>
                    <th className="py-4 px-4">Title &amp; Description</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Photos</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200 text-sm text-slate-900 font-semibold">
                  {albums.map((album) => (
                    <tr key={album.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      {/* Cover thumbnail */}
                      <td className="py-3 px-4">
                        {album.coverImageURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={album.coverImageURL} alt={album.title}
                            className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                            {album.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Title + Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-zinc-950 dark:text-white line-clamp-1">{album.title}</div>
                        {album.description && (
                          <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{album.description}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {CATEGORY_LABELS[album.category]}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {album.takenAt
                          ? new Date(album.takenAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Photo count */}
                      <td className="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        {album.imageCount} photo{album.imageCount !== 1 ? "s" : ""}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {album.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleEditClick(album)}
                          className="px-3 py-1.5 text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-700 dark:text-zinc-200">
                          Edit
                        </button>
                        <button onClick={() => handleManagePhotos(album)}
                          className="px-3 py-1.5 text-xs font-bold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors text-amber-700 dark:text-amber-400">
                          Photos
                        </button>
                        <button onClick={() => handleDeleteAlbum(album.id!)}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg transition-colors">
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
      )}
    </div>
    </div>
  );
}
