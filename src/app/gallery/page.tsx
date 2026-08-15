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
    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
      <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-1/2" />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-amber-400"
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
      <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">
        {filtered ? "No albums in this category" : "No albums yet"}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
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
      className="group block rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      {/* Image wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {album.coverImageURL ? (
          <Image
            src={album.coverImageURL}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-zinc-300 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 4.5h18A1.5 1.5 0 0 1 22.5 6v12a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18V6A1.5 1.5 0 0 1 3 4.5z"
              />
            </svg>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Category badge — top left */}
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-600 text-white shadow">
          {CATEGORY_LABELS[album.category as AlbumCategory] ?? album.category}
        </span>

        {/* Published date — top right */}
        <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-sm">
          {formatDate(album.takenAt ?? "")}
        </span>

        {/* Photo count badge — bottom left */}
        {typeof album.imageCount === "number" && (
          <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
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
            {album.imageCount} photo{album.imageCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Album title overlaid on gradient */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-6">
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 drop-shadow">
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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {/* Subtle radial accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          {/* Eyebrow label */}
          <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
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
            Photo Gallery
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Glimpses
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            A visual journey through our events, campus life, and adventures —
            every frame tells a story.
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
