"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getEventBySlug, Event } from "../../../lib/eventsService";

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedEvent = await getEventBySlug(slug);
        setEvent(fetchedEvent);
      } catch (err) {
        console.error("Failed to load event:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <span className="mt-4 text-zinc-500">Loading event details...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="text-amber-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Event Not Found</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The event you are looking for does not exist or has been removed.
        </p>
        <div className="mt-6">
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const isRegistrationClosed = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;

  const isActive = event.timeStatus === "active";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Back to Events Nav */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 mb-6 transition-colors"
      >
        ← Back to Events
      </Link>

      {/* Main Cover Banner */}
      <div className="relative h-[350px] w-full rounded-3xl overflow-hidden bg-zinc-250 dark:bg-zinc-800 shadow-xl mb-10">
        {event.coverImageURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageURL}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white text-3xl font-extrabold p-8 text-center select-none">
            {event.title}
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-3">
          <span className="px-3 py-1.5 text-xs font-black uppercase rounded bg-amber-600 text-white tracking-widest shadow-md">
            {event.type}
          </span>
          <span className="px-3 py-1.5 text-xs font-black uppercase rounded bg-zinc-950/80 backdrop-blur-sm text-white tracking-widest shadow-md">
            {event.mode}
          </span>
          <span
            className={`px-3 py-1.5 text-xs font-black uppercase rounded shadow-md text-white ${
              isActive ? "bg-emerald-600" : "bg-zinc-600"
            }`}
          >
            {isActive ? "Active Event" : "Past Event"}
          </span>
        </div>
      </div>

      {/* Grid Layout for Detail & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {event.tags && event.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-full font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Speakers Section */}
          {event.speakerNames && event.speakerNames.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                <span>🎙️</span> Speakers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakerNames.map((speaker: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                      {speaker.charAt(0)}
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                      {speaker}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery Section */}
          {event.imageURLs && event.imageURLs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                <span>🖼️</span> Event Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.imageURLs.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gallery item ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl shadow-zinc-150/50 dark:shadow-none space-y-6">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Event Details
            </h2>

            {/* Timings */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Starts</span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                {formatDate(event.startDateTime)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Ends</span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                {formatDate(event.endDateTime)}
              </span>
            </div>

            {/* Venue */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Venue / Location</span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                {event.venue || "To Be Decided"}
              </span>
            </div>

            {/* Organizers */}
            {event.organizerIds && event.organizerIds.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Organized By</span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                  {event.organizerIds.join(", ")}
                </span>
              </div>
            )}

            {/* Registration Deadline */}
            {event.registrationDeadline && (
              <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest block">
                  Registration Deadline
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                  {formatDate(event.registrationDeadline)}
                </span>
                {isRegistrationClosed && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mt-1">
                    ⚠️ Registration Closed
                  </span>
                )}
              </div>
            )}

            {/* CTA Button */}
            <div>
              {isRegistrationClosed ? (
                <button
                  disabled
                  className="w-full text-center py-3 px-4 rounded-xl text-sm font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                >
                  Registration Closed
                </button>
              ) : event.registrationLink ? (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block py-3 px-4 rounded-xl text-sm font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-300"
                >
                  Register Now ↗
                </a>
              ) : (
                <button
                  disabled
                  className="w-full text-center py-3 px-4 rounded-xl text-sm font-black bg-zinc-200 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500"
                >
                  Registration Not Opened
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
