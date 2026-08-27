"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

import type { Metadata } from "next";
import WelcomeInteractiveBackground from "./WelcomeInteractiveBackground";

export default function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Welcome Refs
  const welcomeRef = useRef<HTMLDivElement>(null);
  const welcomeElementsRef = useRef<HTMLDivElement>(null);

  // Typewriter Refs
  const experiencePinRef = useRef<HTMLDivElement>(null);
  const textExperienceRef = useRef<HTMLHeadingElement>(null);

  // Curiosity Refs
  const curiosityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // 1. Welcome Section Entrance (Simple fade/slide in on mount)
      if (!prefersReducedMotion && welcomeElementsRef.current) {
        const children = welcomeElementsRef.current.children;
        gsap.fromTo(children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out", delay: 0.2 }
        );
      }

      if (prefersReducedMotion) {
        if (textExperienceRef.current) {
          textExperienceRef.current.innerText = "EXPERIENCE";
        }
        return;
      }

      // 2. Typewriter "EXPERIENCE" Animation (Scroll-Triggered)
      // We pin the section and write the word as the user scrolls.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: experiencePinRef.current,
          start: "top top",
          end: "+=250%", // Scroll distance to complete the writing
          scrub: true,
          pin: true,
        },
      });

      // The word starts empty, and we animate it to the full word.
      // TextPlugin handles the smooth typewriter effect without random jumps.
      tl.to(textExperienceRef.current, {
        text: {
          value: "EXPERIENCE",
          delimiter: "",
        },
        duration: 5,
        ease: "none",
      });

      // Hold the fully written word for a moment before unpinning
      tl.to({}, { duration: 0.1 });

      // 3. Simple Section Reveal for "TURN YOUR CURIOSITY INTO EXPERIENCE"
      gsap.fromTo(curiosityRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: "power2.out",
          scrollTrigger: {
            trigger: curiosityRef.current,
            start: "top 80%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-[#FFF8E7] text-[#1A1A1A] overflow-hidden">

      {/* Background layer: Interactive physics bubbles for the Welcome section */}
      <WelcomeInteractiveBackground />
      {/* ==================== 1. NORMAL THINK INDIA WELCOME ==================== */}
      <div
        ref={welcomeRef}
        className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div ref={welcomeElementsRef} className="max-w-4xl w-full text-center flex flex-col items-center">

          <h2 className="text-xs sm:text-sm font-bold tracking-[0.4em] uppercase text-[#E28941] mb-6">
            THINK INDIA
          </h2>

          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-7xl leading-[1.1] tracking-tight text-[#1A1A1A] mb-8">
            WELCOME TO <br /> THINK INDIA INTERNSHIPS
          </h1>

          <p className="text-[#666666] text-base sm:text-lg max-w-2xl leading-relaxed mb-16 font-medium">
            Engage with India's premier research institutes, policy think-tanks, and parliamentary leaders through structured, high-impact experiential learning.
          </p>

          <div className="flex flex-col items-center gap-2 opacity-50 mt-12 animate-pulse">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1A]">SCROLL</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#1A1A1A] to-transparent" />
          </div>
        </div>
      </div>

      {/* ==================== 2. HUGE EXPERIENCE (TYPEWRITER) ==================== */}
      <div ref={experiencePinRef} className="h-screen w-full flex items-center justify-center overflow-hidden relative z-10">
        <h1
          ref={textExperienceRef}
          className="font-heading font-black text-[clamp(4rem,18vw,16rem)] leading-none tracking-tight text-[#1A1A1A] w-full text-center"
        >
          {/* Starts empty for the typewriter effect, filled immediately if reduced motion */}
        </h1>
      </div>

      {/* ==================== 3. TURN YOUR CURIOSITY INTO EXPERIENCE ==================== */}
      <div className="min-h-[50vh] w-full flex items-center justify-center relative z-10 px-4 py-20">
        <div ref={curiosityRef} className="text-center">
          <h3 className="font-heading font-black text-[clamp(2.5rem,8vw,6rem)] leading-[1.1] tracking-tight text-[#1A1A1A]">
            TURN YOUR CURIOSITY
          </h3>
          <h3 className="font-heading font-black text-[clamp(2.5rem,8vw,6rem)] leading-[1.1] tracking-tight text-[#E28941]">
            INTO EXPERIENCE
          </h3>
        </div>
      </div>

    </section>
  );
}
