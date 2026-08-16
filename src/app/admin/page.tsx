"use client";

import { useEffect, useRef, useState } from "react";
import AdminNav from "../../components/AdminNav";
import { getEvents, createEvent, updateEvent, deleteEvent, seedSampleEvents, getEventRegistrations, Event, EventRegistration, SpeakerDetail, ScheduleItem, OrganizerDetail } from "../../lib/eventsService";
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconMic,
  IconClock,
  IconTag,
  IconSparkles,
  IconPlus,
  IconEdit,
  IconTrash,
  IconTicket,
  IconCheck,
  IconX,
  IconUserCheck,
  IconLayers,
  IconLaptop,
  IconAward,
  IconShieldCheck
} from "../../components/Icons";

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

const inputCls =
  "w-full border border-zinc-300 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500";
const labelCls = "block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5";

function toLocalInput(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);

  // Registrations inspection state
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState<Event | null>(null);
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [type, setType] = useState<Event["type"]>("workshop");
  const [genre, setGenre] = useState<Event["genre"]>("general");
  const [mode, setMode] = useState<Event["mode"]>("offline");
  const [venue, setVenue] = useState("");
  const [locationMapURL, setLocationMapURL] = useState("");
  const [fee, setFee] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [registrationType, setRegistrationType] = useState<Event["registrationType"]>("both");
  const [status, setStatus] = useState<Event["status"]>("upcoming");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [createdBy, setCreatedBy] = useState("admin@thinkindiasvnit.org");

  const [speakerDetails, setSpeakerDetails] = useState<SpeakerDetail[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [organizersDetails, setOrganizersDetails] = useState<OrganizerDetail[]>([]);

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
    setType("workshop"); setGenre("general"); setMode("offline"); setVenue(""); setLocationMapURL("");
    setFee(""); setEligibility("");
    setStartDateTime(""); setEndDateTime(""); setRegistrationLink("");
    setRegistrationDeadline(""); setRegistrationType("both");
    setSpeakerDetails([]); setScheduleItems([]); setOrganizersDetails([]);
    setStatus("upcoming"); setIsFeatured(false); setIsAnnouncement(false); setAnnouncementText(""); setTagsText(""); setCreatedBy("admin@thinkindiasvnit.org");
    setIsFormOpen(false);
  };

  const prefillSampleTemplate = () => {
    setTitle("TechVardhan 2026: SVNIT National Innovation Summit");
    setSlug("techvardhan-2026-national-summit");
    setShortDescription("National student symposium featuring prototype exhibitions, keynotes on deeptech, and research awards.");
    setDescription("Think India SVNIT presents 'TechVardhan 2026', bringing together student researchers, innovators, and industry leaders to showcase breakthrough technical solutions for national challenges.");
    setCoverImageURL("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop");
    setImageURLs([
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop"
    ]);
    setType("talk"); setGenre("tech"); setMode("hybrid"); setVenue("SVNIT Main Auditorium & MS Teams");
    setLocationMapURL("https://maps.google.com/?q=SVNIT+Surat");
    setFee("Free for All Delegates"); setEligibility("Open to UG/PG Students & Faculty");
    
    const now = new Date();
    const start = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    const end = new Date(now.getTime() + 8 * 24 * 3600 * 1000);
    const deadline = new Date(now.getTime() + 6 * 24 * 3600 * 1000);

    setStartDateTime(toLocalInput(start.toISOString()));
    setEndDateTime(toLocalInput(end.toISOString()));
    setRegistrationDeadline(toLocalInput(deadline.toISOString()));
    setRegistrationLink("https://forms.gle/thinkindia-techvardhan-2026");
    setRegistrationType("both");

    setSpeakerDetails([
      { name: "Dr. K. Sivan", role: "Former Chairman", organization: "ISRO", imageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
      { name: "Prof. R. Sharma", role: "Director", organization: "SVNIT Surat", imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" }
    ]);

    setScheduleItems([
      { time: "10:00 AM", title: "Keynote Address: Space Technology for India", description: "Dr. K. Sivan shares insights on Indian space initiatives." },
      { time: "02:00 PM", title: "Project Exhibition & Jury Round", description: "Evaluation of 50 student prototypes." }
    ]);

    setOrganizersDetails([
      { name: "Divyansh Kumar", role: "President, Think India SVNIT", contact: "+91 98765 00000" },
      { name: "Aesha Shah", role: "Tech Lead", contact: "tech@thinkindiasvnit.org" }
    ]);

    setStatus("upcoming"); setIsFeatured(true); setIsAnnouncement(true); setAnnouncementText("TechVardhan 2026 details are live! Check out the official schedule."); setTagsText("Innovation, SVNIT, Deeptech, National");
    setIsFormOpen(true);
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
    setGenre(ev.genre ?? "general");
    setMode(ev.mode ?? "offline");
    setVenue(ev.venue ?? "");
    setLocationMapURL(ev.locationMapURL ?? "");
    setFee(ev.fee ?? "");
    setEligibility(ev.eligibility ?? "");
    setStartDateTime(toLocalInput(ev.startDateTime));
    setEndDateTime(toLocalInput(ev.endDateTime));
    setRegistrationLink(ev.registrationLink ?? "");
    setRegistrationDeadline(toLocalInput(ev.registrationDeadline));
    setRegistrationType(ev.registrationType ?? "both");
    
    setSpeakerDetails(ev.speakerDetails ?? ev.speakerNames?.map(s => ({ name: s })) ?? []);
    setScheduleItems(ev.schedule ?? []);
    setOrganizersDetails(ev.organizersDetails ?? ev.organizerIds?.map(o => ({ name: o })) ?? []);
    
    setStatus(ev.status ?? "upcoming");
    setIsFeatured(ev.isFeatured ?? false);
    setIsAnnouncement(ev.isAnnouncement ?? false);
    setAnnouncementText(ev.announcementText ?? "");
    setTagsText(ev.tags?.join(", ") ?? "");
    setCreatedBy(ev.createdBy ?? "admin@thinkindiasvnit.org");
    setIsFormOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openRegistrationsModal = async (ev: Event) => {
    setViewingRegistrationsEvent(ev);
    const regs = await getEventRegistrations(ev.id || ev.slug);
    setRegistrationsList(regs);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try { await deleteEvent(id); alert("Deleted!"); loadEvents(); }
    catch { alert("Failed to delete."); }
  };

  const handleResetSampleEvents = () => {
    if (confirm("Reset local events data to sample showcase events?")) {
      seedSampleEvents();
      loadEvents();
      alert("Sample events seeded successfully!");
    }
  };

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

  const addSpeaker = () => setSpeakerDetails(prev => [...prev, { name: "", role: "", organization: "", imageURL: "" }]);
  const removeSpeaker = (i: number) => setSpeakerDetails(prev => prev.filter((_, idx) => idx !== i));

  const addScheduleItem = () => setScheduleItems(prev => [...prev, { time: "", title: "", description: "" }]);
  const removeScheduleItem = (i: number) => setScheduleItems(prev => prev.filter((_, idx) => idx !== i));

  const addOrganizer = () => setOrganizersDetails(prev => [...prev, { name: "", role: "", contact: "" }]);
  const removeOrganizer = (i: number) => setOrganizersDetails(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !shortDescription || !description || !startDateTime || !endDateTime) {
      alert("Please fill in all required (*) fields."); return;
    }

    const speakerNames = speakerDetails.map(s => s.name).filter(Boolean);
    const organizerIds = organizersDetails.map(o => o.name).filter(Boolean);

    const payload = {
      title, slug, shortDescription, description, coverImageURL, imageURLs,
      type, genre, mode, venue, locationMapURL, fee, eligibility,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      registrationLink,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : "",
      registrationType,
      speakerNames,
      speakerDetails: speakerDetails.filter(s => s.name),
      schedule: scheduleItems.filter(s => s.title),
      organizerIds,
      organizersDetails: organizersDetails.filter(o => o.name),
      status, isFeatured, isAnnouncement, announcementText,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 font-sans">

      <AdminNav />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white font-heading">Admin Event Management</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage events, track registrations, and publish conclaves for Think India SVNIT.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSampleEvents}
            className="px-4 py-2.5 rounded-xl font-bold border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            🌱 Reset Sample Events
          </button>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
            >
              <IconPlus size={16} /> Add New Event
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 mb-10">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white font-heading flex items-center gap-2">
              <IconEdit size={20} className="text-amber-500" />
              {editModeId ? "Edit Event Details" : "Create New Event"}
            </h2>
            {!editModeId && (
              <button
                type="button"
                onClick={prefillSampleTemplate}
                className="px-3.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
              >
                Autofill Template
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

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

            <div>
              <label className={labelCls}>Short Description * (shown on preview cards)</label>
              <input type="text" required placeholder="A nationwide hackathon for youth empowerment..."
                value={shortDescription} onChange={e => setShortDescription(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Full Event Overview / Description *</label>
              <textarea rows={5} required placeholder="Detailed overview, agenda highlights, rules..."
                value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
            </div>

            {/* Cover & Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Cover Image</label>
                {coverImageURL && (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImageURL} alt="Cover" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCoverImageURL("")}
                      className="absolute top-2 right-2 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-rose-700">
                      <IconX size={12} />
                    </button>
                  </div>
                )}
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleCoverUpload(e.target.files)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-zinc-700 dark:text-zinc-300">
                    {coverUploading ? "Uploading…" : "📤 Upload Cover Photo"}
                  </button>
                </div>
                <input type="text" placeholder="https://images.unsplash.com/…"
                  value={coverImageURL} onChange={e => setCoverImageURL(e.target.value)}
                  className={`${inputCls} mt-2`} />
              </div>

              <div>
                <label className={labelCls}>Gallery Photos</label>
                {imageURLs.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imageURLs.map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:bg-rose-700">
                          <IconX size={10} />
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
                  {galleryUploading ? "Uploading…" : "📤 Upload Multiple Photos"}
                </button>
                <textarea rows={2} placeholder="Or paste photo URLs one per line…"
                  value={imageURLs.join("\n")}
                  onChange={e => setImageURLs(e.target.value.split("\n").map(u => u.trim()).filter(Boolean))}
                  className={`${inputCls} text-xs`} />
              </div>
            </div>

            {/* Type, Genre, Mode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelCls}>Event Type *</label>
                <select value={type} onChange={e => setType(e.target.value as Event["type"])} className={inputCls}>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition / Hackathon</option>
                  <option value="talk">Talk / Conclave</option>
                  <option value="social">Social Drive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Genre Tag *</label>
                <select value={genre} onChange={e => setGenre(e.target.value as Event["genre"])} className={inputCls}>
                  <option value="general">General</option>
                  <option value="tech">Technology & AI</option>
                  <option value="leadership">Leadership & Policy</option>
                  <option value="workshop">Skill Workshops</option>
                  <option value="cultural">Social & Cultural</option>
                  <option value="research">Research & IPR</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Mode *</label>
                <select value={mode} onChange={e => setMode(e.target.value as Event["mode"])} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="offline">Offline (On Campus)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Registration Type</label>
                <select value={registrationType} onChange={e => setRegistrationType(e.target.value as Event["registrationType"])} className={inputCls}>
                  <option value="both">Internal Site + External Form</option>
                  <option value="internal">Internal Ticket Registration</option>
                  <option value="external">External Link Only</option>
                </select>
              </div>
            </div>

            {/* Dates, Location & Eligibility */}
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
                <label className={labelCls}>Venue Location</label>
                <input type="text" placeholder="SVNIT Main Auditorium"
                  value={venue} onChange={e => setVenue(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Google Maps Directions Link</label>
                <input type="url" placeholder="https://maps.google.com/?q=..."
                  value={locationMapURL} onChange={e => setLocationMapURL(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Eligibility Criteria</label>
                <input type="text" placeholder="Open to all College Students & Researchers"
                  value={eligibility} onChange={e => setEligibility(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Official / External Link</label>
                <input type="url" placeholder="https://forms.gle/…"
                  value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Speakers Builder */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <IconMic size={16} className="text-amber-500" /> Speaker Details
                </label>
                <button type="button" onClick={addSpeaker} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Add Speaker
                </button>
              </div>
              {speakerDetails.map((sp, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <input type="text" placeholder="Speaker Name *" value={sp.name} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].name = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <input type="text" placeholder="Role / Designation" value={sp.role || ""} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].role = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <input type="text" placeholder="Organization" value={sp.organization || ""} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].organization = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Photo URL" value={sp.imageURL || ""} onChange={e => {
                      const arr = [...speakerDetails]; arr[idx].imageURL = e.target.value; setSpeakerDetails(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 dark:bg-zinc-900 dark:border-zinc-700" />
                    <button type="button" onClick={() => removeSpeaker(idx)} className="text-rose-600 font-bold text-xs px-2"><IconX size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule Builder */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <IconClock size={16} className="text-amber-500" /> Event Agenda Timeline
                </label>
                <button type="button" onClick={addScheduleItem} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Add Agenda Session
                </button>
              </div>
              {scheduleItems.map((sch, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <input type="text" placeholder="Time (e.g. 10:00 AM)" value={sch.time} onChange={e => {
                    const arr = [...scheduleItems]; arr[idx].time = e.target.value; setScheduleItems(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <input type="text" placeholder="Session Title *" value={sch.title} onChange={e => {
                    const arr = [...scheduleItems]; arr[idx].title = e.target.value; setScheduleItems(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Description / Sub-topic" value={sch.description || ""} onChange={e => {
                      const arr = [...scheduleItems]; arr[idx].description = e.target.value; setScheduleItems(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 dark:bg-zinc-900 dark:border-zinc-700" />
                    <button type="button" onClick={() => removeScheduleItem(idx)} className="text-rose-600 font-bold text-xs px-2"><IconX size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Organizers & Coordinators Builder */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <IconUsers size={16} className="text-amber-500" /> Event Coordinators & Leads
                </label>
                <button type="button" onClick={addOrganizer} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  + Add Coordinator
                </button>
              </div>
              {organizersDetails.map((org, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <input type="text" placeholder="Coordinator Name *" value={org.name} onChange={e => {
                    const arr = [...organizersDetails]; arr[idx].name = e.target.value; setOrganizersDetails(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <input type="text" placeholder="Role (e.g. Event Lead / Convenor)" value={org.role || ""} onChange={e => {
                    const arr = [...organizersDetails]; arr[idx].role = e.target.value; setOrganizersDetails(arr);
                  }} className="text-xs p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Contact (Phone / Email)" value={org.contact || ""} onChange={e => {
                      const arr = [...organizersDetails]; arr[idx].contact = e.target.value; setOrganizersDetails(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 dark:bg-zinc-900 dark:border-zinc-700" />
                    <button type="button" onClick={() => removeOrganizer(idx)} className="text-rose-600 font-bold text-xs px-2"><IconX size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelCls}>Tags (comma separated)</label>
                <input type="text" placeholder="Leadership, Tech, SVNIT"
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
              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Feature on spotlight</span>
                </label>

                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input type="checkbox" checked={isAnnouncement} onChange={e => setIsAnnouncement(e.target.checked)}
                    className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">📢 Publish Top Announcement Banner</span>
                </label>
              </div>
            </div>

            {isAnnouncement && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest block">
                  Custom Top Announcement Banner Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registrations for Vichardhara 2026 are officially open! Reserve your seat now."
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

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

      {/* Events Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            <span className="mt-4 text-sm text-zinc-500">Loading events…</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg font-bold">No events found in directory.</p>
            <button
              onClick={handleResetSampleEvents}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-md"
            >
              🌱 Seed Sample Events
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-xs font-black uppercase text-zinc-500 tracking-wider">
                  <th className="py-4 px-6">Event Title & Slug</th>
                  <th className="py-4 px-6">Type & Genre</th>
                  <th className="py-4 px-6">Timings</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions & Registrations</th>
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
                        {ev.genre && (
                          <span className="inline-block ml-2 px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{ev.genre}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs whitespace-nowrap">
                        <div>Start: {formatDate(ev.startDateTime)}</div>
                        <div className="mt-1">End: {formatDate(ev.endDateTime)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded uppercase ${
                          isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
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
