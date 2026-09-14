"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Library, Calendar, BookOpen, ArrowRight, Newspaper } from "lucide-react";
import { getNewspaperEditions, NewspaperEdition } from "../../lib/articleService";

export default function ArticlesPage() {
  const [editions, setEditions] = useState<NewspaperEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getNewspaperEditions()
      .then((loaded) => {
        if (!cancelled && loaded) {
          setEditions(loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }
      })
      .catch((err) => console.error("Error loading editions", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-orange-50/30 to-amber-100/20">
      {/* Hero Section */}
      <section className="relative px-6 pb-16 pt-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="h-px w-12 bg-amber-600"></div>
            <span className="font-bold uppercase tracking-[0.3em] text-amber-800 text-xs">
              Think India SVNIT
            </span>
          </div>

          <h1 className="mb-6 font-heading text-5xl font-black leading-[0.95] tracking-tighter text-zinc-900 sm:text-6xl lg:text-7xl">
            IKIGAI
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              NEWSPAPER
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-700 sm:text-xl">
            Explore our digital newspaper editions featuring student articles, policy research, and campus perspectives. 
            Each volume showcases thoughtful discourse on leadership, innovation, and nation-building.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/submit-article"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-4 font-bold tracking-wide text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 hover:shadow-xl"
            >
              <Newspaper size={20} />
              <span>Submit Article</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-900 bg-transparent px-8 py-4 font-bold tracking-wide text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <BookOpen size={20} />
              <span>Read Blogs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Volumes Grid Section */}
      <section className="px-6 pb-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between border-b border-amber-300/60 pb-6">
            <div>
              <h2 className="font-heading text-3xl font-black text-zinc-900">Published Editions</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Browse our newspaper volumes and explore member-contributed articles
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2">
              <Library size={18} className="text-amber-700" />
              <span className="text-sm font-bold text-amber-900">
                {editions.length} Volume{editions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
                <p className="mt-4 font-serif text-sm text-zinc-600">Loading newspaper editions...</p>
              </div>
            </div>
          ) : editions.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Library size={48} className="mx-auto mb-4 text-zinc-300" />
                <h3 className="font-serif text-xl font-bold text-zinc-900">No Editions Published Yet</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Check back soon for our first newspaper edition
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {editions.map((edition) => (
                <Link
                  key={edition.id}
                  href={`/articles/${edition.id}`}
                  className="group relative overflow-hidden rounded-3xl border-2 border-amber-200/80 bg-white shadow-lg transition-all hover:border-amber-400 hover:shadow-2xl"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={edition.coverPhoto}
                      alt={edition.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Edition Badge */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/30 bg-white/90 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 backdrop-blur-sm">
                          {edition.volume}
                        </span>
                        <span className="rounded-full border border-white/30 bg-amber-600/90 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                          {edition.editionName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar size={14} />
                      <span className="font-medium">{edition.date}</span>
                      <span>•</span>
                      <span className="font-medium">{edition.price}</span>
                    </div>

                    <h3 className="mb-2 font-serif text-2xl font-black leading-tight text-zinc-900 group-hover:text-amber-700 transition-colors">
                      {edition.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                      {edition.description}
                    </p>

                    {/* Cover Story Preview */}
                    <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                        Cover Story
                      </p>
                      <p className="line-clamp-2 font-serif text-sm font-bold text-zinc-900">
                        {edition.coverStoryHeadline}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                      <span className="text-xs font-medium text-zinc-500">
                        {edition.pages?.length || 4} Pages
                      </span>
                      <div className="inline-flex items-center gap-2 font-bold text-amber-700 transition-colors group-hover:text-amber-900">
                        <span className="text-sm">Read Edition</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-amber-300/60 bg-gradient-to-b from-orange-100/30 via-amber-100/40 to-amber-50/50 px-6 py-24 text-center sm:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-4xl font-black text-zinc-900 sm:text-5xl">
            Have something to share?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Submit your article to be featured in our next newspaper edition. Share your insights on policy, 
            technology, campus life, and nation-building.
          </p>
          <Link
            href="/submit-article"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-10 py-4 font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-amber-700"
          >
            <Newspaper size={20} />
            Submit Your Article
          </Link>
        </div>
      </section>
    </div>
  );
}
