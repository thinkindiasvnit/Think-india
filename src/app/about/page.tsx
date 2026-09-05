"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reveal-item",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-transparent relative z-10 w-full overflow-hidden">
      {/* About Section */}
      <section className="relative flex flex-col justify-center min-h-screen py-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto w-full text-center">
          <div className="reveal-item mb-6 inline-flex items-center justify-center gap-4 w-full">
            <div className="w-12 h-[1px] bg-amber-600"></div>
            <span className="text-amber-800 font-bold tracking-[0.3em] uppercase text-xs">Who We Are</span>
            <div className="w-12 h-[1px] bg-amber-600"></div>
          </div>
          
          <h1 className="reveal-item text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 mb-8 font-heading">
            About Think India SVNIT
          </h1>
          
          <p className="reveal-item text-lg text-zinc-700 leading-relaxed mb-6">
            Think India is a forum for the students, by the students, and of the students, originating from premier institutes like IITs, IIMs, IISc, and NITs. It is an initiative to bring together the best talents and minds of the country, instilling a nationalistic spirit and a sense of duty towards the society.
          </p>
          <p className="reveal-item text-lg text-zinc-700 leading-relaxed">
            At the SVNIT Chapter, we strive to channelize the energy of the youth into creative and constructive endeavors. Through various events, workshops, and social initiatives, we aim to bridge the gap between academia and societal needs, fostering leadership and innovation among students.
          </p>
        </div>
      </section>
    </div>
  );
}
