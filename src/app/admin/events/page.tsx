"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../../../components/AdminNav";
import { useRequireAdminAuth } from "../../../components/useRequireAdminAuth";
import { logoutAdmin } from "../../../lib/adminAuth";
import { getEvents, createEvent, updateEvent, deleteEvent, seedSampleEvents, getEventRegistrations, getDignitaries, saveDignitaries, DEFAULT_DIGNITARIES, Event, EventRegistration, SpeakerDetail, ScheduleItem, OrganizerDetail } from "../../../lib/eventsService";
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconMic,
  IconClock,
  IconTag,
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
} from "../../../components/Icons";

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
  "w-full border border-amber-300 rounded-xl py-2.5 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-950 placeholder-slate-400 shadow-sm";
const labelCls = "block text-sm font-extrabold text-slate-950 mb-1.5 font-heading";

function toLocalInput(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const admin = useRequireAdminAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);

  // Registrations modal state
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState<Event | null>(null);
  const [registrationsList, setRegistrationsList] = useState<EventRegistration[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [type, setType] = useState<string>("workshop");
  const [customType, setCustomType] = useState("");
  const [genre, setGenre] = useState<string>("general");
  const [customGenre, setCustomGenre] = useState("");
  const [mode, setMode] = useState<string>("offline");
  const [customMode, setCustomMode] = useState("");
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
  const [isHeroSpotlight, setIsHeroSpotlight] = useState(false);
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

  // Dignitaries Marquee State
  const [dignitaries, setDignitaries] = useState<string[]>([]);
  const [isDignitariesModalOpen, setIsDignitariesModalOpen] = useState(false);
  const [newDignitaryText, setNewDignitaryText] = useState("");
  const [savingDignitaries, setSavingDignitaries] = useState(false);

  useEffect(() => {
    loadEvents();
    loadDignitaries();
  }, []);

  async function loadDignitaries() {
    try {
      const items = await getDignitaries();
      setDignitaries(items);
    } catch (e) {
      console.error("Failed to load dignitaries:", e);
    }
  }

  const handleAddDignitary = () => {
    const trimmed = newDignitaryText.trim();
    if (!trimmed) return;
    if (dignitaries.includes(trimmed)) {
      alert("This dignitary/institution already exists in the marquee.");
      return;
    }
    setDignitaries(prev => [...prev, trimmed]);
    setNewDignitaryText("");
  };

  const handleRemoveDignitary = (index: number) => {
    setDignitaries(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetDignitaries = () => {
    if (confirm("Reset marquee dignitaries to default national institutions & keynotes?")) {
      setDignitaries(DEFAULT_DIGNITARIES);
    }
  };

  const handleSaveDignitaries = async () => {
    if (dignitaries.length === 0) {
      alert("Marquee should contain at least 1 dignitary or partner institution.");
      return;
    }
    setSavingDignitaries(true);
    try {
      await saveDignitaries(dignitaries);
      alert("Dignitaries and Partners Marquee updated successfully!");
      setIsDignitariesModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save marquee items.");
    } finally {
      setSavingDignitaries(false);
    }
  };

  // Set createdBy from session
  useEffect(() => {
    if (admin?.email) setCreatedBy(admin.email);
  }, [admin]);

  async function loadEvents() {
    setLoading(true);
    try { setEvents(await getEvents()); }
    catch (err) { console.error("Error loading events:", err); }
    finally { setLoading(false); }
  }

  const handleLogout = () => {
    logoutAdmin();
    router.replace("/admin/login");
  };

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
    setType("workshop"); setCustomType("");
    setGenre("general"); setCustomGenre("");
    setMode("offline"); setCustomMode("");
    setVenue(""); setLocationMapURL("");
    setFee(""); setEligibility("");
    setStartDateTime(""); setEndDateTime(""); setRegistrationLink("");
    setRegistrationDeadline(""); setRegistrationType("both");
    setSpeakerDetails([]); setScheduleItems([]); setOrganizersDetails([]);
    setStatus("upcoming"); setIsFeatured(false); setIsAnnouncement(false); setAnnouncementText(""); setTagsText("");
    setCreatedBy(admin?.email ?? "admin@thinkindiasvnit.org");
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
    setType("talk"); setCustomType(""); setGenre("tech"); setCustomGenre(""); setMode("hybrid"); setCustomMode(""); setVenue("SVNIT Main Auditorium & MS Teams");
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
    
    const standardTypes = ["workshop", "webinar", "competition", "talk", "social", "other"];
    if (ev.type && !standardTypes.includes(ev.type)) {
      setType("__custom__");
      setCustomType(ev.type);
    } else {
      setType(ev.type ?? "workshop");
      setCustomType("");
    }

    const standardGenres = ["general", "tech", "leadership", "workshop", "cultural", "research", "policy"];
    if (ev.genre && !standardGenres.includes(ev.genre)) {
      setGenre("__custom__");
      setCustomGenre(ev.genre);
    } else {
      setGenre(ev.genre ?? "general");
      setCustomGenre("");
    }

    const standardModes = ["offline", "online", "hybrid"];
    if (ev.mode && !standardModes.includes(ev.mode)) {
      setMode("__custom__");
      setCustomMode(ev.mode);
    } else {
      setMode(ev.mode ?? "offline");
      setCustomMode("");
    }
    
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
    setIsHeroSpotlight(ev.isHeroSpotlight ?? false);
    setIsAnnouncement(ev.isAnnouncement ?? false);
    setAnnouncementText(ev.announcementText ?? "");
    setTagsText(ev.tags?.join(", ") ?? "");
    setCreatedBy(ev.createdBy ?? admin?.email ?? "admin@thinkindiasvnit.org");
    setIsFormOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openRegistrationsModal = async (ev: Event) => {
    setViewingRegistrationsEvent(ev);
    setRegistrationsList([]);
    setRegsLoading(true);
    try {
      const regs = await getEventRegistrations(ev.id || ev.slug);
      setRegistrationsList(regs);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setRegsLoading(false);
    }
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

    const finalType = (type === "__custom__" ? customType.trim() : type) || "other";
    const finalGenre = (genre === "__custom__" ? customGenre.trim().toLowerCase() : genre) || "general";
    const finalMode = (mode === "__custom__" ? customMode.trim() : mode) || "offline";

    const speakerNames = speakerDetails.map(s => s.name).filter(Boolean);
    const organizerIds = organizersDetails.map(o => o.name).filter(Boolean);

    const payload = {
      title, slug, shortDescription, description, coverImageURL, imageURLs,
      type: finalType as Event["type"],
      genre: finalGenre as Event["genre"],
      mode: finalMode as Event["mode"],
      venue, locationMapURL, fee, eligibility,
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
      status, isFeatured: isHeroSpotlight ? true : isFeatured, isHeroSpotlight, isAnnouncement, announcementText,
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

  // Show nothing while auth check is in progress
  if (!admin) return null;

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AdminNav />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-300 pb-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">Admin Event Management</h1>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Signed in as <span className="text-amber-700">{admin.name}</span> · Manage events, track registrations, and publish events for Think India SVNIT.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsDignitariesModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-extrabold bg-amber-100/80 border border-amber-300 text-xs text-amber-950 hover:bg-amber-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <IconMic size={14} className="text-amber-800" /> Manage Marquee Dignitaries ({dignitaries.length})
            </button>
            <button
              onClick={handleResetSampleEvents}
              className="px-4 py-2.5 rounded-xl font-extrabold bg-white border border-amber-300 text-xs text-amber-950 hover:bg-amber-100/60 shadow-sm transition-colors"
            >
              Reset Sample Events
            </button>
            {!isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 transition-all duration-200"
              >
                <IconPlus size={16} /> Add New Event
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl font-extrabold bg-rose-100 border border-rose-200 text-xs text-rose-800 hover:bg-rose-200 shadow-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

      {isFormOpen && (
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-2xl p-6 sm:p-8 mb-10 bg-white/95">
          <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-6">
            <h2 className="text-xl font-black text-slate-950 font-heading flex items-center gap-2">
              <IconEdit size={20} className="text-amber-600" />
              {editModeId ? "Edit Event Details" : "Create New Event"}
            </h2>
            {!editModeId && (
              <button
                type="button"
                onClick={prefillSampleTemplate}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black hover:bg-amber-200 shadow-sm transition-colors flex items-center gap-1"
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

            {/* Type, Genre, Mode, Registration Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={labelCls}>Event Type *</label>
                <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition / Hackathon</option>
                  <option value="talk">Talk / Keynote</option>
                  <option value="social">Social Drive</option>
                  <option value="other">Other</option>
                  <option value="__custom__">+ Add Custom Event Type...</option>
                </select>
                {type === "__custom__" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom type e.g. Symposium"
                    value={customType}
                    onChange={e => setCustomType(e.target.value)}
                    className={`${inputCls} mt-2 text-xs`}
                  />
                )}
              </div>

              <div>
                <label className={labelCls}>Genre Tag *</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className={inputCls}>
                  <option value="general">General</option>
                  <option value="tech">Technology & AI</option>
                  <option value="leadership">Leadership & Policy</option>
                  <option value="policy">Policy</option>
                  <option value="workshop">Skill Workshops</option>
                  <option value="cultural">Social & Cultural</option>
                  <option value="research">Research & IPR</option>
                  <option value="__custom__">+ Add Custom Genre...</option>
                </select>
                {genre === "__custom__" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom genre e.g. Robotics"
                    value={customGenre}
                    onChange={e => setCustomGenre(e.target.value)}
                    className={`${inputCls} mt-2 text-xs`}
                  />
                )}
              </div>

              <div>
                <label className={labelCls}>Mode *</label>
                <select value={mode} onChange={e => setMode(e.target.value)} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="offline">Offline (On Campus)</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="__custom__">+ Add Custom Mode...</option>
                </select>
                {mode === "__custom__" && (
                  <input
                    type="text"
                    placeholder="Enter custom mode e.g. Metaverse"
                    value={customMode}
                    onChange={e => setCustomMode(e.target.value)}
                    className={`${inputCls} mt-2 text-xs`}
                  />
                )}
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

            {/* Dates, Location, Fee & Eligibility */}
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
                <label className={labelCls}>Registration / External Link</label>
                <input type="url" placeholder="https://forms.gle/…"
                  value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Entry Fee</label>
                <input type="text" placeholder="Free / ₹200 per team"
                  value={fee} onChange={e => setFee(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Eligibility Criteria</label>
                <input type="text" placeholder="Open to all College Students & Researchers"
                  value={eligibility} onChange={e => setEligibility(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Speakers Builder */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-slate-950 flex items-center gap-1.5 font-heading">
                  <IconMic size={16} className="text-amber-700" /> Speaker Details
                </label>
                <button type="button" onClick={addSpeaker} className="text-xs font-black text-amber-800 hover:underline">
                  + Add Speaker
                </button>
              </div>
              {speakerDetails.map((sp, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-amber-300 shadow-sm">
                  <input type="text" placeholder="Speaker Name *" value={sp.name} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].name = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <input type="text" placeholder="Role / Designation" value={sp.role || ""} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].role = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <input type="text" placeholder="Organization" value={sp.organization || ""} onChange={e => {
                    const arr = [...speakerDetails]; arr[idx].organization = e.target.value; setSpeakerDetails(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Photo URL" value={sp.imageURL || ""} onChange={e => {
                      const arr = [...speakerDetails]; arr[idx].imageURL = e.target.value; setSpeakerDetails(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 border-amber-300 font-semibold text-slate-950 bg-white" />
                    <button type="button" onClick={() => removeSpeaker(idx)} className="text-rose-600 font-bold text-xs px-2"><IconX size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule Builder */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-slate-950 flex items-center gap-1.5 font-heading">
                  <IconClock size={16} className="text-amber-700" /> Event Agenda Timeline
                </label>
                <button type="button" onClick={addScheduleItem} className="text-xs font-black text-amber-800 hover:underline">
                  + Add Agenda Session
                </button>
              </div>
              {scheduleItems.map((sch, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-300 shadow-sm">
                  <input type="text" placeholder="Time (e.g. 10:00 AM)" value={sch.time} onChange={e => {
                    const arr = [...scheduleItems]; arr[idx].time = e.target.value; setScheduleItems(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <input type="text" placeholder="Session Title *" value={sch.title} onChange={e => {
                    const arr = [...scheduleItems]; arr[idx].title = e.target.value; setScheduleItems(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Description / Sub-topic" value={sch.description || ""} onChange={e => {
                      const arr = [...scheduleItems]; arr[idx].description = e.target.value; setScheduleItems(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 border-amber-300 font-semibold text-slate-950 bg-white" />
                    <button type="button" onClick={() => removeScheduleItem(idx)} className="text-rose-600 font-bold text-xs px-2"><IconX size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Organizers Builder */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-slate-950 flex items-center gap-1.5 font-heading">
                  <IconUsers size={16} className="text-amber-700" /> Event Coordinators & Leads
                </label>
                <button type="button" onClick={addOrganizer} className="text-xs font-black text-amber-800 hover:underline">
                  + Add Coordinator
                </button>
              </div>
              {organizersDetails.map((org, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-300 shadow-sm">
                  <input type="text" placeholder="Coordinator Name *" value={org.name} onChange={e => {
                    const arr = [...organizersDetails]; arr[idx].name = e.target.value; setOrganizersDetails(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <input type="text" placeholder="Role (e.g. Event Lead / Convenor)" value={org.role || ""} onChange={e => {
                    const arr = [...organizersDetails]; arr[idx].role = e.target.value; setOrganizersDetails(arr);
                  }} className="text-xs p-2 border rounded-lg border-amber-300 font-semibold text-slate-950 bg-white" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Contact (Phone / Email)" value={org.contact || ""} onChange={e => {
                      const arr = [...organizersDetails]; arr[idx].contact = e.target.value; setOrganizersDetails(arr);
                    }} className="text-xs p-2 border rounded-lg flex-1 border-amber-300 font-semibold text-slate-950 bg-white" />
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
                  <span className="text-sm font-extrabold text-slate-950 font-heading">Feature on spotlight</span>
                </label>

                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input type="checkbox" checked={isHeroSpotlight} onChange={e => setIsHeroSpotlight(e.target.checked)}
                    className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-extrabold text-amber-700 font-heading">Set as Homepage Hero Spotlight</span>
                </label>

                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input type="checkbox" checked={isAnnouncement} onChange={e => setIsAnnouncement(e.target.checked)}
                    className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-extrabold text-amber-800 font-heading">Publish Top Announcement Banner</span>
                </label>
              </div>
            </div>

            {isAnnouncement && (
              <div className="p-4 bg-amber-100/70 border border-amber-300 rounded-2xl space-y-2">
                <label className="text-xs font-black text-amber-950 uppercase tracking-widest block font-heading">
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
            <div className="flex justify-end gap-4 pt-4 border-t border-amber-200">
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-extrabold text-slate-900 hover:bg-amber-100/60 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/30 transition-colors">
                {editModeId ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-amber-300 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            <span className="mt-4 text-sm font-bold text-slate-800">Loading events…</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-700">
            <p className="text-lg font-bold text-slate-950 font-heading">No events found in directory.</p>
            <button
              onClick={handleResetSampleEvents}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-md"
            >
              Seed Sample Events
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/70 border-b border-amber-300 text-xs font-black uppercase text-amber-950 tracking-wider">
                  <th className="py-4 px-6">Event Title & Slug</th>
                  <th className="py-4 px-6">Type & Genre</th>
                  <th className="py-4 px-6">Timings</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions & Registrations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200 text-sm text-slate-900">
                {events.map(ev => {
                  const isActive = ev.timeStatus === "active";
                  return (
                    <tr key={ev.id} className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-950 font-heading line-clamp-1">{ev.title}</div>
                        <div className="text-xs text-amber-800 mt-0.5 font-mono font-bold">/{ev.slug}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-black uppercase rounded bg-amber-600 text-white shadow-sm">{ev.type}</span>
                        {ev.genre && (
                          <span className="inline-block ml-2 px-2.5 py-0.5 text-xs font-black uppercase rounded bg-white border border-amber-300 text-slate-950 shadow-sm">{ev.genre}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs whitespace-nowrap font-semibold text-slate-800">
                        <div>Start: {formatDate(ev.startDateTime)}</div>
                        <div className="mt-1">End: {formatDate(ev.endDateTime)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-black rounded uppercase shadow-sm ${
                          isActive ? "bg-emerald-700 text-white" : "bg-slate-700 text-white"
                        }`}>
                          {ev.status}
                        </span>
                        {ev.registrationsCount !== undefined && ev.registrationsCount > 0 && (
                          <div className="text-xs font-bold text-amber-700 mt-1">{ev.registrationsCount} registered</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openRegistrationsModal(ev)}
                          className="px-3.5 py-1.5 text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl transition-colors shadow-sm"
                        >
                          Registrations
                        </button>
                        <button onClick={() => handleEditClick(ev)}
                          className="px-3.5 py-1.5 text-xs font-bold border border-amber-300 hover:bg-amber-100/60 rounded-xl transition-colors text-slate-900 shadow-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(ev.id!)}
                          className="px-3.5 py-1.5 text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-xl transition-colors shadow-sm">
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

      {/* Registrations Modal */}
      {viewingRegistrationsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-amber-200">
              <div>
                <h3 className="text-lg font-black text-slate-950 font-heading">Registrations</h3>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">{viewingRegistrationsEvent.title}</p>
              </div>
              <button
                onClick={() => { setViewingRegistrationsEvent(null); setRegistrationsList([]); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {regsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                  <span className="mt-3 text-sm font-bold text-slate-700">Loading registrations…</span>
                </div>
              ) : registrationsList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-semibold text-sm">No registrations yet for this event.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-extrabold text-amber-900 mb-4 uppercase tracking-wide">
                    {registrationsList.length} Registration{registrationsList.length !== 1 ? "s" : ""}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-50 border-b border-amber-200 text-amber-900 font-black uppercase tracking-wide">
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Roll No</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Dept / Year</th>
                          <th className="py-2 px-3">Registered At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {registrationsList.map((reg, i) => (
                          <tr key={reg.id} className="hover:bg-amber-50/50 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-500">{i + 1}</td>
                            <td className="py-2 px-3 font-extrabold text-slate-900">{reg.fullName}</td>
                            <td className="py-2 px-3 font-mono font-semibold text-slate-700">{reg.rollNo}</td>
                            <td className="py-2 px-3 text-slate-700 font-semibold">{reg.email}</td>
                            <td className="py-2 px-3 text-slate-700 font-semibold">{reg.phone}</td>
                            <td className="py-2 px-3 text-slate-700 font-semibold">{reg.department} · {reg.year}</td>
                            <td className="py-2 px-3 text-slate-500 font-semibold whitespace-nowrap">
                              {new Date(reg.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dignitaries & Partners Marquee Modal */}
      {isDignitariesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-amber-200 bg-amber-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-950 font-heading flex items-center gap-2">
                  <IconMic size={20} className="text-amber-700" />
                  Event Dignitaries & Marquee Manager
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Manage keynote speakers, dignitaries, and partner institutions displayed on the Events page marquee banner.
                </p>
              </div>
              <button
                onClick={() => setIsDignitariesModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Add New Item Input */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-950 font-heading">
                  Add New Dignitary / Institution
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. P. J. Kalam Innovation Cell / ISRO / NITI Aayog"
                    value={newDignitaryText}
                    onChange={(e) => setNewDignitaryText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddDignitary(); } }}
                    className="flex-1 border border-amber-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDignitary}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-colors shadow-sm flex items-center gap-1"
                  >
                    <IconPlus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Current Items List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Active Marquee Items ({dignitaries.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDignitaries}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    Reset to Default List
                  </button>
                </div>

                {dignitaries.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed rounded-xl">
                    No items in marquee. Add at least one dignitary or partner.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {dignitaries.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-xl shadow-sm hover:border-amber-400 transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </span>
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDignitary(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-amber-200 bg-amber-50/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDignitariesModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-white border border-transparent hover:border-amber-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingDignitaries}
                onClick={handleSaveDignitaries}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <IconCheck size={14} />
                {savingDignitaries ? "Saving..." : "Save Marquee Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
