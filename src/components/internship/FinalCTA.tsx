"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getInternshipDiaries, InternshipDiary } from "../../../src/lib/internshipDiaryService";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function InternshipDiaries() {
  const [diaries, setDiaries] = useState<InternshipDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const availableYears = Array.from(new Set(diaries.map(d => d.year || "2026"))).sort((a, b) => b.localeCompare(a));
  const filteredDiaries = diaries.filter(d => (d.year || "2026") === selectedYear);
  const total = filteredDiaries.length;

  useEffect(() => {
    setActive(0);
  }, [selectedYear]);

  useEffect(() => {
    const fetchDiaries = async () => {
      const data = await getInternshipDiaries();
      setDiaries(data);
      setLoading(false);
    };
    fetchDiaries();
  }, []);

  const handleNext = () => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setActive((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setActive((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    rotationTimerRef.current = setInterval(handleNext, 6000);
    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [active, isAnimating]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [active]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".diary-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8E7] overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col">
        <div className="diary-anim mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[#E28941] uppercase text-center mb-3">
            Internship Diaries
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-[#1A1A1A] text-center">
            Voices From The Field
          </h2>
        </div>

        {/* Year Filter */}
        {!loading && availableYears.length > 0 && (
          <div className="diary-anim flex justify-center gap-3 mb-10 flex-wrap">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${
                  selectedYear === year
                    ? "bg-[#E28941] text-white shadow-lg shadow-amber-600/30"
                    : "bg-white border border-amber-300 text-slate-900 hover:bg-amber-50"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Viewport for cards */}
        <div className="diary-anim relative w-full h-[550px] sm:h-[450px] overflow-hidden mb-12">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-medium bg-white/80 backdrop-blur-md rounded-3xl border-2 border-amber-200 shadow-xl">
              No diaries found for {selectedYear}.
            </div>
          ) : (
            filteredDiaries.map((student, index) => {
              const isActive = index === active;
            return (
              <div
                key={student.id}
                className={`absolute inset-0 w-full h-full p-8 sm:p-12 bg-white rounded-3xl shadow-xl border-2 border-amber-200 flex flex-col sm:flex-row gap-8 sm:gap-12 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-sm ${isActive
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto z-10"
                  : "opacity-0 translate-x-16 scale-95 pointer-events-none z-0"
                  }`}
              >
                {/* Left Column - Profile */}
                <div className="flex flex-col sm:w-1/3 md:w-1/4 sm:min-w-[220px] border-b sm:border-b-0 sm:border-r-2 border-amber-200 pb-8 sm:pb-0 sm:pr-10 items-center sm:items-start text-center sm:text-left h-auto sm:h-full justify-start">
                  {student.photoURL ? (
                    <div className="relative group mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      <img 
                        src={student.photoURL} 
                        alt={student.name} 
                        className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  ) : (
                    <div className="relative group mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <span className="text-amber-700 font-black text-5xl font-heading">{student.name.charAt(0)}</span>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-950 mb-2 leading-tight">
                    {student.name}
                  </h3>
                  <p className="text-xs font-black tracking-[0.15em] text-amber-700 uppercase mb-4 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    {student.college}
                  </p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                    {student.description}
                  </p>
                </div>

                {/* Right Column - Testimonial */}
                <div className="flex flex-col sm:w-2/3 md:w-3/4 justify-start h-full overflow-y-auto pr-2 custom-scrollbar">
                  <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border-2 border-amber-300 mb-8 self-start shadow-md hover:shadow-lg transition-shadow duration-300">
                    <span className="text-xs font-black text-amber-700 uppercase tracking-[0.15em]">
                      Interned at @{student.institute}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <svg className="absolute -top-6 -left-6 w-16 h-16 text-amber-200/40 z-0" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                    </svg>
                    <p className="relative z-10 text-xl sm:text-2xl md:text-3xl text-slate-800 leading-relaxed italic font-medium">
                      "{student.review}"
                    </p>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Controls */}
        <div className="diary-anim flex items-center justify-between px-2">
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-amber-300 bg-white text-slate-900 hover:border-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 font-bold text-xl"
              aria-label="Previous student"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-amber-300 bg-white text-slate-900 hover:border-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 font-bold text-xl"
              aria-label="Next student"
            >
              →
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-base font-black tracking-[0.15em] text-slate-900">
              {String(active + 1).padStart(2, '0')} <span className="text-amber-400 mx-1">/</span> {String(total).padStart(2, '0')}
            </div>
            <div className="w-40 h-2 bg-amber-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${((active + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Yearly Archive Section ────────────────────────────────────────────────────
const YEARLY = [
  { year: "2025–26", interns: "340+", institutes: "45", programs: "7", highlight: "Largest cohort in Think India history" },
  { year: "2024–25", interns: "280+", institutes: "38", programs: "6", highlight: "Expanded to IIMs and law schools" },
  { year: "2023–24", interns: "195+", institutes: "28", programs: "5", highlight: "First DEEKSHA & SHURUAT cohorts" },
  { year: "2022–23", interns: "120+", institutes: "18", programs: "3", highlight: "Founding year: ANUBHOOTI launched" },
];

export function YearlyArchive() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".archive-row",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8E7] overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] text-[#E28941] uppercase text-center mb-3">
          Journey So Far
        </p>
        <h2 className="font-heading text-4xl sm:text-5xl font-black text-[#1A1A1A] text-center mb-16">
          The Yearly Archive
        </h2>

        <div className="flex flex-col border border-amber-100 rounded-3xl overflow-hidden bg-white shadow-sm">
          {YEARLY.map((yr, i) => (
            <div
              key={yr.year}
              className={`archive-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center p-8 ${i !== YEARLY.length - 1 ? "border-b border-amber-50" : ""
                } ${i % 2 === 0 ? "bg-amber-50/30" : "bg-white"}`}
            >
              <div>
                <span className={`font-heading text-3xl font-black tracking-tighter ${i === 0 ? "text-[#E28941]" : "text-[#1A1A1A]"}`}>
                  {yr.year}
                </span>
                {i === 0 && (
                  <span className="ml-3 text-[10px] font-bold tracking-widest uppercase text-[#E28941] bg-[#FEF0E0] px-2 py-1 rounded-md border border-[#E28941]/40 align-middle">
                    Current
                  </span>
                )}
              </div>

              <div>
                <p className="font-heading text-3xl font-black text-[#E28941]">{yr.interns}</p>
                <p className="text-xs font-bold text-[#666666] tracking-widest uppercase mt-1">Interns</p>
              </div>

              <div>
                <p className="font-heading text-3xl font-black text-[#1A1A1A]">{yr.institutes}</p>
                <p className="text-xs font-bold text-[#666666] tracking-widest uppercase mt-1">Institutes</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#666666] leading-relaxed">{yr.highlight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Application Steps ────────────────────────────────────────────────────────
const STEPS = [
  { step: "01", title: "DISCOVER", desc: "Browse programs, institutes, and read intern diaries to find your perfect match." },
  { step: "02", title: "SELECT", desc: "Choose your program, preferred institute, and the timeline that works for you." },
  { step: "03", title: "APPLY", desc: "Submit your SOP, academic credentials, and two references through our portal." },
  { step: "04", title: "INTERVIEW", desc: "Shortlisted candidates interview with the host institute's faculty or HR panel." },
  { step: "05", title: "EXPERIENCE", desc: "Report, contribute, and become part of the Think India alumni network." },
];

export function ApplicationProcess() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8E7]">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] text-[#E28941] uppercase text-center mb-3">
          How It Works
        </p>
        <h2 className="font-heading text-4xl sm:text-5xl font-black text-[#1A1A1A] text-center mb-16">
          Your Application Path
        </h2>

        <div className="flex flex-col relative">
          {/* Vertical connection line */}
          <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-amber-100 hidden sm:block z-0" />

          {STEPS.map((s, i) => (
            <div
              key={s.step}
              onMouseEnter={() => setActiveStep(i)}
              className={`relative z-10 flex gap-6 sm:gap-8 items-start p-6 rounded-2xl transition-all duration-300 ${i === activeStep ? "bg-white shadow-md border border-amber-100 scale-[1.02]" : "bg-transparent border border-transparent"
                }`}
            >
              <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-lg font-black font-heading transition-colors duration-300 shadow-sm ${i === activeStep ? "bg-[#E28941] text-white border-2 border-white" : "bg-white text-[#E28941] border border-amber-200"
                }`}>
                {s.step}
              </div>

              <div className="pt-2 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`font-heading text-xl font-black tracking-wide transition-colors ${i === activeStep ? "text-[#1A1A1A]" : "text-[#666666]"
                    }`}>
                    {s.title}
                  </h3>
                </div>
                <p className={`text-sm sm:text-base transition-colors max-w-2xl font-medium leading-relaxed ${i === activeStep ? "text-[#666666]" : "text-zinc-400"
                  }`}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────
export default function FinalCTA() {
  return (
    <section id="apply-now" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8E7]">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 border-2 border-amber-200 shadow-2xl">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 px-8 sm:px-12 lg:px-20 py-16 sm:py-20 lg:py-24">
            
            {/* Eyebrow */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-amber-600 text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Join The Movement
              </span>
            </div>

            {/* Main Heading */}
            <div className="text-center mb-12">
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-slate-950 leading-[1.1] tracking-tight mb-6">
                YOUR NEXT<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">EXPERIENCE</span><br />
                STARTS HERE
              </h2>
              <p className="text-slate-700 text-lg sm:text-xl max-w-3xl mx-auto font-semibold leading-relaxed">
                Turn your curiosity into impact. Join the Think India Internship
                Experience and be part of a community shaping India's future.
              </p>
            </div>

            {/* Stats - The Star of the Show */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              
              {/* Stat 1: Interns */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative bg-white rounded-3xl border-2 border-amber-300 p-8 sm:p-10 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-heading text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-600 leading-none mb-3">
                    100+
                  </h3>
                  <p className="text-sm sm:text-base font-bold tracking-[0.2em] text-slate-700 uppercase">
                    Interns
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                    Building India's future
                  </p>
                </div>
              </div>

              {/* Stat 2: Institutes */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative bg-white rounded-3xl border-2 border-amber-300 p-8 sm:p-10 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-heading text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-600 to-orange-600 leading-none mb-3">
                    45+
                  </h3>
                  <p className="text-sm sm:text-base font-bold tracking-[0.2em] text-slate-700 uppercase">
                    Institutes
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                    Premier partnerships
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
