"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Elegant entrance animation for the Hero section
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 }
      );

      // Simple intersection observer for the other sections (no ScrollTrigger plugin needed)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      const revealElements = document.querySelectorAll(".reveal-section");
      revealElements.forEach((el) => {
        gsap.set(el, { y: 60, opacity: 0 }); // Initial state
        observer.observe(el);
      });

      return () => observer.disconnect();
    });

    return () => ctx.revert(); // Cleanup GSAP on unmount
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-transparent relative z-10 w-full overflow-hidden">
      
      {/* Premium Minimal Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col justify-end pb-24 px-6 sm:px-12 lg:px-24 bg-transparent"
      >
        <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-start">
          <div className="hero-element mb-6 inline-flex items-center gap-4">
            <div className="w-12 h-[1px] bg-amber-600"></div>
            <span className="text-amber-800 font-bold tracking-[0.3em] uppercase text-xs">Think India SVNIT</span>
          </div>
          
          <h1 className="hero-element text-5xl sm:text-7xl lg:text-[7rem] font-black tracking-tighter text-zinc-900 leading-[0.95] font-heading max-w-5xl">
            EMPOWERING<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
              YOUTH.
            </span>
          </h1>
          
          <div className="hero-element mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full border-t border-zinc-900/10 pt-8 gap-8">
            <p className="text-lg text-zinc-700 font-medium max-w-xl leading-relaxed">
              A forum to bind the youth of India with nationalistic spirit and channelize creative energies towards building a stronger nation through education, innovation, and leadership.
            </p>
            <Link
              href="/about"
              className="group flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 text-white hover:bg-amber-600 transition-colors duration-500 shrink-0 shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Asymmetrical Premium Section Blocks */}
      <section ref={sectionsRef} className="py-24 px-6 sm:px-12 lg:px-24 bg-white/80 backdrop-blur-sm border-t border-zinc-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          
          {/* Block 1: Events */}
          <div className="reveal-section flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-5/12 flex flex-col items-start">
              <span className="text-amber-600 font-black tracking-widest uppercase text-xs mb-4">01 / Events</span>
              <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight font-heading mb-6">
                Technical & Social Initiatives
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-8">
                Participate in national hackathons, technical workshops, seminars, and social contribution activities organized on campus.
              </p>
              <Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-amber-600 transition-colors uppercase tracking-widest border-b-2 border-zinc-900 hover:border-amber-600 pb-1">
                Explore Events
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="w-full md:w-7/12 aspect-[4/3] bg-zinc-100 rounded-3xl overflow-hidden relative shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent z-10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/eventtech/800/600" alt="Events" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* Block 2: Blogs (Reversed) */}
          <div className="reveal-section flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
            <div className="w-full md:w-5/12 flex flex-col items-start">
              <span className="text-amber-600 font-black tracking-widest uppercase text-xs mb-4">02 / Insights</span>
              <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight font-heading mb-6">
                Youth Opinions & Research
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-8">
                Read articles, youth opinions, and research highlights published by members of the Think India network across various domains.
              </p>
              <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-amber-600 transition-colors uppercase tracking-widest border-b-2 border-zinc-900 hover:border-amber-600 pb-1">
                Read Articles
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="w-full md:w-7/12 aspect-[4/3] bg-zinc-100 rounded-3xl overflow-hidden relative shadow-lg group">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent z-10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/writingblog/800/600" alt="Blogs" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* Block 3: Gallery */}
          <div className="reveal-section flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-5/12 flex flex-col items-start">
              <span className="text-amber-600 font-black tracking-widest uppercase text-xs mb-4">03 / Gallery</span>
              <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight font-heading mb-6">
                Memories & Milestones
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-8">
                A visual journey through our past events, workshops, and community gatherings. Relive the moments that shape our nationalistic spirit.
              </p>
              <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-amber-600 transition-colors uppercase tracking-widest border-b-2 border-zinc-900 hover:border-amber-600 pb-1">
                View Gallery
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="w-full md:w-7/12 aspect-[4/3] bg-zinc-100 rounded-3xl overflow-hidden relative shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent z-10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/galleryphotos/800/600" alt="Gallery" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
            </div>
          </div>

        </div>
      </section>
      
      {/* Minimal Footer CTA */}
      <section className="py-24 px-6 text-center bg-transparent border-t border-zinc-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="reveal-section max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black font-heading text-zinc-900 mb-8">Ready to make an impact?</h2>
          <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-amber-600 text-white font-bold tracking-widest uppercase hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
            Join The Chapter
          </Link>
        </div>
      </section>

    </div>
  );
}
