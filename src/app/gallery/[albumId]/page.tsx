"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getAlbumById,
  getPhotos,
  Album,
  Photo,
  CATEGORY_LABELS,
} from "../../../lib/galleryService";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────
   Spinner
───────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Lightbox
───────────────────────────────────────────── */
interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );

  const next = useCallback(
    () => setCurrent((i) => (i + 1) % photos.length),
    [photos.length]
  );

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  /* Lock scroll */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      {/* Top bar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80">
          {current + 1} / {photos.length}
        </span>
        <button
          id="lightbox-close-btn"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label="Close lightbox"
        >
          ✕
        </button>
      </div>

      {/* Prev arrow */}
      <button
        id="lightbox-prev-btn"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Previous photo"
      >
        ‹
      </button>

      {/* Image */}
      <div
        className="flex flex-col items-center gap-3 px-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={photo.imageURL}
          alt={photo.caption || `Photo`}
          className="max-h-[82vh] max-w-[82vw] rounded-lg object-contain shadow-2xl"
        />
        {photo.caption && (
          <p className="max-w-lg text-center text-sm text-white/70">
            {photo.caption}
          </p>
        )}
      </div>

      {/* Next arrow */}
      <button
        id="lightbox-next-btn"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Next photo"
      >
        ›
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Photo grid cell
───────────────────────────────────────────── */
interface PhotoCellProps {
  photo: Photo;
  index: number;
  onClick: (index: number) => void;
}

function PhotoCell({ photo, index, onClick }: PhotoCellProps) {
  return (
    <div className="group flex flex-col gap-1">
      <button
        id={`photo-cell-${photo.id}`}
        onClick={() => onClick(index)}
        className="relative aspect-square w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`Open photo ${index + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageURL}
          alt={photo.caption || `Photo ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/50">
          <svg
            className="h-10 w-10 translate-y-2 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </button>

      {/* Caption */}
      {photo.caption && (
        <p className="truncate px-1 text-xs text-zinc-400">{photo.caption}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = use(params);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* Fetch album + photos */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [albumData, photosData] = await Promise.all([
          getAlbumById(albumId),
          getPhotos(albumId),
        ]);

        if (cancelled) return;

        if (!albumData) {
          setNotFound(true);
        } else {
          setAlbum(albumData);
          setPhotos(photosData);
        }
      } catch (err) {
        console.error("Failed to load album:", err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [albumId]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  /* ── Render states ── */
  if (loading) return <Spinner />;

  if (notFound || !album) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
          <svg
            className="h-10 w-10 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Album not found</h1>
        <p className="text-zinc-400">
          This album may have been removed or the link is incorrect.
        </p>
        <Link
          href="/gallery"
          id="back-to-gallery-notfound"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  const categoryLabel =
    CATEGORY_LABELS?.[album.category as keyof typeof CATEGORY_LABELS] ??
    album.category ??
    "";

  const coverUrl =
    album.coverImageURL ||
    (photos.length > 0 ? photos[0].imageURL : null) ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80";

  return (
    <>
      {/* ── Lightbox ── */}
      {lightboxIndex !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}

      <main className="min-h-screen bg-zinc-950 pb-20 text-zinc-100">
        {/* ── Back link ── */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            href="/gallery"
            id="back-to-gallery-link"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            ← Back to Gallery
          </Link>
        </div>

        {/* ── Cover banner ── */}
        <div className="relative mt-4 h-[300px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={album.title}
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          {/* Overlay content */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {categoryLabel && (
                <span className="mb-3 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 ring-1 ring-amber-500/30">
                  {categoryLabel}
                </span>
              )}
              <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
                {album.title}
              </h1>
              {album.description && (
                <p className="mt-2 max-w-2xl text-sm text-zinc-300/90 drop-shadow">
                  {album.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <svg
                className="h-4 w-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5"
                />
              </svg>
              <span>
                <span className="font-semibold text-zinc-200">{photos.length}</span>{" "}
                {photos.length === 1 ? "photo" : "photos"}
              </span>
            </div>

            {album.takenAt && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <svg
                  className="h-4 w-4 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
                  />
                </svg>
                <span>{formatDate(album.takenAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Photo grid ── */}
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          {photos.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
                <svg
                  className="h-10 w-10 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-zinc-300">No photos yet</p>
              <p className="text-sm text-zinc-500">
                Photos added to this album will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {photos.map((photo, index) => (
                <PhotoCell
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onClick={openLightbox}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
