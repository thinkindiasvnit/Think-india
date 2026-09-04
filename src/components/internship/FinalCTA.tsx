"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const internshipDiaries = [
  {
    id: 1,
    name: "Yug Shankhala",
    college: "SVNIT Surat",
    institute: "IIT Roorkee",
    description: "2nd Year, Civil Engineering",
    review: "I got to explore a bunch of new software and concepts, which helped me deepen my structural concepts. Also, it was fun exploring the campus, which made the experience more valuable."
  },
  {
    id: 2,
    name: "Samarth Mandage",
    college: "SVNIT Surat",
    institute: "IIT Bombay",
    description: "2nd Year, Chemical Engineering",
    review: "Had a fantastic experience. Getting to know different topics and doing something different from learning was fine experience. Plus the professor was so supportive. Credits to Think India"
  },
  {
    id: 3,
    name: "Arpita",
    college: "SVNIT Surat",
    institute: "IIT Kharagpur",
    description: "2nd Year, Civil Engineering",
    review: "helped me strengthen my understanding of artificial intelligence and computer vision. Working on real-world research problems gave me practical exposure beyond classroom concepts and improved my problem-solving skills."

  },
  {
    id: 4,
    name: "Sneha Kumari",
    college: "SVNIT Surat",
    institute: "IIT Bombay",
    description: "2nd Year, Computer Science & Engineering",
    review: "I got to work on a project that was related to my field of interest. The professor was also very supportive and guided me throughout the project. Overall it was a great learning experience."
  },
  {
    id: 5,
    name: "Shreya Khandelwal",
    college: "SVNIT Surat",
    institute: "IIT Bombay",
    description: "2nd Year, Civil Engineering",
    review: "It was a great learning experience. The professor was very supportive and guided me throughout the project. Overall it was a great learning experience."
  },
  {
    id: 6,
    name: "Krishna Tahiliani",
    college: "SVNIT Surat",
    institute: "MNNIT Allahabad",
    description: "2nd Year, Computer Science & Engineering",
    review: "The project was about image processing and I got to work on a real-world problem. The professor was very supportive and guided me throughout the project. Overall it was a great learning experience."
  },
  {
    id: 7,
    name: "Saurabh Patel",
    college: "SVNIT Surat",
    institute: "IIT Delhi",
    description: "2nd Year, Chemical Engineering",
    review: "The project was about image processing and I got to work on a real-world problem. The professor was very supportive and guided me throughout the project. Overall it was a great learning experience."
  },
  {
    id: 8,
    name: "Parth Kamalia",
    college: "SVNIT Surat",
    institute: "IIT Kharagpur",
    description: "2nd Year, Civil Engineering",
    review: "The project was about image processing and I got to work on a real-world problem. The professor was very supportive and guided me throughout the project. Overall it was a great learning experience."
  }
];

export function InternshipDiaries() {
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const total = internshipDiaries.length;

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActive((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    if (isAnimating) return;
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

        {/* Viewport for cards */}
        <div className="diary-anim relative w-full h-[500px] sm:h-[400px] overflow-hidden mb-12">
          {internshipDiaries.map((student, index) => {
            const isActive = index === active;
            return (
              <div
                key={student.id}
                className={`absolute inset-0 w-full h-full p-8 sm:p-12 bg-white rounded-3xl shadow-lg border border-amber-100 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive
                  ? "opacity-100 translate-x-0 pointer-events-auto z-10"
                  : "opacity-0 translate-x-12 pointer-events-none z-0"
                  }`}
              >
                <div>
                  <h3 className="font-heading text-3xl font-black text-[#1A1A1A] mb-2 leading-tight">
                    {student.name}
                  </h3>
                  <p className="text-sm font-bold tracking-widest text-[#666666] uppercase mb-6">
                    {student.college}
                  </p>

                  <div className="inline-flex items-center px-4 py-2 bg-[#FEF0E0] rounded-full border border-amber-200 mb-8">
                    <span className="text-xs font-bold text-[#E28941] uppercase tracking-wider">
                      Interned at {student.institute}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold tracking-widest text-[#E28941] uppercase mb-2">
                    Description
                  </p>
                  <p className="text-base font-medium text-[#1A1A1A] mb-6">
                    {student.description}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#E28941] uppercase mb-2">
                    Review
                  </p>
                  <div className="relative">
                    <p className="relative z-10 text-lg text-[#333333] leading-relaxed italic font-medium">
                      "{student.review}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls - Strictly separated from cards */}
        <div className="diary-anim flex items-center justify-between px-2">
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-amber-200 text-[#1A1A1A] hover:border-[#E28941] hover:text-[#E28941] hover:bg-white transition-all shadow-sm"
              aria-label="Previous student"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-amber-200 text-[#1A1A1A] hover:border-[#E28941] hover:text-[#E28941] hover:bg-white transition-all shadow-sm"
              aria-label="Next student"
            >
              →
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-bold tracking-widest text-[#1A1A1A]">
              {String(active + 1).padStart(2, '0')} <span className="text-amber-300">/</span> {String(total).padStart(2, '0')}
            </div>
            <div className="w-32 h-1 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E28941] transition-all duration-300 ease-out"
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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#E28941] uppercase mb-4">
              Join The Movement
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-[1.1] tracking-tight mb-6">
              YOUR NEXT<br />
              <span className="text-[#E28941]">EXPERIENCE</span><br />
              STARTS HERE
            </h2>
            <p className="text-[#666666] text-lg mb-10 max-w-md font-medium leading-relaxed">
              Turn your curiosity into impact. Apply for the Think India Internship
              Experience and join 340+ interns who have shaped India's future.
            </p>

            <div className="flex flex-wrap gap-8 mb-10 pb-10 border-b border-amber-200">
              {[
                { val: "340+", label: "Interns" },
                { val: "45", label: "Institutes" },
                { val: "7", label: "Programs" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-3xl font-black text-[#E28941] leading-none mb-2">
                    {stat.val}
                  </p>
                  <p className="text-xs font-bold tracking-widest text-[#666666] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-xl bg-[#E28941] text-white font-bold tracking-wider uppercase shadow-[0_8px_32px_-4px_rgba(226,137,65,0.6)] hover:-translate-y-1 hover:shadow-[0_12px_40px_-4px_rgba(226,137,65,0.8)] transition-all duration-300">
                Apply Now →
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-8 py-4 rounded-xl bg-transparent border-2 border-[#E28941] text-[#E28941] font-bold tracking-wider uppercase hover:bg-amber-50 transition-colors duration-300"
              >
                Explore Programs
              </button>
            </div>
          </div>

          {/* CSS 3D Book */}
          <div className="flex justify-center items-center perspective-[1200px] h-[400px]">
            <div className="relative w-[240px] h-[340px] transform-gpu preserve-3d animate-[bookFloat_4s_ease-in-out_infinite] rotate-y-[-20deg] rotate-x-[5deg]">
              <style>{`
                @keyframes bookFloat {
                  0%, 100% { transform: rotateY(-20deg) rotateX(5deg) translateY(0); }
                  50% { transform: rotateY(-20deg) rotateX(5deg) translateY(-15px); }
                }
              `}</style>

              {/* Book cover front */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#E28941] to-[#c47a3a] rounded-r-2xl rounded-l-sm shadow-[16px_24px_64px_rgba(226,137,65,0.4),inset_0_0_0_1px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center p-8 backface-hidden">
                <div className="w-16 h-16 rounded-xl bg-white/20 mb-8 flex items-center justify-center text-3xl shadow-inner">
                  🇮🇳
                </div>
                <p className="text-white text-sm font-bold tracking-[0.2em] uppercase text-center leading-[2] font-heading">
                  THINK INDIA<br />INTERNSHIP<br />GUIDE<br />2025–26
                </p>
              </div>

              {/* Book spine */}
              <div
                className="absolute w-8 h-full bg-gradient-to-b from-[#a0622d] to-[#8b4d1e] left-[-28px] top-0 rounded-l-sm transform-gpu origin-right rotate-y-[-90deg] translate-x-[-16px]"
              />

              {/* Shadow underneath */}
              <div className="absolute -bottom-12 left-4 right-[-20px] h-8 bg-amber-900/10 rounded-[50%] blur-xl" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
