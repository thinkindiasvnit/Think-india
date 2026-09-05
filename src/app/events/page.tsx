"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getEvents, Event } from "../../lib/eventsService";
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
  IconBookmarkFilled
} from "../../components/Icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "past" | "saved">("all");
  const [activeGenre, setActiveGenre] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

  // GSAP Animation Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
        if (typeof window !== "undefined") {
          const saved = JSON.parse(localStorage.getItem("think_india_bookmarks") || "[]");
          setBookmarkedSlugs(saved);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
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

  // Hardware-Accelerated Smooth GSAP ScrollTrigger Animations
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".gsap-hero-el",
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power1.out",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
              fastScrollEnd: true,
            },
          }
        );

        if (featuredRef.current) {
          gsap.fromTo(
            featuredRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: featuredRef.current,
                start: "top 88%",
                toggleActions: "play none none reverse",
                fastScrollEnd: true,
              },
            }
          );
        }

        gsap.fromTo(
          ".gsap-metric",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power1.out",
            scrollTrigger: {
              trigger: ".gsap-metric",
              start: "top 92%",
              toggleActions: "play none none reverse",
              fastScrollEnd: true,
            },
          }
        );
      });

      return () => ctx.revert();
    }
  }, [loading]);

  // High-performance GSAP Batch Animation for Event Cards Grid
  useEffect(() => {
    if (!loading && cardsGridRef.current) {
      const ctx = gsap.context(() => {
        ScrollTrigger.batch(".gsap-card", {
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power1.out", overwrite: "auto" }
            ),
          onLeaveBack: (batch) =>
            gsap.to(batch, { opacity: 0, y: 25, duration: 0.3, overwrite: "auto" }),
          start: "top 92%",
          fastScrollEnd: true,
        });
      }, cardsGridRef);

      return () => ctx.revert();
    }
  }, [search, activeTab, activeGenre, filterType, filterMode, loading]);

  // Featured Spotlight Event
  const featuredEvent = useMemo(() => {
    return (
      events.find((e) => e.isHeroSpotlight) ||
      events.find((e) => e.isFeatured && e.timeStatus === "active") ||
      events.find((e) => e.isFeatured) ||
      events[0]
    );
  }, [events]);

  // Latest Announced Event
  const latestAnnouncement = useMemo(() => {
    return (
      events.find((e) => e.isAnnouncement) ||
      events.find((e) => e.status === "upcoming" || e.timeStatus === "active") ||
      events[0]
    );
  }, [events]);

  // Dynamic All Genres List including custom admin genres
  const genreOptions = useMemo(() => {
    const defaultList = [
      { id: "all", label: "All Genres", icon: IconLayers },
      { id: "tech", label: "Technology & Hackathons", icon: IconLaptop },
      { id: "leadership", label: "Leadership & Policy", icon: IconAward },
      { id: "workshop", label: "Workshops & Skill Dev", icon: IconBookOpen },
      { id: "cultural", label: "Social & Cultural", icon: IconUsers },
      { id: "research", label: "Research & IPR", icon: IconShieldCheck },
    ];
    const knownIds = new Set(defaultList.map(g => g.id));
    const extraGenres: { id: string; label: string; icon: typeof IconTag }[] = [];

    events.forEach((ev) => {
      if (ev.genre && !knownIds.has(ev.genre.toLowerCase())) {
        knownIds.add(ev.genre.toLowerCase());
        extraGenres.push({
          id: ev.genre.toLowerCase(),
          label: ev.genre.charAt(0).toUpperCase() + ev.genre.slice(1),
          icon: IconTag,
        });
      }
    });

    return [...defaultList, ...extraGenres];
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
        if (activeGenre === "tech") matchesGenre = event.genre === "tech" || event.type === "competition" || (event.tags && event.tags.some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("tech")));
        else if (activeGenre === "leadership") matchesGenre = event.genre === "leadership" || event.type === "talk" || (event.tags && event.tags.some(t => t.toLowerCase().includes("leadership")));
        else if (activeGenre === "workshop") matchesGenre = event.genre === "workshop" || event.type === "workshop";
        else if (activeGenre === "cultural") matchesGenre = event.genre === "cultural" || event.type === "social";
        else if (activeGenre === "research") matchesGenre = event.genre === "research" || (event.tags && event.tags.some(t => t.toLowerCase().includes("ipr") || t.toLowerCase().includes("research")));
        else matchesGenre = event.genre?.toLowerCase() === activeGenre.toLowerCase();
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
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-zinc-900 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      
      {/* ── 0. TOP ANNOUNCEMENT TICKER BANNER ── */}
      {latestAnnouncement && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-2.5 px-4 shadow-md flex items-center justify-between text-xs font-bold tracking-wide border-b border-amber-600/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-black text-amber-200 border border-amber-300/30 shrink-0">
                <IconBell size={12} className="animate-bounce text-amber-200" />
                ANNOUNCEMENT
              </span>
              <span className="truncate font-semibold">
                {latestAnnouncement.announcementText || `${latestAnnouncement.title} details are live!`}
              </span>
            </div>
            <Link
              href={`/events/${latestAnnouncement.slug}`}
              className="ml-4 shrink-0 hover:underline flex items-center gap-1 font-extrabold text-amber-100 hover:text-white"
            >
              Explore <IconArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. HERO SPOTLIGHT ── */}
      <section ref={heroRef} className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-200/60">
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="gsap-hero-el gpu-accelerated inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
              Official SVNIT Chapter Conclaves
            </div>
            <h1 className="gsap-hero-el gpu-accelerated text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 font-heading leading-tight">
              Events & Conclaves
            </h1>
            <p className="gsap-hero-el gpu-accelerated mt-4 text-base sm:text-lg text-zinc-800 font-semibold leading-relaxed">
              Fostering national youth empowerment, technical innovation, policy debates, and academic workshops at SVNIT Surat.
            </p>
          </div>

          {/* 3D Featured Spotlight Card */}
          {featuredEvent && (
            <div ref={featuredRef} className="gpu-accelerated">
              <div className="relative rounded-3xl bg-white border border-amber-200 hover:border-amber-400 overflow-hidden shadow-xl shadow-amber-900/5 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] bg-zinc-100 overflow-hidden">
                    {featuredEvent.coverImageURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredEvent.coverImageURL}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center p-8 text-center text-2xl font-bold font-heading text-white">
                        {featuredEvent.title}
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-md">
                        Featured Conclave
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white text-zinc-900 border border-amber-200 shadow-sm">
                        {featuredEvent.type}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-b from-amber-50/60 via-white to-orange-50/40">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">
                        <IconCalendar size={14} className="text-amber-700" />
                        <span>{formatDate(featuredEvent.startDateTime)}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 leading-tight font-heading mb-3">
                        {featuredEvent.title}
                      </h2>
                      <p className="text-zinc-800 text-sm line-clamp-3 leading-relaxed font-medium">
                        {featuredEvent.shortDescription || featuredEvent.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-amber-200 text-xs text-zinc-800 font-semibold">
                      <div className="flex items-center gap-2">
                        <IconMapPin size={14} className="text-amber-700" />
                        <span>{featuredEvent.venue || "SVNIT Surat Campus"}</span>
                      </div>
                      {featuredEvent.eligibility && (
                        <div className="flex items-center gap-2">
                          <IconShieldCheck size={14} className="text-amber-700" />
                          <span>{featuredEvent.eligibility}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/events/${featuredEvent.slug}`}
                        className="w-full text-center py-3 px-5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        View Full Details <IconArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Ticker */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="gsap-metric gpu-accelerated card-orange-glass-light rounded-2xl p-4">
              <span className="text-2xl sm:text-3xl font-black text-amber-700 font-heading block">{events.length}</span>
              <span className="text-xs text-zinc-700 font-bold uppercase tracking-wider">Total Events</span>
            </div>
            <div className="gsap-metric gpu-accelerated card-orange-glass-light rounded-2xl p-4">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-heading block">
                {events.filter((e) => e.timeStatus === "active").length}
              </span>
              <span className="text-xs text-zinc-700 font-bold uppercase tracking-wider">Active Events</span>
            </div>
            <div className="gsap-metric gpu-accelerated card-orange-glass-light rounded-2xl p-4">
              <span className="text-2xl sm:text-3xl font-black text-orange-700 font-heading block">
                {events.filter((e) => e.status === "upcoming").length}
              </span>
              <span className="text-xs text-zinc-700 font-bold uppercase tracking-wider">Upcoming</span>
            </div>
            <div className="gsap-metric gpu-accelerated card-orange-glass-light rounded-2xl p-4 cursor-pointer" onClick={() => setActiveTab("saved")}>
              <span className="text-2xl sm:text-3xl font-black text-amber-700 font-heading block">{bookmarkedSlugs.length}</span>
              <span className="text-xs text-zinc-700 font-bold uppercase tracking-wider">Saved Events 🔖</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. GENRE SELECTOR & FILTER HUB ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Genre Selector Pills */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
              <IconLayers size={14} className="text-amber-700" /> Filter by Event Genre
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genreOptions.map((g) => {
              const IconComp = g.icon;
              const isSelected = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all duration-150 border ${
                    isSelected
                      ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-105"
                      : "bg-white text-zinc-800 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                  }`}
                >
                  <IconComp size={14} className={isSelected ? "text-white" : "text-amber-700"} />
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab & Search Control Box */}
        <div className="card-orange-glass-light rounded-3xl p-6 shadow-md mb-10 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200 pb-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "All Statuses" },
                { id: "upcoming", label: "Upcoming" },
                { id: "ongoing", label: "Ongoing" },
                { id: "past", label: "Past Archives" },
                { id: "saved", label: `Saved Events (${bookmarkedSlugs.length}) 🔖` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                      : "text-zinc-700 hover:bg-amber-100/60 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-amber-950">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <label className="block text-xs font-extrabold text-amber-950 uppercase tracking-wider mb-1.5">
                Search Events
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, speaker, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl py-2.5 pl-9 pr-8 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
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
              <label className="block text-xs font-extrabold text-amber-950 uppercase tracking-wider mb-1.5">
                Event Format / Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="competition">Competition / Hackathon</option>
                <option value="talk">Talk / Conclave</option>
                <option value="social">Social Drive</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-950 uppercase tracking-wider mb-1.5">
                Location Mode
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline (On Campus)</option>
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

        {/* ── 3. EVENTS GRID SHOWCASE ── */}
        <div ref={cardsGridRef}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-orange-glass-light rounded-3xl h-[420px] animate-pulse p-6" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 card-orange-glass-light rounded-3xl p-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
                <IconCalendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 font-heading">No Events Found</h3>
              <p className="mt-2 text-sm text-zinc-700 max-w-md mx-auto font-medium">
                No events matched your search query or filter selection.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={clearFilters} className="px-5 py-2.5 text-sm font-bold rounded-xl bg-amber-100 text-amber-950 border border-amber-300">
                  Clear Filters
                </button>
                <Link href="/admin" className="px-5 py-2.5 text-sm font-bold rounded-xl bg-amber-600 text-white">
                  Go to Admin Panel
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
                    className="gsap-card gpu-accelerated group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-amber-200 hover:border-amber-400 shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative h-52 w-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                      {event.coverImageURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImageURL}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 flex items-center justify-center text-white font-black p-6 text-center text-xl font-heading">
                          {event.title}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-amber-600 text-white shadow-sm">
                          {event.type}
                        </span>
                        <span className="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-white/90 text-zinc-900 border border-amber-200 shadow-sm">
                          {event.mode}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleBookmark(event.slug, e)}
                          title={bookmarkedSlugs.includes(event.slug) ? "Remove Bookmark" : "Save Event"}
                          className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 hover:text-white border border-white/20 transition-transform active:scale-95"
                        >
                          {bookmarkedSlugs.includes(event.slug) ? (
                            <IconBookmarkFilled size={14} className="text-amber-400" />
                          ) : (
                            <IconBookmark size={14} />
                          )}
                        </button>
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider text-white ${
                          isActive ? "bg-emerald-600" : "bg-zinc-700"
                        }`}>
                          {isActive ? "Active" : "Past Event"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                        <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                          <IconCalendar size={13} className="text-amber-300" />
                          {formatDate(event.startDateTime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/30">
                      <div>
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-2">
                          <IconMapPin size={13} className="text-amber-700" />
                          {event.venue || "SVNIT Campus"}
                        </span>

                        <h3 className="text-xl font-black text-zinc-950 font-heading line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors mb-2">
                          {event.title}
                        </h3>

                        <p className="text-sm text-zinc-700 line-clamp-2 leading-relaxed font-medium">
                          {event.shortDescription || event.description}
                        </p>

                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {event.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 flex items-center gap-1">
                                <IconTag size={10} className="text-amber-700" /> #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-amber-200">
                        <Link
                          href={`/events/${event.slug}`}
                          className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-extrabold text-zinc-950 bg-amber-100/70 border border-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all flex items-center justify-center gap-1 group/btn"
                        >
                          View Full Details <IconChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
    </div>
  );
}
