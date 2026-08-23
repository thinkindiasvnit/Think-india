"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="card-orange-glass-light rounded-3xl overflow-hidden border border-amber-300 bg-white/95 animate-pulse">
      <div className="aspect-[4/3] bg-amber-100/60" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-amber-200/60 rounded-full w-3/4" />
        <div className="h-3 bg-amber-100/60 rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center card-orange-glass-light rounded-3xl border border-amber-300 bg-white/95 shadow-md">
      <div className="w-20 h-20 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mb-2 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-amber-700"
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
      <h3 className="text-xl font-black text-slate-950 font-heading">
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
    <Link
      href={`/gallery/${album.id}`}
      className="group block rounded-3xl overflow-hidden border border-amber-300 bg-white/95 card-orange-glass-light hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      {/* Image wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-100">
        {album.coverImageURL ? (
          <Image
            src={album.coverImageURL}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
            <span className="text-white/90 text-5xl font-black font-heading">
              {album.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category badge — top left */}
        <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm font-heading">
          {CATEGORY_LABELS[album.category as AlbumCategory] ?? album.category}
        </span>

        {/* Published date — top right */}
        <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/60 text-white backdrop-blur-md border border-white/20">
          {formatDate(album.takenAt ?? "")}
        </span>

        {/* Photo count badge — bottom left */}
        {typeof album.imageCount === "number" && (
          <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/60 text-white backdrop-blur-md border border-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 4.5h18"
              />
            </svg>
            {album.imageCount}
          </span>
        )}

        {/* Album title overlaid on gradient */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-6">
          <h3 className="text-base font-black text-white leading-snug line-clamp-2 font-heading drop-shadow">
            {album.title}
          </h3>
        </div>
      </div>

      {/* Card footer — optional description */}
      {album.description && (
        <div className="px-4 py-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {album.description}
          </p>
        </div>
      )}
    </Link>
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
    <div className="flex flex-wrap gap-2">
      {pills.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-amber-600 text-white shadow-sm"
                : "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 bg-white dark:bg-zinc-900",
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
    <main className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-xl py-12 px-6 text-center bg-white/95 backdrop-blur-md">
          {/* Eyebrow label */}
          <span className="inline-flex items-center gap-1.5 mb-4 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-amber-300 text-amber-700 bg-amber-100 font-heading shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
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

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-heading">
            Glimpses of Think India SVNIT
          </h1>

          <p className="mt-3 max-w-2xl mx-auto text-slate-800 font-semibold leading-relaxed">
            Capturing key moments from our conclaves, workshops, hackathons, and social initiatives.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Filter pills */}
        <div className="mb-8">
          <FilterPills active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
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
