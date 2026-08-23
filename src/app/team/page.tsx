"use client";

import { useEffect, useState } from "react";
import {
  getTeamMembers,
  getSessionYears,
  groupMembersByTeam,
  TeamMember,
  TeamGroup,
} from "../../lib/teamService";

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

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasSocials = member.socialLinks.linkedin || member.socialLinks.email;

  return (
    <div className="group flex flex-col items-center text-center card-orange-glass-light bg-white/95 rounded-3xl border border-amber-300 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      {/* Photo / Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-amber-400/40 ring-offset-2 ring-offset-white shadow-lg mb-4">
        {member.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoURL}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl select-none font-heading">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-black text-slate-950 text-base leading-tight font-heading">
        {member.name}
      </h3>

      {/* Position */}
      <p className="text-amber-700 font-extrabold text-sm mt-1">
        {member.position}
      </p>

      {/* Social Links */}
      {hasSocials && (
        <div className="flex items-center gap-2 mt-4">
          {member.socialLinks.linkedin && (
            <a
              href={member.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-amber-200"
            >
              <LinkedInIcon />
            </a>
          )}
          {member.socialLinks.email && (
            <a
              href={`mailto:${member.socialLinks.email}`}
              aria-label={`Email ${member.name}`}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <EmailIcon />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────

function TeamSection({ group }: { group: TeamGroup }) {
  return (
    <section className="space-y-6">
      {/* Category Header */}
      <div className="flex items-center gap-3 border-b border-amber-300 pb-3">
        <div className="w-1.5 h-7 rounded-full bg-amber-600" />
        <h2 className="text-xl font-black text-slate-950 font-heading">
          {group.designation}
        </h2>
        <span className="text-xs font-black text-amber-950 bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded-full font-heading">
          {group.members.length}
        </span>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {group.members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

// ─── Skeleton Loading State ───────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="space-y-12">
      {[1, 2].map((s) => (
        <div key={s} className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-8 rounded-full bg-amber-300" />
            <div className="h-6 w-32 bg-amber-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((c) => (
              <div
                key={c}
                className="card-orange-glass-light bg-white/95 rounded-3xl border border-amber-300 p-6 flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 rounded-full bg-amber-200" />
                <div className="h-4 w-24 bg-amber-200 rounded" />
                <div className="h-3 w-20 bg-amber-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [sessionYears, setSessionYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearsLoaded, setYearsLoaded] = useState(false);

  // 1. Load available session years → auto-select the most recent (index 0)
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
      } catch (err) {
        console.error("Failed to load team members:", err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [selectedYear, yearsLoaded]);

  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-xl py-12 px-6 sm:px-12 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Title */}
            <div>
              <span className="inline-block text-xs font-black tracking-widest text-amber-700 uppercase mb-3 font-heading">
                Think India · SVNIT Chapter
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-heading">
                Meet Our <span className="text-amber-700">Team</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-800 font-semibold max-w-xl leading-relaxed">
                The passionate students driving innovation, leadership, and national spirit at SVNIT Surat.
              </p>
            </div>

            {/* Year Dropdown */}
            {sessionYears.length > 0 && (
              <div className="flex-shrink-0 flex flex-col gap-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider font-heading">
                  Session Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-amber-300 rounded-2xl py-2.5 px-4 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-950 shadow-sm min-w-[140px]"
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
      </section>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <SkeletonGrid />
        ) : groups.length === 0 ? (
          <div className="text-center py-20 card-orange-glass-light bg-white/95 rounded-3xl border border-amber-300 shadow-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto mb-4 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-950 font-heading">No Team Members Yet</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {sessionYears.length === 0
                ? "No team data found. Please add members from the Admin Panel."
                : `No members found for the ${selectedYear} session.`}
            </p>
            <a
              href="/admin/team"
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl shadow-md transition-colors"
            >
              Go to Admin Panel →
            </a>
          </div>
        ) : (
          <div className="space-y-14">
            {groups.map((group) => (
              <TeamSection key={group.designation} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
