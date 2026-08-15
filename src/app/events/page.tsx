"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, Event } from "../../lib/eventsService";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all"); // all, active, past
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter logic
  const filteredEvents = events.filter((event) => {
    // Search
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      (event.tags && event.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));

    // Type
    const matchesType = filterType === "all" || event.type === filterType;

    // Mode
    const matchesMode = filterMode === "all" || event.mode === filterMode;

    // Time status
    const matchesTime = filterTime === "all" || event.timeStatus === filterTime;

    // Status
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;

    return matchesSearch && matchesType && matchesMode && matchesTime && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Title Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl">
          Events & Activities
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explore upcoming workshops, hackathons, seminars, and other events organized by Think India SVNIT.
        </p>
      </div>

      {/* Search & Filters Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Search Events</label>
            <input
              type="text"
              placeholder="Search by title, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="webinar">Webinar</option>
              <option value="competition">Competition</option>
              <option value="talk">Talk</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Time Filter (Past / Active) */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Timeframe</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
            >
              <option value="all">All Events</option>
              <option value="active">Active</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <span className="mt-4 text-zinc-500">Loading events...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">No events found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {events.length === 0
              ? "There are no events registered yet. Go to the Admin Panel to create your first event!"
              : "Try adjusting your search term or filters."}
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
            >
              Go to Admin Panel
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isActive = event.timeStatus === "active";
            return (
              <div
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Cover Image Container */}
                <div className="relative h-48 w-full bg-zinc-150 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                  {event.coverImageURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.coverImageURL}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold p-4 text-center select-none">
                      {event.title}
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded bg-amber-600 text-white tracking-wider">
                      {event.type}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded bg-zinc-900/80 backdrop-blur-sm text-white tracking-wider">
                      {event.mode}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded shadow-sm text-white ${
                        isActive ? "bg-emerald-600" : "bg-zinc-500"
                      }`}
                    >
                      {isActive ? "Active" : "Past"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 block mb-1">
                      {formatDate(event.startDateTime)}
                    </span>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-1 mb-2">
                      {event.title}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {event.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      📍 {event.venue || "Online"}
                    </span>
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1 group/btn"
                    >
                      View Details
                      <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
