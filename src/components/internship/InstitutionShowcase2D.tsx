"use client";

import React from "react";

const institutions = [
  "IIT Delhi",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Bombay",
  "IIT Ropar",
  "IIT Bhubaneswar",
  "IIM Mumbai",
  "MNNIT Allahabad",
  "ICT Mumbai"
];

export default function InstitutionShowcase2D() {
  // Duplicate enough times to ensure it fills ultra-wide screens seamlessly
  const marqueeItems = [...institutions, ...institutions, ...institutions, ...institutions];

  return (
    <section className="relative w-full py-32 bg-[#FFF8E7] overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
      <div className="text-center mb-24 z-10 relative px-4">
        <p className="text-[11px] font-bold tracking-[0.3em] text-[#E28941] uppercase mb-4">
          Elite Partnerships
        </p>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A1A] max-w-2xl mx-auto leading-tight tracking-tight">
          Mentorship at India's Premier Institutes
        </h2>
      </div>

      <div className="relative w-full overflow-hidden flex items-center h-[120px]">
        {/* Subtle fade overlays to soften the edges */}
        <div className="absolute left-0 top-0 w-16 sm:w-32 h-full bg-gradient-to-r from-[#FFF8E7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-16 sm:w-32 h-full bg-gradient-to-l from-[#FFF8E7] to-transparent z-10 pointer-events-none" />
        
        <div className="flex w-max animate-marquee items-center">
          {marqueeItems.map((inst, index) => (
            <React.Fragment key={`${inst}-${index}`}>
              <div className="flex-shrink-0 px-8 sm:px-12 text-2xl sm:text-4xl font-heading font-black text-[#1A1A1A] tracking-wider uppercase whitespace-nowrap opacity-90 transition-opacity hover:opacity-100 cursor-default">
                {inst}
              </div>
              <div className="flex-shrink-0 text-[#E28941] opacity-50 text-xl sm:text-2xl">
                •
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Since we duplicated 4 times, moving -25% seamlessly loops the first set */
            transform: translateX(-25%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (max-width: 768px) {
           .animate-marquee {
             animation-duration: 20s;
           }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
            overflow-x: auto;
            transform: none !important;
            padding-bottom: 20px;
          }
        }
      `}</style>
    </section>
  );
}
