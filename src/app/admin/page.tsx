"use client";

import { useEffect, useRef, useState } from "react";
import AdminNav from "../../components/AdminNav";
import { getEvents, createEvent, updateEvent, deleteEvent, Event } from "../../lib/eventsService";

// ─── Cloudinary uploader ────────────────────────────────────────────────────
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed: " + res.statusText);
  const data = await res.json();
  return data.secure_url as string;
}

// ─── Shared input / label className helpers ─────────────────────────────────
const inputCls =
  "w-full border border-zinc-300 dark:border-zinc-600 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500";
const labelCls = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5";

// ─── Format ISO string → datetime-local value ────────────────────────────────
function toLocalInput(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);

  // ── form fields ──
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [imageURLs, setImageURLs] = useState<string[]>([]); // managed as array
  const [type, setType] = useState<Event["type"]>("workshop");
  const [mode, setMode] = useState<Event["mode"]>("offline");
  const [venue, setVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [speakerNamesText, setSpeakerNamesText] = useState("");
  const [organizerIdsText, setOrganizerIdsText] = useState("");
  const [status, setStatus] = useState<Event["status"]>("upcoming");
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsText, setTagsText] = useState("");
  const [createdBy, setCreatedBy] = useState("admin");

  // ── upload state ──
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    try { setEvents(await getEvents()); }
    catch (err) { console.error("Error loading events:", err); }
    finally { setLoading(false); }
  }

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editModeId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const resetForm = () => {
    setEditModeId(null);
    setTitle(""); setSlug(""); setShortDescription(""); setDescription("");
    setCoverImageURL(""); setImageURLs([]);
    setType("workshop"); setMode("offline"); setVenue("");
    setStartDateTime(""); setEndDateTime(""); setRegistrationLink("");
    setRegistrationDeadline(""); setSpeakerNamesText(""); setOrganizerIdsText("");
    setStatus("upcoming"); setIsFeatured(false); setTagsText(""); setCreatedBy("admin");
    setIsFormOpen(false);
  };

  const handleEditClick = (ev: Event) => {
    setEditModeId(ev.id ?? null);
    setTitle(ev.title ?? "");
    setSlug(ev.slug ?? "");
    setShortDescription(ev.shortDescription ?? "");
    setDescription(ev.description ?? "");
    setCoverImageURL(ev.coverImageURL ?? "");
    setImageURLs(ev.imageURLs ?? []);
    setType(ev.type ?? "workshop");
    setMode(ev.mode ?? "offline");
    setVenue(ev.venue ?? "");
    setStartDateTime(toLocalInput(ev.startDateTime));
    setEndDateTime(toLocalInput(ev.endDateTime));
    setRegistrationLink(ev.registrationLink ?? "");
    setRegistrationDeadline(toLocalInput(ev.registrationDeadline));
    setSpeakerNamesText(ev.speakerNames?.join(", ") ?? "");
    setOrganizerIdsText(ev.organizerIds?.join(", ") ?? "");
    setStatus(ev.status ?? "upcoming");
    setIsFeatured(ev.isFeatured ?? false);
    setTagsText(ev.tags?.join(", ") ?? "");
    setCreatedBy(ev.createdBy ?? "admin");
    setIsFormOpen(true);
    // scroll to form
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try { await deleteEvent(id); alert("Deleted!"); loadEvents(); }
    catch { alert("Failed to delete."); }
  };

  // ── Cloudinary: cover upload ──
  const handleCoverUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCoverUploading(true);
    try {
      const url = await uploadToCloudinary(files[0]);
      setCoverImageURL(url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally { setCoverUploading(false); }
  };

  // ── Cloudinary: gallery upload (multiple) ──
  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setImageURLs(prev => [...prev, ...uploaded]);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally { setGalleryUploading(false); }
  };

  const removeGalleryImage = (idx: number) => {
    setImageURLs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !shortDescription || !description || !startDateTime || !endDateTime || !registrationLink) {
      alert("Please fill in all required (*) fields."); return;
    }
    const payload = {
      title, slug, shortDescription, description, coverImageURL, imageURLs,
      type, mode, venue,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      registrationLink,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : "",
      speakerNames: speakerNamesText.split(",").map(s => s.trim()).filter(Boolean),
      organizerIds: organizerIdsText.split(",").map(o => o.trim()).filter(Boolean),
      status, isFeatured,
      tags: tagsText.split(",").map(t => t.trim()).filter(Boolean),
      createdBy,
    };
    try {
      if (editModeId) { await updateEvent(editModeId, payload); alert("Event updated!"); }
      else { await createEvent(payload); alert("Event created!"); }
      resetForm(); loadEvents();
    } catch (err) {
      console.error(err); alert("Failed to save event.");
    }
  };

  const formatDate = (d: string) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">

      {/* ── Admin Sub-nav ── */}
      <AdminNav />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Admin Event Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Create, update, and manage all public events for Think India SVNIT.</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200">
            ➕ Add New Event
          </button>
        )}
      </div>

      {/* ── Form ── */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6">
            {editModeId ? "✏️ Edit Event Details" : "📝 Create New Event"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Event Title *</label>
                <input type="text" required placeholder="e.g. National Hackathon 2026"
                  value={title} onChange={e => handleTitleChange(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Slug (URL identifier) *</label>
                <input type="text" required placeholder="national-hackathon-2026"
                  value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className={inputCls} />
              </div>
            </div>

            {/* Short description */}
            <div>
              <label className={labelCls}>Short Description * (shown on listing card)</label>
              <input type="text" required placeholder="A nationwide hackathon for youth empowerment..."
                value={shortDescription} onChange={e => setShortDescription(e.target.value)} className={inputCls} />
            </div>

            {/* Full description */}
            <div>
              <label className={labelCls}>Full Event Description *</label>
              <textarea rows={5} required placeholder="Detailed overview, rules, timeline..."
                value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
            </div>

            {/* ── Cover Image ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Cover Image</label>

                {/* Preview */}
                {coverImageURL && (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImageURL} alt="Cover" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCoverImageURL("")}
                      className="absolute top-2 right-2 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-rose-700">
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleCoverUpload(e.target.files)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-zinc-700 dark:text-zinc-300">
                    {coverUploading ? "Uploading…" : "📤 Upload from PC"}
                  </button>
                  <span className="text-xs text-zinc-400 self-center">or paste URL below</span>
                </div>
                <input type="text" placeholder="https://res.cloudinary.com/…"
                  value={coverImageURL} onChange={e => setCoverImageURL(e.target.value)}
                  className={`${inputCls} mt-2`} />
              </div>

              {/* ── Gallery Images ── */}
              <div>
                <label className={labelCls}>Gallery Images</label>

                {imageURLs.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imageURLs.map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:bg-rose-700">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleGalleryUpload(e.target.files)} />
                <button type="button" onClick={() => galleryInputRef.current?.click()}
                  disabled={galleryUploading}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-zinc-700 dark:text-zinc-300 mb-2">
                  {galleryUploading ? "Uploading…" : "📤 Upload Images (multiple)"}
                </button>

                {/* Paste additional URLs */}
                <textarea rows={2} placeholder="Or paste image URLs one per line…"
                  value={imageURLs.join("\n")}
                  onChange={e => setImageURLs(e.target.value.split("\n").map(u => u.trim()).filter(Boolean))}
                  className={`${inputCls} text-xs`} />
              </div>
            </div>

            {/* Type, Mode, Venue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Event Type *</label>
                <select value={type} onChange={e => setType(e.target.value as Event["type"])} className={inputCls}>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition</option>
                  <option value="talk">Talk</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Mode *</label>
                <select value={mode} onChange={e => setMode(e.target.value as Event["mode"])} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Venue / Meeting Details</label>
                <input type="text" placeholder="e.g. LHC 102, SVNIT or MS Teams link"
                  value={venue} onChange={e => setVenue(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Start Date & Time *</label>
                <input type="datetime-local" required value={startDateTime}
                  onChange={e => setStartDateTime(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Date & Time *</label>
                <input type="datetime-local" required value={endDateTime}
                  onChange={e => setEndDateTime(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Registration Deadline</label>
                <input type="datetime-local" value={registrationDeadline}
                  onChange={e => setRegistrationDeadline(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Speakers, Organizers, Reg Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Speaker Names (comma separated)</label>
                <input type="text" placeholder="Dr. A. Kalam, Ms. R. Sharma"
                  value={speakerNamesText} onChange={e => setSpeakerNamesText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Organizer Names/IDs (comma separated)</label>
                <input type="text" placeholder="Club President, Tech Secretary"
                  value={organizerIdsText} onChange={e => setOrganizerIdsText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Google Form / Registration URL *</label>
                <input type="url" required placeholder="https://forms.gle/…"
                  value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Tags, Status, Featured */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Tags (comma separated)</label>
                <input type="text" placeholder="coding, innovation, svnit"
                  value={tagsText} onChange={e => setTagsText(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Event Status *</label>
                <select value={status} onChange={e => setStatus(e.target.value as Event["status"])} className={inputCls}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center pt-7">
                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Feature on homepage</span>
                </label>
              </div>
            </div>

            {/* Created By */}
            <div>
              <label className={labelCls}>Created By (Admin Username/Email)</label>
              <input type="text" placeholder="admin@thinkindia.org"
                value={createdBy} onChange={e => setCreatedBy(e.target.value)} className={inputCls} />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors">
                {editModeId ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Events Table ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            <span className="mt-4 text-sm text-zinc-500">Loading events…</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No events yet.</p>
            <p className="text-sm mt-1">Click &quot;Add New Event&quot; to create the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-xs font-black uppercase text-zinc-500 tracking-wider">
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Type & Mode</th>
                  <th className="py-4 px-6">Timings</th>
                  <th className="py-4 px-6">Time Status</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-zinc-800 dark:text-zinc-200">
                {events.map(ev => {
                  const isActive = ev.timeStatus === "active";
                  return (
                    <tr key={ev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-zinc-950 dark:text-white line-clamp-1">{ev.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 font-mono">/{ev.slug}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{ev.type}</span>
                        <span className="inline-block ml-2 px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{ev.mode}</span>
                      </td>
                      <td className="py-4 px-6 text-xs whitespace-nowrap">
                        <div>Start: {formatDate(ev.startDateTime)}</div>
                        <div className="mt-1">End: {formatDate(ev.endDateTime)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                          {isActive ? "Active" : "Past"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded uppercase ${
                          ev.status === "upcoming" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : ev.status === "ongoing" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : ev.status === "completed" ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleEditClick(ev)}
                          className="px-3 py-1 text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-700 dark:text-zinc-200">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(ev.id!)}
                          className="px-3 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 rounded transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
