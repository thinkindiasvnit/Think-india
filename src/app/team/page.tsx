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
    <div className="group flex flex-col items-center text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Photo / Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-amber-500/30 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-lg mb-4">
        {member.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoURL}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl select-none">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-tight">
        {member.name}
      </h3>

      {/* Position — their specific role (e.g. "Technical Head") */}
      <p className="text-amber-600 dark:text-amber-500 font-semibold text-sm mt-1">
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <LinkedInIcon />
            </a>
          )}
          {member.socialLinks.email && (
            <a
              href={`mailto:${member.socialLinks.email}`}
              aria-label={`Email ${member.name}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
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
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 w-1 h-8 rounded-full bg-amber-600" />
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {group.designation}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {group.members.length} {group.members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {group.members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2].map((s) => (
        <div key={s} className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((c) => (
              <div
                key={c}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
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

  const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Title */}
            <div>
              <span className="inline-block text-xs font-black tracking-widest text-amber-600 uppercase mb-3">
                Think India · SVNIT Chapter
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Meet Our <span className="text-amber-600">Team</span>
              </h1>
              <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                The passionate students driving innovation, leadership, and national spirit at SVNIT Surat.
              </p>
            </div>

            {/* Year Dropdown — right side of hero */}
            {sessionYears.length > 0 && (
              <div className="flex-shrink-0 flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Session Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-zinc-300 dark:border-zinc-600 rounded-xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm min-w-[140px]"
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

      {/* ── Stats Bar ── */}
      {!loading && groups.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-600">{totalMembers}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Members</span>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-600">{groups.length}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Groups</span>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{selectedYear}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Session</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSkeleton />
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No Team Members Yet</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {sessionYears.length === 0
                ? "No team data found. Please add members from the Admin Panel."
                : `No members found for the ${selectedYear} session.`}
            </p>
            <a
              href="/admin/team"
              className="mt-6 inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors"
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
