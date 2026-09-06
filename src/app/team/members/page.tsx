"use client";

import { useEffect, useState, useRef } from "react";
import {
  getTeamMembers,
  getSessionYears,
  groupMembersByTeam,
  TeamMember,
  TeamGroup,
} from "../../../lib/teamService";

// ─── Animated Counter Hook ────────────────────────────────────────────────----

function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end <= 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOutQuad = percentage * (2 - percentage);
      const currentCount = Math.floor(easeOutQuad * end);

      setCount(currentCount);

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
}

// ─── Social Link Icons ────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────----

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: TeamMember;
  hoveredCardId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}

function MemberCard({ member, hoveredCardId, onHover, onLeave }: MemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasSocials = member.socialLinks.linkedin || member.socialLinks.email;
  const isOtherHovered = hoveredCardId !== null && hoveredCardId !== member.id;
  const isThisHovered = hoveredCardId === member.id;

  const roleType = member.designation || "Core";
  const cellName = member.position || "General";

  const handleCardClick = () => {
    if (isMobile) {
      setIsFlipped(prev => !prev);
    }
  };

  // For mobile: use click state, for desktop: use hover state
  const shouldFlip = isMobile ? isFlipped : isThisHovered;

  return (
    <div
      onMouseEnter={() => !isMobile && member.id && onHover(member.id)}
      onMouseLeave={() => !isMobile && onLeave()}
      onClick={handleCardClick}
      className={`w-full h-[320px] flex items-center justify-center [perspective:1000px] transition-all duration-300 ${
        isOtherHovered && !isMobile ? "opacity-25 scale-[0.98]" : "opacity-100 scale-100"
      }`}
    >
      <div
        className={`relative w-full h-full duration-300 [transform-style:preserve-3d] transition-all ease-out cursor-pointer will-change-transform ${
          shouldFlip 
            ? isMobile 
              ? "[transform:rotateY(180deg)] z-50 shadow-2xl" 
              : "[transform:rotateY(180deg)_scale(1.15)] z-50 shadow-2xl"
            : "[transform:rotateY(0deg)_scale(1.0)] z-0"
        }`}
      >
        
        {/* ── Front Side ── */}
        <div className="absolute inset-0 w-full h-full bg-white border border-amber-300 shadow-md rounded-2xl p-5 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:translateZ(0)] hover:shadow-xl transition-shadow group">
          {/* Image container with group-hover zoom effect on the image */}
          <div className="w-[135px] h-[135px] rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-900 font-black text-4xl mb-3 shadow-sm overflow-hidden flex-shrink-0">
            {member.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={member.photoURL} 
                alt={member.name} 
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" 
              />
            ) : (
              <span className="transition-transform duration-500 ease-out group-hover:scale-110 inline-block">
                {initials}
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-slate-950 font-heading text-xl tracking-tight leading-tight truncate w-full px-1">
            {member.name}
          </h3>
          <p className="text-amber-800 font-extrabold text-xs mt-0.5 truncate w-full px-1">
            {member.position}
          </p>
          <span className="inline-block mt-2.5 text-[9px] font-black tracking-wider uppercase text-amber-950/60 bg-amber-100/50 border border-amber-300/40 px-2.5 py-0.5 rounded-lg shadow-sm">
            {isMobile ? 'Tap to connect →' : 'Hover to connect →'}
          </span>
        </div>

        {/* ── Back Side (Darker Beige/Cream Tones) ── */}
        {/* Added [backface-visibility:hidden], [transform:rotateY(180deg)_translateZ(1px)], and antialiased rendering properties */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-200 via-amber-100 to-stone-100 border border-amber-300 shadow-2xl rounded-2xl p-4 flex flex-col items-center justify-between text-center [transform:rotateY(180deg)_translateZ(1px)] [backface-visibility:hidden] [backface-visibility:_hidden] [transform-style:preserve-3d] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]">
          
          {/* Top row: Avatar & Identity + Two Info Boxes */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-3 w-full text-left">
              <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 border-amber-200 shadow-sm group/avatar">
                {member.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={member.photoURL} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-amber-700 flex items-center justify-center text-white font-black text-xs select-none">
                    {initials}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-black text-slate-900 font-heading text-[20px] truncate tracking-tight drop-shadow-sm">{member.name}</h4>
                <p className="text-amber-900 text-[11px] font-extrabold truncate">{member.position}</p>
              </div>
            </div>

            {/* Two boxes showing Role Type & Cell Name */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-white/60 border border-amber-300/60 backdrop-blur-sm rounded-lg py-1 px-2 text-center shadow-sm">
                <span className="block text-[8px] uppercase tracking-widest text-amber-800 font-bold">Role</span>
                <span className="block text-[11px] font-black text-slate-900 truncate">{roleType}</span>
              </div>
              <div className="bg-white/60 border border-amber-300/60 backdrop-blur-sm rounded-lg py-1 px-2 text-center shadow-sm">
                <span className="block text-[8px] uppercase tracking-widest text-amber-800 font-bold">Cell</span>
                <span className="block text-[11px] font-black text-slate-900 truncate">{cellName}</span>
              </div>
            </div>
          </div>

          {/* Middle: Description */}
          <div className="my-1 flex-1 flex items-center justify-center w-full">
            {member.description ? (
              <p className="text-slate-800 text-xs line-clamp-2 leading-relaxed font-medium">
                &ldquo;{member.description}&rdquo;
              </p>
            ) : (
              <p className="text-amber-700/70 text-[11px] italic">No description provided.</p>
            )}
          </div>

          {/* Bottom: Social Links */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-amber-400/40">
            <span className="text-[9px] uppercase tracking-widest text-amber-900 font-extrabold">Connect</span>
            {hasSocials ? (
              <div className="flex items-center gap-1.5">
                {member.socialLinks.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/90 border border-amber-400 flex items-center justify-center text-amber-900 hover:bg-slate-900 hover:text-white transition-colors shadow-sm"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {member.socialLinks.email && (
                  <a
                    href={`mailto:${member.socialLinks.email}`}
                    aria-label={`Email ${member.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/90 border border-amber-400 flex items-center justify-center text-amber-900 hover:bg-slate-900 hover:text-white transition-colors shadow-sm"
                  >
                    <EmailIcon />
                  </a>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-amber-700/70 italic">None</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Team Section Component ───────────────────────────────────────────────────

interface TeamSectionProps {
  group: TeamGroup;
  hoveredCardId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}

function TeamSection({ group, hoveredCardId, onHover, onLeave }: TeamSectionProps) {
  const isSectionDimmed = hoveredCardId !== null && !group.members.some(m => m.id === hoveredCardId);

  return (
    <section className={`w-full space-y-12 transition-all duration-300 ${isSectionDimmed ? "opacity-30" : "opacity-100"}`}>
      {/* Group Heading */}
      <ScrollReveal className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-heading">
          {group.designation}
        </h2>
        <div className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-900 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          {group.members.length} {group.members.length === 1 ? "member" : "members"}
        </div>
      </ScrollReveal>
      
      {/* Cards Grid: 3 columns layout with wider gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full py-4">
        {group.members.map((member, index) => (
          <ScrollReveal key={member.id} delay={(index % 3) * 100}>
            <MemberCard
              member={member}
              hoveredCardId={hoveredCardId}
              onHover={onHover}
              onLeave={onLeave}
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-16">
      {[1, 2].map((s) => (
        <div key={s} className="animate-pulse space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-7 w-48 bg-amber-200/50 rounded-xl" />
            <div className="h-5 w-24 bg-amber-200/50 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            {[1, 2, 3].map((c) => (
              <div
                key={c}
                className="bg-white/80 rounded-2xl border border-amber-300 h-[320px] p-5 flex flex-col items-center justify-center space-y-3 shadow-sm"
              >
                <div className="w-[135px] h-[135px] rounded-full bg-amber-200/60" />
                <div className="h-5 w-32 bg-amber-200/60 rounded" />
                <div className="h-3 w-20 bg-amber-200/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const [sessionYears, setSessionYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearsLoaded, setYearsLoaded] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll position for right-edge indicator bar
  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Load session years
  useEffect(() => {
    async function initYears() {
      try {
        const years = await getSessionYears();
        setSessionYears(years);
        if (years.length > 0) setSelectedYear(years[0]);
        else setLoading(false);
      } catch (err) {
        console.error("Failed to load session years:", err);
        setLoading(false);
      } finally {
        setYearsLoaded(true);
      }
    }
    initYears();
  }, []);

  // 2. Load members on year change
  useEffect(() => {
    if (!yearsLoaded || !selectedYear) return;
    async function loadMembers() {
      setLoading(true);
      try {
        const members = await getTeamMembers(selectedYear);
        setGroups(groupMembersByTeam(members));
      } catch (err) {
        console.error("Failed to load team members:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [selectedYear, yearsLoaded]);

  // Calculations for summary stats boxes
  const totalMembersCount = groups.reduce((acc, g) => acc + g.members.length, 0);
  
  const cellHeadCount = groups
    .filter((g) => g.designation.toLowerCase().includes("head") || g.designation.toLowerCase().includes("lead"))
    .reduce((acc, g) => acc + g.members.length, 0);
    
  const coreCount = totalMembersCount - cellHeadCount;

  // Animated numbers incrementing from 0 when loaded/changed
  const animatedTotal = useCountUp(totalMembersCount, 800);
  const animatedCore = useCountUp(coreCount, 800);
  const animatedCellHead = useCountUp(cellHeadCount, 800);

  return (
    <div className="flex-1 bg-orange-glow-radial-light bg-amber-grid-pattern-light min-h-screen relative font-sans selection:bg-amber-600 selection:text-white overflow-x-hidden">

      {/* ── Progress Line Pinned to Right Edge ── */}
      <div className="fixed right-0 top-0 bottom-0 w-[3px] bg-amber-200/50 z-[9999] pointer-events-none">
        <div
          className="w-full bg-amber-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,119,6,0.5)]"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Top Bar with Back Button & Year Dropdown ── */}
      <div className="bg-white/90 backdrop-blur-md border-b border-amber-300 sticky top-0 z-20 shadow-sm animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a
            href="/team"
            className="inline-flex items-center text-xs font-extrabold text-amber-950 hover:text-amber-800 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-md transition-colors"
          >
            ← Back to Overview
          </a>

          {sessionYears.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider hidden sm:inline">
                Session Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-amber-300 rounded-xl py-2 px-3 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 shadow-sm"
              >
                {sessionYears.map((year) => (
                  <option key={year} value={year}>
                    {year}{year === sessionYears[0] ? " (Latest)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Header Counter & 3 Summary Boxes Area ── */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-4 text-center space-y-6">
        <div className="text-xs font-bold text-slate-700">
          Viewing team composition for session <strong className="text-amber-800">{selectedYear}</strong>
        </div>

        {/* Three boxes with numbers counting up from 0 */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
          <div className="bg-white border border-amber-300/80 rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Members</span>
            <span className="text-xl sm:text-2xl font-black text-slate-950 font-heading mt-0.5">{animatedTotal}</span>
          </div>
          <div className="bg-white border border-amber-300/80 rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Core</span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 font-heading mt-0.5">{animatedCore}</span>
          </div>
          <div className="bg-white border border-amber-300/80 rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700">Cell Head</span>
            <span className="text-xl sm:text-2xl font-black text-orange-800 font-heading mt-0.5">{animatedCellHead}</span>
          </div>
        </div>
      </div>

      {/* ── Content Grid Area ── */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <LoadingSkeleton />
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-amber-300 shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-extrabold text-slate-950 font-heading">No Members Found</h3>
            <p className="mt-2 text-sm text-slate-700 font-medium">
              No team members found for the {selectedYear} session.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {groups.map((group) => (
              <TeamSection
                key={group.designation}
                group={group}
                hoveredCardId={hoveredCardId}
                onHover={setHoveredCardId}
                onLeave={() => setHoveredCardId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Global CSS keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}