"use client";

import { useEffect, useState } from "react";
import { getEvents, createEvent, updateEvent, deleteEvent, Event } from "../../lib/eventsService";

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form visibility & mode
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [imageURLsText, setImageURLsText] = useState(""); // comma-separated or newlines
  const [type, setType] = useState<Event["type"]>("workshop");
  const [mode, setMode] = useState<Event["mode"]>("offline");
  const [venue, setVenue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [speakerNamesText, setSpeakerNamesText] = useState(""); // comma-separated
  const [organizerIdsText, setOrganizerIdsText] = useState(""); // comma-separated
  const [status, setStatus] = useState<Event["status"]>("upcoming");
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsText, setTagsText] = useState(""); // comma-separated
  const [createdBy, setCreatedBy] = useState("admin");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const fetched = await getEvents();
      setEvents(fetched);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Title input to auto-generate Slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editModeId) {
      // Auto-generate slug: convert to lowercase, replace non-alphanumeric with hyphens
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setShortDescription("");
    setDescription("");
    setCoverImageURL("");
    setImageURLsText("");
    setType("workshop");
    setMode("offline");
    setVenue("");
    setStartDateTime("");
    setEndDateTime("");
    setRegistrationLink("");
    setRegistrationDeadline("");
    setSpeakerNamesText("");
    setOrganizerIdsText("");
    setStatus("upcoming");
    setIsFeatured(false);
    setTagsText("");
    setCreatedBy("admin");
    setEditModeId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (event: Event) => {
    setEditModeId(event.id || null);
    setTitle(event.title);
    setSlug(event.slug);
    setShortDescription(event.shortDescription);
    setDescription(event.description);
    setCoverImageURL(event.coverImageURL || "");
    setImageURLsText(event.imageURLs ? event.imageURLs.join("\n") : "");
    setType(event.type);
    setMode(event.mode);
    setVenue(event.venue);
    
    // Format dates to 'YYYY-MM-DDThh:mm' for datetime-local input
    const formatToLocalInput = (isoStr: string) => {
      if (!isoStr) return "";
      const d = new Date(isoStr);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDateTime(formatToLocalInput(event.startDateTime));
    setEndDateTime(formatToLocalInput(event.endDateTime));
    setRegistrationLink(event.registrationLink);
    setRegistrationDeadline(formatToLocalInput(event.registrationDeadline));
    
    setSpeakerNamesText(event.speakerNames ? event.speakerNames.join(", ") : "");
    setOrganizerIdsText(event.organizerIds ? event.organizerIds.join(", ") : "");
    setStatus(event.status);
    setIsFeatured(event.isFeatured);
    setTagsText(event.tags ? event.tags.join(", ") : "");
    setCreatedBy(event.createdBy || "admin");
    
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteEvent(id);
        alert("Event deleted successfully!");
        loadEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !shortDescription || !description || !startDateTime || !endDateTime || !registrationLink) {
      alert("Please fill in all required fields (marked with *).");
      return;
    }

    // Process lists
    const imageURLs = imageURLsText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u !== "");
    const speakerNames = speakerNamesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    const organizerIds = organizerIdsText
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o !== "");
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    // Convert local inputs to ISO dates
    const startISO = new Date(startDateTime).toISOString();
    const endISO = new Date(endDateTime).toISOString();
    const deadlineISO = registrationDeadline ? new Date(registrationDeadline).toISOString() : "";

    const eventPayload = {
      title,
      slug,
      shortDescription,
      description,
      coverImageURL,
      imageURLs,
      type,
      mode,
      venue,
      startDateTime: startISO,
      endDateTime: endISO,
      registrationLink,
      registrationDeadline: deadlineISO,
      speakerNames,
      organizerIds,
      status,
      isFeatured,
      tags,
      createdBy,
    };

    try {
      if (editModeId) {
        await updateEvent(editModeId, eventPayload);
        alert("Event updated successfully!");
      } else {
        await createEvent(eventPayload);
        alert("Event created successfully!");
      }
      resetForm();
      loadEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event. Check console for details.");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Admin Event Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, update, and manage all public events for Think India SVNIT.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            ➕ Add New Event
          </button>
        )}
      </div>

      {/* Editor Form Panel */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 mb-10 transition-all duration-300">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6">
            {editModeId ? "✏️ Edit Event Details" : "📝 Create New Event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon 2026"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Event Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. national-hackathon-2026"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Row 2: Short Description */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Short Description * (1-2 sentences for listings card)
              </label>
              <input
                type="text"
                required
                placeholder="A nationwide development hackathon focusing on youth empowerment and innovations."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Row 3: Full Description */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Full Event Description *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Provide a detailed overview of the event, including timelines, rules, judging criteria, and other guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Row 4: Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/images/banner.jpg"
                  value={coverImageURL}
                  onChange={(e) => setCoverImageURL(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Additional Gallery Image URLs (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  value={imageURLsText}
                  onChange={(e) => setImageURLsText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Row 5: Type, Mode, Venue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Event Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Event["type"])}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                >
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="competition">Competition</option>
                  <option value="talk">Talk</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Event["mode"])}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Venue / Meeting Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. LHC 102, SVNIT Campus or MS Teams Link"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Row 6: Schedule Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Registration Deadline Date
                </label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Row 7: Speakers, Organizers, Registration Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Speaker Names (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. P. J. Kalam, Mr. R. D. Tata"
                  value={speakerNamesText}
                  onChange={(e) => setSpeakerNamesText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Organizer Names / IDs (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Club President, Tech Secretary"
                  value={organizerIdsText}
                  onChange={(e) => setOrganizerIdsText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Google Form / Registration URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://forms.gle/..."
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Row 8: Tags, Status, Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. coding, tech, awareness"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Event Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Event["status"])}
                  className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center h-full pt-6">
                <label className="inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 rounded bg-zinc-150 border-zinc-300 focus:ring-amber-500"
                  />
                  <span className="ml-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Feature this event on homepage
                  </span>
                </label>
              </div>
            </div>

            {/* Row 9: Created By */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Created By (Admin Username/Email)
              </label>
              <input
                type="text"
                placeholder="admin@thinkindia.org"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-750 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/10 transition-colors"
              >
                {editModeId ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table / List view */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            <span className="mt-4 text-sm text-zinc-500">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No events in database yet.</p>
            <p className="text-sm mt-1">Click "Add New Event" to register the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase text-zinc-500 tracking-wider">
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Type & Mode</th>
                  <th className="py-4 px-6">Timings</th>
                  <th className="py-4 px-6">Time Status</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-zinc-800 dark:text-zinc-200">
                {events.map((event) => {
                  const isActive = event.timeStatus === "active";
                  return (
                    <tr key={event.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-850/40">
                      {/* Name & Slug */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-zinc-950 dark:text-white line-clamp-1">{event.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 font-mono line-clamp-1">/{event.slug}</div>
                      </td>

                      {/* Type & Mode */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {event.type}
                        </span>
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ml-2">
                          {event.mode}
                        </span>
                      </td>

                      {/* Timings */}
                      <td className="py-4 px-6 text-xs whitespace-nowrap">
                        <div>Start: {formatDate(event.startDateTime)}</div>
                        <div className="mt-1">End: {formatDate(event.endDateTime)}</div>
                      </td>

                      {/* Active/Past */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {isActive ? "Active" : "Past"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded uppercase ${
                          event.status === "upcoming" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                          event.status === "ongoing" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                          event.status === "completed" ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" :
                          "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" // cancelled
                        }`}>
                          {event.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(event)}
                          className="px-3 py-1 text-xs font-bold bg-zinc-150 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event.id!)}
                          className="px-3 py-1 text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 rounded transition-colors"
                        >
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
