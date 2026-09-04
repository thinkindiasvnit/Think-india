"use client";

import { useEffect, useState, useRef } from "react";
import {
  getTeamMembers,
  getSessionYears,
  groupMembersByTeam,
  TeamMember,
  TeamGroup,
} from "../../../lib/teamService";

// ─── Social Link Icons ────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

// ─── Scroll Reveal Wrapper for Sections & Cards ─────────────────────────────

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

// ─── Member Card ─────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasSocials = member.socialLinks.linkedin || member.socialLinks.email;

  return (
    <div className="w-full h-[260px] [perspective:1000px]">
      <div className="relative w-full h-full duration-300 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)] cursor-pointer will-change-transform">
        
        {/* ── Front Side ── */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:translateZ(0)]">
          <h3 className="font-extrabold text-zinc-900 dark:text-white text-2xl tracking-tight">
            {member.name}
          </h3>
          <p className="text-amber-600 dark:text-amber-500 font-semibold text-base mt-2">
            {member.position}
          </p>
          <span className="inline-block mt-6 text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            Hover to learn more →
          </span>
        </div>

        {/* ── Back Side (Border thickness set to 3px) ── */}
        <div className="absolute inset-0 w-full h-full bg-white/95 dark:bg-zinc-900/95 border-[3px] border-amber-500/50 dark:border-amber-500/60 shadow-md rounded-2xl p-6 flex flex-col items-center justify-between text-center [transform:rotateY(180deg)_translateZ(0)] [backface-visibility:hidden]">
          
          {/* Top row: w-[100px] h-[100px] Avatar & Identity */}
          <div className="flex items-center gap-4 w-full text-left">
            <div className="flex-shrink-0 w-[100px] h-[100px] rounded-full overflow-hidden ring-2 ring-amber-500/40 shadow-md">
              {member.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg select-none">
                  {initials}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-zinc-900 dark:text-white text-lg truncate">{member.name}</h4>
              <p className="text-amber-600 dark:text-amber-500 text-xs font-semibold truncate mt-0.5">{member.position}</p>
            </div>
          </div>

          {/* Middle: Description */}
          <div className="my-2 flex-1 flex items-center justify-center w-full">
            {member.description ? (
              <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                "{member.description}"
              </p>
            ) : (
              <p className="text-zinc-400 dark:text-zinc-500 text-xs italic">No description provided.</p>
            )}
          </div>

          {/* Bottom: Social Links */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Connect</span>
            {hasSocials ? (
              <div className="flex items-center gap-2">
                {member.socialLinks.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {member.socialLinks.email && (
                  <a
                    href={`mailto:${member.socialLinks.email}`}
                    aria-label={`Email ${member.name}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  >
                    <EmailIcon />
                  </a>
                )}
              </div>
            ) : (
              <span className="text-xs text-zinc-400 italic">None</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────

function TeamSection({ group }: { group: TeamGroup }) {
  return (
    <section className="w-full space-y-8">
      {/* Centered Orange Heading with Scroll Animation */}
      <ScrollReveal className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-500 font-sans">
          {group.designation}
        </h2>
        <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          {group.members.length} {group.members.length === 1 ? "member" : "members"}
        </div>
      </ScrollReveal>
      
      {/* Cards Grid with Staggered Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {group.members.map((member, index) => (
          <ScrollReveal key={member.id} delay={(index % 2) * 120}>
            <MemberCard member={member} />
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
            <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((c) => (
              <div
                key={c}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-[260px] p-8 flex flex-col items-center justify-center space-y-4"
              >
                <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const [sessionYears, setSessionYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearsLoaded, setYearsLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("All");
  
  // Reference for content container to scroll down smoothly
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for scroll percentage
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll position
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

  // 1. Load available session years
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

  // 2. Reload members whenever the selected year changes
  useEffect(() => {
    if (!yearsLoaded || !selectedYear) return;
    async function loadMembers() {
      setLoading(true);
      try {
        const members = await getTeamMembers(selectedYear);
        setGroups(groupMembersByTeam(members));
        setSelectedRole("All");
      } catch (err) {
        console.error("Failed to load team members:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [selectedYear, yearsLoaded]);

  // Handle role selection with smooth scroll down
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (contentRef.current) {
      const yOffset = -100; // Offset for sticky header
      const element = contentRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Filter groups based on selected role tab
  const filteredGroups = groups
    .map((group) => {
      if (selectedRole === "All") return group;
      const matchingMembers = group.members.filter((member) =>
        member.position.toLowerCase().includes(selectedRole.toLowerCase()) ||
        group.designation.toLowerCase().includes(selectedRole.toLowerCase())
      );
      return { ...group, members: matchingMembers };
    })
    .filter((group) => group.members.length > 0);

  const totalMembers = filteredGroups.reduce((acc, g) => acc + g.members.length, 0);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 min-h-screen relative">

      {/* ── Thin Progress Line Pinned to the Right Edge ── */}
      <div className="fixed right-0 top-0 bottom-0 w-[3px] bg-zinc-200/50 dark:bg-zinc-800/50 z-[9999] pointer-events-none">
        <div
          className="w-full bg-amber-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,119,6,0.5)]"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Top Bar with Back Button & Year Dropdown ── */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 shadow-sm animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a
            href="/team"
            className="inline-flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            ← Back to Overview
          </a>

          {sessionYears.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider hidden sm:inline">
                Session Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-zinc-300 dark:border-zinc-600 rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
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

      {/* ── Main Centered Filter Section (Intro text removed) ── */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 text-center space-y-4">
        {/* Big, Centered Filter Buttons */}
        {!loading && groups.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["All", "Core", "Cell Head"].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-md ${
                  selectedRole === role
                    ? "bg-amber-600 text-white shadow-amber-600/30"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/50"
                }`}
              >
                {role === "All" ? "All Members" : role}
              </button>
            ))}
          </div>
        )}

        {/* Stats Counter */}
        <div className="text-xs font-semibold text-zinc-400 pt-2">
          Showing <strong className="text-amber-600">{totalMembers}</strong> members for {selectedYear}
        </div>
      </div>

      {/* ── Content Grid Area (Targeted for scroll) ── */}
      <div ref={contentRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No Members Found</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No team members match the filter "{selectedRole}" for the {selectedYear} session.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {filteredGroups.map((group) => (
              <TeamSection key={group.designation} group={group} />
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