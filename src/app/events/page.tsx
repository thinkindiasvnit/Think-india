"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getEvents, getDignitaries, DEFAULT_DIGNITARIES, Event } from "../../lib/eventsService";
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconSearch,
  IconChevronRight,
  IconArrowRight,
  IconBell,
  IconTag,
  IconX,
  IconLaptop,
  IconBookOpen,
  IconAward,
  IconShieldCheck,
  IconLayers,
  IconBookmark,
  IconBookmarkFilled,
  IconClock,
  IconTicket
} from "../../components/Icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });
}

// ─── 4-Step Event Journey ────────────────────────────────────────────────
const EVENT_STEPS = [
  {
    step: "01",
    title: "DISCOVER & SELECT",
    desc: "Browse our national symposiums, hackathons, and technical masterclasses tailored for student leaders.",
    badge: "Browse Directory",
  },
  {
    step: "02",
    title: "REGISTER & PREPARE",
    desc: "Reserve your delegate seat online or submit your team's project abstract with verified credentials.",
    badge: "Instant Pass",
  },
  {
    step: "03",
    title: "ENGAGE & COLLABORATE",
    desc: "Interact live with eminent dignitaries, scientists, and policy architects in keynote sessions & workshops.",
    badge: "Keynote & Jury",
  },
  {
    step: "04",
    title: "CERTIFICATION & ALUMNI",
    desc: "Earn official Think India certification, compete for grants, and join our nationwide alumni network.",
    badge: "National Impact",
  },
];

const DOMAIN_METADATA: Record<string, { label: string; icon: typeof IconTag }> = {
  tech: { label: "Technology & AI", icon: IconLaptop },
  leadership: { label: "Leadership & Governance", icon: IconAward },
  policy: { label: "Policy & Law", icon: IconAward },
  workshop: { label: "Workshops & Masterclasses", icon: IconBookOpen },
  cultural: { label: "Social & Cultural", icon: IconUsers },
  research: { label: "Research & IPR", icon: IconShieldCheck },
  general: { label: "General Events", icon: IconTag },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [dignitaries, setDignitaries] = useState<string[]>(DEFAULT_DIGNITARIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "past" | "saved">("all");
  const [activeGenre, setActiveGenre] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isBulletinDismissed, setIsBulletinDismissed] = useState(false);

  // GSAP Animation Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedEvents, fetchedDignitaries] = await Promise.all([
          getEvents(),
          getDignitaries()
        ]);
        setEvents(fetchedEvents);
        if (fetchedDignitaries && fetchedDignitaries.length > 0) {
          setDignitaries(fetchedDignitaries);
        }
        if (typeof window !== "undefined") {
          const saved = JSON.parse(localStorage.getItem("think_india_bookmarks") || "[]");
          setBookmarkedSlugs(saved);
        }
      } catch (err) {
        console.error("Failed to load events / dignitaries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleBookmark = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const saved = JSON.parse(localStorage.getItem("think_india_bookmarks") || "[]");
    let updated: string[];
    if (saved.includes(slug)) {
      updated = saved.filter((s: string) => s !== slug);
    } else {
      updated = [...saved, slug];
    }
    localStorage.setItem("think_india_bookmarks", JSON.stringify(updated));
    setBookmarkedSlugs(updated);
  };

  // GSAP Scroll Animations
  useEffect(() => {
    if (!loading && pageContainerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".gsap-hero-title",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
        );

        if (featuredRef.current) {
          gsap.fromTo(
            featuredRef.current,
            { opacity: 0, y: 40, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: featuredRef.current,
                start: "top 85%",
              },
            }
          );
        }

        gsap.fromTo(
          ".gsap-stat-box",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".gsap-stats-row",
              start: "top 90%",
            },
          }
        );

        gsap.utils.toArray<HTMLElement>(".gsap-card").forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
              },
            }
          );
        });
      }, pageContainerRef);

      return () => ctx.revert();
    }
  }, [loading]);

  // Featured Spotlight Event
  const featuredEvent = useMemo(() => {
    return (
      events.find((e) => e.isHeroSpotlight) ||
      events.find((e) => e.isFeatured) ||
      events[0]
    );
  }, [events]);

  // Latest Announcement
  const latestAnnouncement = useMemo(() => {
    return (
      events.find((e) => e.isAnnouncement) ||
      events.find((e) => e.status === "upcoming" || e.timeStatus === "active") ||
      events[0]
    );
  }, [events]);

  // Dynamic Domains List: ONLY show domains that actually exist in the current events
  const genreOptions = useMemo(() => {
    const list: { id: string; label: string; icon: typeof IconTag }[] = [
      { id: "all", label: "All Events", icon: IconLayers },
    ];

    const presentDomains = new Set<string>();
    events.forEach((ev) => {
      const g = (ev.genre || "").toLowerCase().trim();
      if (g) {
        presentDomains.add(g);
      }
    });

    presentDomains.forEach((domainKey) => {
      const meta = DOMAIN_METADATA[domainKey];
      list.push({
        id: domainKey,
        label: meta ? meta.label : domainKey.charAt(0).toUpperCase() + domainKey.slice(1),
        icon: meta ? meta.icon : IconTag,
      });
    });

    return list;
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchLower = search.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        event.title.toLowerCase().includes(searchLower) ||
        event.shortDescription.toLowerCase().includes(searchLower) ||
        (event.tags && event.tags.some((t) => t.toLowerCase().includes(searchLower))) ||
        (event.speakerNames && event.speakerNames.some((s) => s.toLowerCase().includes(searchLower)));

      let matchesTab = true;
      if (activeTab === "upcoming") matchesTab = event.status === "upcoming" || event.timeStatus === "active";
      else if (activeTab === "ongoing") matchesTab = event.status === "ongoing";
      else if (activeTab === "past") matchesTab = event.status === "completed" || event.timeStatus === "past";
      else if (activeTab === "saved") matchesTab = bookmarkedSlugs.includes(event.slug);

      let matchesGenre = true;
      if (activeGenre !== "all") {
        matchesGenre = (event.genre || "").toLowerCase().trim() === activeGenre.toLowerCase().trim();
      }

      const matchesType = filterType === "all" || event.type === filterType;
      const matchesMode = filterMode === "all" || event.mode === filterMode;

      return matchesSearch && matchesTab && matchesGenre && matchesType && matchesMode;
    });
  }, [events, search, activeTab, activeGenre, filterType, filterMode, bookmarkedSlugs]);

  const hasActiveFilters = search || activeTab !== "all" || activeGenre !== "all" || filterType !== "all" || filterMode !== "all";

  const clearFilters = () => {
    setSearch("");
    setActiveTab("all");
    setActiveGenre("all");
    setFilterType("all");
    setFilterMode("all");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={pageContainerRef} className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-zinc-900 flex flex-col font-sans selection:bg-amber-600 selection:text-white overflow-hidden">
      
      {/* ── 0. EVENT ANNOUNCEMENT (THEME-MATCHED) ── */}
      {!isBulletinDismissed && latestAnnouncement && (
        <div className="relative z-30 px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-300 shadow-sm transition-all hover:border-amber-400">
              
              {/* Left Badge & Announcement Text */}
              <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                <span className="px-3 py-1 rounded-xl bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider font-heading flex items-center gap-1.5 shrink-0 shadow-sm">
                  <IconBell size={13} />
                  Event Bulletin
                </span>

                <span className="text-xs sm:text-sm font-semibold text-zinc-800 truncate">
                  {latestAnnouncement.announcementText || `${latestAnnouncement.title} registration window is open.`}
                </span>
              </div>

              {/* Right Action Link & Dismiss Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Link
                  href={`/events/${latestAnnouncement.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-950 border border-amber-300 text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>View Details</span>
                  <IconArrowRight size={13} />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsBulletinDismissed(true)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-amber-100 rounded-xl transition-colors shrink-0"
                  title="Dismiss announcement"
                  aria-label="Dismiss announcement"
                >
                  <IconX size={15} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── 1. HERO SECTION (EDITORIAL & STATS) ── */}
      <section ref={heroRef} className="relative overflow-hidden pt-16 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="gsap-hero-title inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-300 text-amber-800 text-xs font-black tracking-[0.25em] uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1" />
              National Student Events & Summits
            </div>
            
            <h1 className="gsap-hero-title text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 font-heading leading-[1.05]">
              EMPOWERING MINDS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
                LEADING NATION BUILDING.
              </span>
            </h1>
            
            <p className="gsap-hero-title mt-6 text-base sm:text-lg text-zinc-700 font-medium leading-relaxed max-w-2xl mx-auto">
              Join India's premier student movement. Participate in national hackathons, technical symposiums, leadership bootcamps, and workshops at SVNIT Surat.
            </p>
          </div>

          {/* ── Spotlight Master Card ── */}
          {featuredEvent && (
            <div ref={featuredRef} className="relative group mb-16">
              {/* Outer Radiant Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-600/30 rounded-[36px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />
              
              <div className="relative rounded-3xl bg-white/95 backdrop-blur-md border border-amber-300 hover:border-amber-400 overflow-hidden shadow-2xl shadow-amber-950/10 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Aspect Visual Container */}
                  <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[440px] bg-zinc-950 overflow-hidden group/img">
                    {featuredEvent.coverImageURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredEvent.coverImageURL}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover transform group-hover/img:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover/img:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 flex items-center justify-center p-8 text-center text-3xl font-black font-heading text-white">
                        {featuredEvent.title}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    {/* Top Status Chips */}
                    <div className="absolute top-5 left-5 flex flex-wrap gap-2.5 z-10">
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Hero Spotlight
                      </span>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white text-zinc-900 border border-amber-200 shadow-md">
                        {featuredEvent.type}
                      </span>
                      {featuredEvent.mode && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-200 border border-amber-300/30 shadow-md">
                          {featuredEvent.mode}
                        </span>
                      )}
                    </div>

                    {/* Bottom Floating Info */}
                    <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 text-white z-10">
                      <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs sm:text-sm font-bold shadow-lg">
                        <IconCalendar size={16} className="text-amber-400" />
                        <span>{formatDate(featuredEvent.startDateTime)}</span>
                      </div>

                      {featuredEvent.venue && (
                        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-semibold">
                          <IconMapPin size={14} className="text-amber-400" />
                          <span className="truncate max-w-[200px]">{featuredEvent.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Editorial Details */}
                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/20">
                    <div>
                      <div className="flex items-center gap-2.5 mb-3.5">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-800 bg-amber-100/90 px-3 py-1 rounded-lg border border-amber-300">
                          {featuredEvent.genre || "Featured Event"}
                        </span>
                        {featuredEvent.registrationsCount !== undefined && featuredEvent.registrationsCount > 0 && (
                          <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                            <IconUsers size={13} className="text-amber-700" /> {featuredEvent.registrationsCount}+ Registered
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 leading-tight font-heading mb-4">
                        {featuredEvent.title}
                      </h2>

                      <p className="text-zinc-700 text-sm sm:text-base leading-relaxed font-medium">
                        {featuredEvent.shortDescription || featuredEvent.description}
                      </p>

                      {/* Speaker previews */}
                      {featuredEvent.speakerDetails && featuredEvent.speakerDetails.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-amber-200/80">
                          <p className="text-xs font-black uppercase tracking-widest text-amber-900 mb-2.5 font-heading">Keynote Speakers & Guests</p>
                          <div className="flex flex-wrap gap-2">
                            {featuredEvent.speakerDetails.slice(0, 2).map((spk, idx) => (
                              <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-zinc-900 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                {spk.name} <span className="text-zinc-500 font-normal">({spk.role || spk.organization})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-amber-200/80 flex flex-col sm:flex-row gap-3">
                      <Link
                        href={`/events/${featuredEvent.slug}`}
                        className="flex-1 text-center py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        Explore & Register Pass <IconArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" />
                      </Link>
                      
                      <button
                        onClick={(e) => toggleBookmark(featuredEvent.slug, e)}
                        className={`px-5 py-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          bookmarkedSlugs.includes(featuredEvent.slug)
                            ? "bg-amber-100 border-amber-300 text-amber-950 shadow-inner"
                            : "bg-white border-amber-200 hover:bg-amber-50 text-zinc-900 shadow-sm"
                        }`}
                        title="Bookmark Event"
                      >
                        {bookmarkedSlugs.includes(featuredEvent.slug) ? (
                          <>
                            <IconBookmarkFilled size={16} className="text-amber-600" /> Saved
                          </>
                        ) : (
                          <>
                            <IconBookmark size={16} className="text-zinc-700" /> Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 4 Glass Stats Row ── */}
          <div className="gsap-stats-row grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="gsap-stat-box rounded-3xl bg-white/85 backdrop-blur-md border border-amber-200/90 p-6 text-center shadow-sm hover:shadow-md transition-all">
              <span className="text-3xl sm:text-4xl font-black text-amber-700 font-heading block mb-1">
                {events.length}
              </span>
              <span className="text-xs text-zinc-700 font-extrabold uppercase tracking-wider">Total Events</span>
            </div>

            <div className="gsap-stat-box rounded-3xl bg-white/85 backdrop-blur-md border border-amber-200/90 p-6 text-center shadow-sm hover:shadow-md transition-all">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 font-heading block mb-1">
                {events.filter((e) => e.timeStatus === "active").length}
              </span>
              <span className="text-xs text-zinc-700 font-extrabold uppercase tracking-wider">Live & Active</span>
            </div>

            <div className="gsap-stat-box rounded-3xl bg-white/85 backdrop-blur-md border border-amber-200/90 p-6 text-center shadow-sm hover:shadow-md transition-all">
              <span className="text-3xl sm:text-4xl font-black text-orange-700 font-heading block mb-1">
                {events.filter((e) => e.status === "upcoming").length}
              </span>
              <span className="text-xs text-zinc-700 font-extrabold uppercase tracking-wider">Upcoming Summits</span>
            </div>

            <div 
              onClick={() => setActiveTab("saved")}
              className="gsap-stat-box rounded-3xl bg-white/85 backdrop-blur-md border border-amber-200/90 p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-3xl sm:text-4xl font-black text-amber-700 font-heading block mb-1 group-hover:scale-105 transition-transform">
                {bookmarkedSlugs.length}
              </span>
              <span className="text-xs text-zinc-700 font-extrabold uppercase tracking-wider">Saved Bookmarks</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. ROADMAP / APPLICATION PATH ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-amber-200/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black tracking-[0.3em] text-amber-700 uppercase mb-2 font-heading">
              Four-Step Experience
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-black text-zinc-950">
              How Our Events Work
            </h2>
          </div>

          <div className="flex flex-col relative gap-4">
            {EVENT_STEPS.map((s, i) => (
              <div
                key={s.step}
                onMouseEnter={() => setActiveStep(i)}
                className={`relative z-10 flex gap-6 sm:gap-8 items-start p-6 rounded-3xl transition-all duration-300 cursor-pointer ${
                  i === activeStep 
                    ? "bg-white/95 shadow-xl border border-amber-300 scale-[1.02]" 
                    : "bg-white/60 border border-amber-200/60 hover:bg-white/80"
                }`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black font-heading transition-colors duration-300 shadow-md ${
                  i === activeStep ? "bg-amber-600 text-white" : "bg-white text-amber-700 border border-amber-300"
                }`}>
                  {s.step}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-black text-zinc-950 font-heading">
                      {s.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. EVENTS DIRECTORY & FILTER DOCK ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        
        {/* Genre / Domain Selector Pills */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5 font-heading">
              <IconLayers size={15} className="text-amber-700" /> Filter by Domain / Focus Track
            </span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {genreOptions.map((g) => {
              const IconComp = g.icon;
              const isSelected = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap flex items-center gap-2 transition-all duration-200 border ${
                    isSelected
                      ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 scale-[1.02]"
                      : "bg-white/85 text-zinc-800 border-amber-200 hover:bg-amber-100/60 hover:border-amber-300"
                  }`}
                >
                  <IconComp size={14} className={isSelected ? "text-white" : "text-amber-700"} />
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab & Search Control Dock */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-amber-300 p-6 sm:p-8 shadow-xl shadow-amber-950/5 mb-14 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200 pb-5">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "All Events" },
                { id: "upcoming", label: "Upcoming" },
                { id: "ongoing", label: "Live Now" },
                { id: "past", label: "Past Archive" },
                { id: "saved", label: `Saved (${bookmarkedSlugs.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                      : "text-zinc-700 hover:bg-amber-100/60 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-amber-900 font-heading">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5 font-heading">
                Search Events
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, speaker, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl py-2.5 pl-9 pr-8 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-medium"
                />
                <IconSearch size={16} className="absolute left-3 top-3 text-amber-700" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-900">
                    <IconX size={14} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5 font-heading">
                Format / Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
              >
                <option value="all">All Formats</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="competition">Competition / Hackathon</option>
                <option value="talk">Keynote / Talk</option>
                <option value="social">Social Initiative</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-1.5 font-heading">
                Delivery Mode
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
              >
                <option value="all">All Modes</option>
                <option value="offline">Offline @ SVNIT Surat</option>
                <option value="online">Online / Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200 text-xs">
              <span className="text-zinc-700 font-bold uppercase tracking-wider">Active Filters:</span>
              {search && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 font-semibold flex items-center gap-1">
                  &quot;{search}&quot;
                  <button onClick={() => setSearch("")} className="hover:text-rose-600 ml-1"><IconX size={12} /></button>
                </span>
              )}
              {activeGenre !== "all" && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 font-semibold flex items-center gap-1 uppercase">
                  Genre: {activeGenre}
                  <button onClick={() => setActiveGenre("all")} className="hover:text-rose-600 ml-1"><IconX size={12} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="ml-auto text-amber-800 font-bold underline cursor-pointer hover:text-amber-950">
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── 5. EVENT CARDS SHOWCASE GRID ── */}
        <div ref={cardsGridRef}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl bg-white/70 border border-amber-200 h-[460px] animate-pulse p-6" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white/85 border border-amber-200 p-8 shadow-md">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
                <IconCalendar size={32} />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 font-heading">No Events Found</h3>
              <p className="mt-2 text-sm text-zinc-700 max-w-md mx-auto font-medium">
                No events matched your current filters or search query.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={clearFilters} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200">
                  Clear Filters
                </button>
                <Link href="/admin" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-md">
                  Admin Panel
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const isActive = event.timeStatus === "active";

                return (
                  <div
                    key={event.id}
                    className="gsap-card group flex flex-col justify-between overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm border border-amber-200/90 hover:border-amber-400 shadow-md hover:shadow-2xl hover:shadow-amber-950/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Card Header Media */}
                    <div className="relative h-60 w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                      {event.coverImageURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImageURL}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 flex items-center justify-center text-white font-black p-6 text-center text-xl font-heading">
                          {event.title}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Format Badges */}
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                        <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg bg-amber-600 text-white shadow-md">
                          {event.type}
                        </span>
                        {event.mode && (
                          <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-white/95 text-zinc-900 border border-amber-200 shadow-sm">
                            {event.mode}
                          </span>
                        )}
                      </div>

                      {/* Bookmark & Status Top Right */}
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
                        <button
                          onClick={(e) => toggleBookmark(event.slug, e)}
                          title={bookmarkedSlugs.includes(event.slug) ? "Remove Bookmark" : "Save Event"}
                          className="p-1.5 rounded-xl bg-black/70 backdrop-blur-md text-amber-300 hover:text-white border border-white/20 transition-all active:scale-90"
                        >
                          {bookmarkedSlugs.includes(event.slug) ? (
                            <IconBookmarkFilled size={15} className="text-amber-400" />
                          ) : (
                            <IconBookmark size={15} />
                          )}
                        </button>
                        
                        <span className={`px-3 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider text-white shadow-sm ${
                          isActive ? "bg-emerald-600" : "bg-zinc-800/90"
                        }`}>
                          {isActive ? "Live Now" : event.status}
                        </span>
                      </div>

                      {/* Bottom Date Pill */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white font-bold z-10">
                        <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
                          <IconCalendar size={13} className="text-amber-300" />
                          {formatDate(event.startDateTime)}
                        </span>
                        
                        {event.registrationsCount !== undefined && event.registrationsCount > 0 && (
                          <span className="text-[11px] font-extrabold bg-amber-600/95 backdrop-blur-md text-white px-2.5 py-1 rounded-xl">
                            {event.registrationsCount} Registered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-b from-white via-white to-amber-50/20">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-800 mb-2.5">
                          <span className="flex items-center gap-1">
                            <IconMapPin size={13} className="text-amber-700 shrink-0" />
                            <span className="truncate">{event.venue || "SVNIT Campus"}</span>
                          </span>
                          
                          {event.genre && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-amber-100 border border-amber-300/80 text-amber-950">
                              {event.genre}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-zinc-950 font-heading line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors mb-2.5">
                          {event.title}
                        </h3>

                        <p className="text-zinc-600 text-sm line-clamp-2 leading-relaxed font-medium">
                          {event.shortDescription || event.description}
                        </p>

                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {event.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1">
                                <IconTag size={9} className="text-amber-700" /> #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between gap-4">
                        <span className="text-xs font-black text-amber-900">
                          {event.fee || "Free Delegate Pass"}
                        </span>
                        
                        <Link
                          href={`/events/${event.slug}`}
                          className="py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-100 hover:bg-amber-600 hover:text-white transition-all flex items-center gap-1 group/btn shadow-sm"
                        >
                          View Details <IconChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Global Style for Marquee Animation */}
      <style>{`
        @keyframes conclaveMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-conclave-marquee {
          animation: conclaveMarquee 25s linear infinite;
        }
        .animate-conclave-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

    </div>
  );
}

