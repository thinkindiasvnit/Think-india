"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import data from "../../data/internship-data.json";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProgramsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".program-card");

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, rotateX: 10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 bg-[#FFF8E7] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-[#1A1A1A] mb-4">
            Discover Our Programs
          </h2>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto">
            Choose from a diverse range of internship tracks designed to foster leadership, research, and policy-making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.programs.map((program) => (
            <div
              key={program.id}
              className="program-card bg-white rounded-2xl p-6 shadow-sm border border-amber-100 hover:shadow-xl hover:border-amber-300 transition-all duration-300 group flex flex-col h-full"
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-[#E28941] border border-amber-200">
                  {program.category}
                </span>
                {program.badge && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {program.badge}
                  </span>
                )}
              </div>
              <h3 className="font-heading text-2xl font-black text-[#1A1A1A] mb-1 group-hover:text-[#E28941] transition-colors">
                {program.name}
              </h3>
              <p className="text-sm font-semibold text-[#E28941] mb-3">{program.tagline}</p>
              <p className="text-[#666666] text-sm mb-6 flex-grow">{program.description}</p>
              
              <div className="pt-4 border-t border-amber-50 flex justify-between items-center text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">⏱ {program.duration}</span>
                <span className="flex items-center gap-1">📍 {program.mode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
