"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getEventBySlug, getEvents, Event } from "../../../lib/eventsService";
import {
  IconCalendar,
  IconMapPin,
  IconMic,
  IconClock,
  IconTag,
  IconShare,
  IconBookmark,
  IconBookmarkFilled,
  IconCheck,
  IconX,
  IconExternalLink,
  IconShieldCheck,
  IconTicket,
  IconImage
} from "../../../components/Icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function EventDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // GSAP Animation Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadEventData() {
      if (!slugParam) return;
      try {
        const fetchedEvent = await getEventBySlug(slugParam);
        setEvent(fetchedEvent);

        const allEvents = await getEvents();
        const filteredRelated = allEvents.filter((e) => e.slug !== slugParam).slice(0, 3);
        setRelatedEvents(filteredRelated);

        if (typeof window !== "undefined") {
          const savedBookmarks = JSON.parse(localStorage.getItem("think_india_bookmarks") || "[]");
          setIsBookmarked(savedBookmarks.includes(slugParam));
        }
      } catch (err) {
        console.error("Failed to load event details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [slugParam]);

  // GSAP Continuous Bidirectional Scroll Trigger Animations
  useEffect(() => {
    if (!loading && event) {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".gsap-detail-el").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 35, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                end: "bottom 12%",
                toggleActions: "play reverse play reverse",
              },
            }
          );
        });
      });
      return () => ctx.revert();
    }
  }, [loading, event]);

  const toggleBookmark = () => {
    if (typeof window === "undefined" || !slugParam) return;
    const savedBookmarks = JSON.parse(localStorage.getItem("think_india_bookmarks") || "[]");
    let updated: string[];
    if (savedBookmarks.includes(slugParam)) {
      updated = savedBookmarks.filter((s: string) => s !== slugParam);
      setIsBookmarked(false);
    } else {
      updated = [...savedBookmarks, slugParam];
      setIsBookmarked(true);
    }
    localStorage.setItem("think_india_bookmarks", JSON.stringify(updated));
  };

  const copyShareLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateGoogleCalendarUrl = (e: Event) => {
    if (!e.startDateTime) return "#";
    const startStr = new Date(e.startDateTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endStr = e.endDateTime
      ? new Date(e.endDateTime).toISOString().replace(/-|:|\.\d\d\d/g, "")
      : startStr;
    const title = encodeURIComponent(e.title);
    const details = encodeURIComponent(e.shortDescription || e.description || "");
    const location = encodeURIComponent(e.venue || "SVNIT Surat");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-amber-900 font-bold">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Event Details…</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-orange-50/50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-amber-600 mb-4 border border-amber-300 shadow-md">
          <IconX size={32} />
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-slate-900">Event Not Found</h1>
        <p className="mt-2 text-slate-700 text-sm max-w-md">
          The requested event may have been moved or removed.
        </p>
        <Link
          href="/events"
          className="mt-6 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/30"
        >
          ← Return to Events Directory
        </Link>
      </div>
    );
  }

  const isActive = event.timeStatus === "active";
  const galleryImages = [event.coverImageURL, ...(event.imageURLs || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-900 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      
      {/* ── 1. 100VH IMMERSIVE HERO SECTION ── */}
      <section ref={headerRef} className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden border-b border-amber-300/80 px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        
        {/* Full-bleed background cover with artistic ambient light & textures */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {event.coverImageURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImageURL}
              alt={event.title}
              className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-600/20 via-orange-500/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50/95 via-white/85 to-white/60" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Top Floating Glass Navigation */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex items-center justify-between gap-4 pt-4">
          <Link
            href="/events"
            className="gsap-detail-el inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950 hover:text-amber-800 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-300 shadow-md hover:shadow-lg transition-all"
          >
            ← Back to Events
          </Link>

          <div className="gsap-detail-el flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2.5 sm:px-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                isBookmarked
                  ? "bg-amber-600 text-white border-amber-600 shadow-amber-600/30"
                  : "bg-white/90 backdrop-blur-md text-slate-900 border-amber-300 hover:bg-amber-50"
              }`}
            >
              {isBookmarked ? <IconBookmarkFilled size={15} /> : <IconBookmark size={15} />}
              <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save Event"}</span>
            </button>

            <button
              onClick={copyShareLink}
              className="p-2.5 sm:px-4 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-300 text-slate-900 hover:bg-amber-50 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
            >
              {copiedLink ? <IconCheck size={15} className="text-emerald-600" /> : <IconShare size={15} />}
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Center Main Hero Display */}
        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto py-12 flex flex-col justify-center">
          
          {/* Metadata Badges */}
          <div className="gsap-detail-el flex flex-wrap items-center gap-2.5 mb-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-600 text-white shadow-lg shadow-amber-600/30">
              {event.type}
            </span>
            {event.genre && (
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-950 border border-amber-300 shadow-sm">
                {event.genre}
              </span>
            )}
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-900 border border-amber-300 shadow-md">
              {event.mode} Mode
            </span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 ${
              isActive ? "bg-emerald-600" : "bg-slate-800"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-white animate-ping" : "bg-zinc-400"}`} />
              {isActive ? "Live Now" : "Event Archive"}
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="gsap-detail-el text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 font-heading leading-[1.08] mb-6 max-w-5xl tracking-tight">
            {event.title}
          </h1>

          {/* Hero Subtitle */}
          <p className="gsap-detail-el text-lg sm:text-2xl text-slate-800 max-w-4xl leading-relaxed mb-8 font-medium">
            {event.shortDescription || event.description}
          </p>

          {/* Glass Logistics & Actions Ribbon */}
          <div className="gsap-detail-el flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-900 font-bold pt-6 border-t border-amber-300/80">
            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-300 shadow-sm">
              <IconCalendar size={18} className="text-amber-700" />
              <span className="text-slate-950 font-extrabold">{formatDate(event.startDateTime)}</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-300 shadow-sm">
              <IconMapPin size={18} className="text-amber-700" />
              <span className="text-slate-950 font-extrabold">{event.venue || "SVNIT Surat Campus"}</span>
            </div>

            {event.fee && (
              <div className="flex items-center gap-2 bg-amber-100/90 border border-amber-400 px-4 py-2.5 rounded-2xl text-amber-950 font-black shadow-sm">
                <IconTicket size={16} className="text-amber-700" />
                <span>{event.fee}</span>
              </div>
            )}

            {event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-amber-600/30 hover:scale-105 transition-all"
              >
                <span>Official Registration</span>
                <IconExternalLink size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="max-w-7xl mx-auto w-full relative z-10 flex justify-center pb-2">
          <a
            href="#event-details"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-amber-300 text-xs font-black uppercase tracking-widest text-amber-900 hover:bg-amber-100 transition-all animate-bounce shadow-sm"
          >
            <span>Scroll to Explore Agenda & Details</span>
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* ── 2. MAIN LAYOUT: CONTENT + SIDEBAR ── */}
      <section id="event-details" ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1 scroll-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Overview Card */}
            <div className="gsap-detail-el card-orange-glass-light rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-2xl font-black text-slate-950 font-heading">
                About this Event
              </h2>
              <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium space-y-3">
                {event.description}
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="pt-4 border-t border-amber-200 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 flex items-center gap-1 shadow-sm">
                      <IconTag size={12} className="text-amber-700" /> #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Timeline */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="gsap-detail-el card-orange-glass-light rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-black text-slate-950 font-heading flex items-center gap-2 mb-6">
                  <IconClock size={20} className="text-amber-700" />
                  Agenda & Timeline
                </h2>
                <div className="relative pl-6 border-l-2 border-amber-400 space-y-8">
                  {event.schedule.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-md group-hover:scale-125 transition-transform" />
                      <div className="bg-white border border-amber-300 rounded-2xl p-5 space-y-1 shadow-md">
                        <span className="text-xs font-mono font-black text-amber-800">{item.time}</span>
                        <h4 className="text-base font-extrabold text-slate-950 font-heading">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-slate-700 font-medium">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers Showcase */}
            {event.speakerDetails && event.speakerDetails.length > 0 && (
              <div className="gsap-detail-el card-orange-glass-light rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-black text-slate-950 font-heading flex items-center gap-2 mb-6">
                  <IconMic size={20} className="text-amber-700" />
                  Distinguished Speakers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakerDetails.map((speaker, idx) => (
                    <div key={idx} className="bg-white border border-amber-300 rounded-2xl p-4 flex items-center gap-4 shadow-md">
                      {speaker.imageURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={speaker.imageURL} alt={speaker.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-lg border border-amber-300">
                          {speaker.name[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-950 font-heading">{speaker.name}</h4>
                        <p className="text-xs text-amber-800 font-bold">{speaker.role}</p>
                        <p className="text-[11px] text-slate-700 font-semibold">{speaker.organization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            {galleryImages.length > 0 && (
              <div className="gsap-detail-el card-orange-glass-light rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-black text-slate-950 font-heading flex items-center gap-2 mb-6">
                  <IconImage size={20} className="text-amber-700" />
                  Event Gallery & Media
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveLightboxIndex(idx)}
                      className="relative h-32 rounded-xl overflow-hidden group border border-amber-300 hover:border-amber-500 shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-black/80 px-2.5 py-1 rounded-lg">View Photo</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT STICKY SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="gsap-detail-el card-orange-glass-light rounded-3xl p-6 sticky top-6 space-y-6 shadow-xl">
              
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-amber-900">
                  Logistics & Schedule
                </span>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <IconCalendar size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-600 block">Date & Time</span>
                      <span className="text-slate-950 font-extrabold">{formatDate(event.startDateTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconMapPin size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-600 block">Venue</span>
                      <span className="text-slate-950 font-extrabold">{event.venue || "SVNIT Campus"}</span>
                    </div>
                  </div>

                  {event.locationMapURL && (
                    <a
                      href={event.locationMapURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-800 font-extrabold hover:underline pt-1"
                    >
                      <IconExternalLink size={13} /> View Google Maps Directions ↗
                    </a>
                  )}

                  {event.eligibility && (
                    <div className="flex items-start gap-3 pt-2 border-t border-amber-200">
                      <IconShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-600 block">Eligibility</span>
                        <span className="text-slate-950 font-extrabold">{event.eligibility}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-amber-200">
                {event.registrationLink ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-3.5 px-4 rounded-xl font-black text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <IconExternalLink size={15} /> Official Event Link ↗
                  </a>
                ) : null}

                <a
                  href={generateGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 px-4 rounded-xl font-extrabold text-xs bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <IconCalendar size={14} /> Add to Google Calendar ↗
                </a>
              </div>

              {/* Organizers Contact */}
              {event.organizersDetails && event.organizersDetails.length > 0 && (
                <div className="pt-4 border-t border-amber-200 space-y-3 text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-wider block">
                    Event Coordinators
                  </span>
                  {event.organizersDetails.map((org, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
                      <p className="font-black text-slate-950">{org.name}</p>
                      <p className="text-[11px] text-amber-800 font-bold">{org.role}</p>
                      {org.contact && <p className="text-[11px] text-slate-700 font-medium">{org.contact}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal Reader */}
      {activeLightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute -top-12 right-0 text-white bg-zinc-900 p-2 rounded-full border border-amber-300"
            >
              <IconX size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={galleryImages[activeLightboxIndex]} alt="Gallery detail" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white" />
          </div>
        </div>
      )}
    </div>
  );
}
