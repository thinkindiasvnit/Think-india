"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getPublishedAlbums,
  ALBUM_CATEGORIES,
  CATEGORY_LABELS,
  Album,
  AlbumCategory,
} from "../../lib/galleryService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden border-2 border-amber-200 bg-white/80 backdrop-blur-sm animate-pulse shadow-lg">
      <div className="aspect-[16/10] bg-gradient-to-br from-amber-100 to-amber-50" />
      <div className="p-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 bg-amber-200/60 rounded-full w-24" />
          <div className="h-8 bg-amber-100/60 rounded-full w-28" />
        </div>
        <div className="h-8 bg-amber-200/60 rounded-lg w-4/5" />
        <div className="space-y-2">
          <div className="h-5 bg-amber-100/60 rounded-lg w-full" />
          <div className="h-5 bg-amber-100/60 rounded-lg w-3/4" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center rounded-3xl border-2 border-dashed border-amber-300 bg-white/70 backdrop-blur-md shadow-lg">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 flex items-center justify-center mb-2 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-amber-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-slate-950 font-heading">
        {filtered ? "No albums in this category" : "No albums yet"}
      </h3>
      <p className="text-sm font-semibold text-slate-700 max-w-xs">
        {filtered
          ? "Try selecting a different category to browse more albums."
          : "Check back soon — our team is busy capturing memories!"}
      </p>
    </div>
  );
}

// ─── Album card ───────────────────────────────────────────────────────────────

function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="group rounded-3xl overflow-hidden border-2 border-amber-200 bg-white/80 backdrop-blur-md hover:shadow-2xl hover:-translate-y-2 hover:border-amber-400 transition-all duration-500 ease-out">
      {/* Image section - display only */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50">
        {album.coverImageURL ? (
          <Image
            src={album.coverImageURL}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
            <span className="text-white/90 text-7xl font-black font-heading">
              {album.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info section */}
      <div className="p-8 space-y-5">
        {/* Category badge and date */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-md">
            {CATEGORY_LABELS[album.category as AlbumCategory] ?? album.category}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-4 py-2 rounded-full border-2 border-amber-300 whitespace-nowrap shadow-sm">
            {formatDate(album.takenAt ?? "")}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-black text-slate-950 leading-tight font-heading line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">
          {album.title}
        </h3>

        {/* Description */}
        {album.description && (
          <p className="text-base text-slate-700 line-clamp-3 leading-relaxed">
            {album.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Category filter pills ────────────────────────────────────────────────────

const ALL_FILTER = "all" as const;
type FilterValue = typeof ALL_FILTER | AlbumCategory;

function FilterPills({
  active,
  onChange,
}: {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const pills: { label: string; value: FilterValue }[] = [
    { label: "All", value: ALL_FILTER },
    ...ALBUM_CATEGORIES.map((cat) => ({
      label: CATEGORY_LABELS[cat],
      value: cat as FilterValue,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={[
              "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:scale-105",
              isActive
                ? "bg-amber-600 text-white border-2 border-amber-600"
                : "border-2 border-amber-300 text-zinc-800 hover:border-amber-500 bg-white/80 backdrop-blur-sm",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlbums() {
      setLoading(true);
      try {
        const data = await getPublishedAlbums();
        if (!cancelled) setAlbums(data);
      } catch (err) {
        console.error("Failed to fetch albums:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAlbums();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    activeFilter === ALL_FILTER
      ? albums
      : albums.filter((a) => a.category === activeFilter);

  return (
    <main className="min-h-screen flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 pt-10 pb-6">
        <div className="rounded-3xl border-2 border-amber-300 shadow-xl py-16 px-8 text-center bg-white/80 backdrop-blur-md">
          {/* Eyebrow label */}
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 border-amber-400 text-amber-700 bg-amber-100 font-heading shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
              />
            </svg>
            Media Gallery
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 font-heading mb-4">
            Glimpses of Think India SVNIT
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-slate-700 font-semibold leading-relaxed">
            Capturing key moments from our conclaves, workshops, hackathons, and social initiatives.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 md:px-8 py-10 md:py-14">
        {/* Filter pills */}
        <div className="mb-10">
          <FilterPills active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState filtered={activeFilter !== ALL_FILTER} />
          ) : (
            filtered.map((album) => <AlbumCard key={album.id} album={album} />)
          )}
        </div>

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="mt-10 text-center text-sm text-zinc-600 font-medium">
            Showing {filtered.length} album{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== ALL_FILTER
              ? ` in "${CATEGORY_LABELS[activeFilter as AlbumCategory]}"`
              : ""}
          </p>
        )}
      </section>
    </main>
  );
}