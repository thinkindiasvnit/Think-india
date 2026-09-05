"use client";

import Link from "next/link";

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-amber-600 font-bold text-sm tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
      {text}
    </p>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 bg-transparent">
      <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-16 py-20">
        <div className="fade-up">
          <SectionLabel text="ABOUT THINK INDIA SVNIT" />
        </div>
        <h1
          className="font-bold leading-[0.92] tracking-[-0.01em] fade-up fade-up-delay-1 text-zinc-900"
          style={{ fontFamily: "'Barlow', sans-serif", fontSize: "clamp(4rem, 11vw, 10rem)" }}
        >
          THINK.<br />
          LEAD.<br />
          <span className="text-amber-600">TRANSFORM.</span>
        </h1>
        <p className="mt-8 text-zinc-600 text-xl md:text-2xl max-w-xl leading-relaxed fade-up fade-up-delay-2">
          Building a generation of young thinkers, leaders, innovators and nation-builders.
        </p>
      </div>

      <button
        className="absolute bottom-12 right-10 md:right-16 w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        onClick={() => document.getElementById("who-we-are")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Scroll down"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 17L17 5M17 5H8M17 5V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}

function WhoWeAre() {
  return (
    <section id="who-we-are" className="bg-transparent py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto bg-white/60 backdrop-blur-sm rounded-3xl p-10 md:p-16 border border-amber-200/50 shadow-sm">
        <div className="grid md:grid-cols-[1fr_2px_1fr] gap-12 md:gap-16 items-start">
          <div>
            <SectionLabel text="01 / WHO WE ARE" />
            <h2 className="font-bold text-5xl md:text-6xl leading-tight mt-2 text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>
              Young minds.<br />
              One vision.<br />
              A stronger nation.
            </h2>
          </div>
          <div className="hidden md:block w-px bg-amber-200 self-stretch mx-auto" />
          <div className="flex flex-col justify-center gap-6 text-zinc-700 text-lg leading-relaxed">
            <p>
              Think India is a youth-driven platform that brings together students and young minds who believe in leadership, innovation, national development and meaningful contribution to society.
            </p>
            <p>
              At SVNIT, the chapter creates opportunities for students to engage with ideas, people and initiatives that encourage critical thinking, leadership, technological excellence and a spirit of service.
            </p>
            <div className="mt-4 pt-4 border-t border-amber-200 flex flex-wrap gap-8 text-center">
              {[["200+", "Active Members"], ["50+", "Events Hosted"], ["10+", "Initiatives"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-black text-4xl text-amber-600" style={{ fontFamily: "'Barlow', sans-serif" }}>{n}</p>
                  <p className="text-sm text-zinc-500 tracking-wide mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OurPurpose() {
  const cards = [
    { n: "01", title: "THINK", desc: "Encouraging critical thinking, curiosity and informed perspectives on issues that shape India and the world." },
    { n: "02", title: "LEAD", desc: "Developing confident young leaders through dialogue, collaboration, responsibility and real-world experiences." },
    { n: "03", title: "TRANSFORM", desc: "Turning ideas into meaningful initiatives that contribute to campus, society and the nation." },
  ];
  return (
    <section className="bg-transparent py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionLabel text="02 / OUR PURPOSE" />
        <h2 className="font-bold text-5xl md:text-7xl mb-14 text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>
          From ideas to impact.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.n}
              className="bg-white/60 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-8 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(217,119,6,0.2)] transition-all duration-300 cursor-default"
            >
              <span className="font-black text-5xl text-amber-200" style={{ fontFamily: "'Barlow', sans-serif" }}>{c.n}</span>
              <h3 className="font-bold text-3xl tracking-wide text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>{c.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeDo() {
  const items = [
    { n: "01", icon: "◈", title: "Leadership & Dialogue", desc: "Guest sessions, discussions and conversations that expose students to diverse perspectives and inspiring leaders." },
    { n: "02", icon: "◎", title: "Technical & Innovation Initiatives", desc: "Technical workshops, hackathons, exhibitions and innovation-driven activities that connect technology with societal impact." },
    { n: "03", icon: "◇", title: "Civic & National Engagement", desc: "Initiatives that encourage awareness, responsibility, national integration and active participation in society." },
    { n: "04", icon: "◉", title: "Youth Development", desc: "Platforms that help students develop communication, confidence, teamwork, leadership and problem-solving skills." },
  ];
  return (
    <section className="bg-transparent py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <SectionLabel text="03 / WHAT WE DO" />
          <h2 className="font-bold text-5xl md:text-7xl text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Where ideas<br />meet action.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.n}
              className="bg-white/60 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-10 flex flex-col gap-4 hover:bg-white/80 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <span className="font-black text-6xl text-amber-600" style={{ fontFamily: "'Barlow', sans-serif" }}>{item.n}</span>
                <span className="text-3xl text-amber-300">{item.icon}</span>
              </div>
              <h3 className="font-bold text-2xl text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>{item.title}</h3>
              <p className="text-zinc-600 leading-relaxed text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurJourney() {
  const milestones = [
    { n: "01", year: "Year 1", title: "Building the Chapter", desc: "Creating a student-led platform at SVNIT focused on leadership, national development and youth engagement." },
    { n: "02", year: "Year 2", title: "Expanding Conversations", desc: "Bringing inspiring speakers, leaders and experts to campus." },
    { n: "03", year: "Year 3", title: "From Ideas to Action", desc: "Launching technical, social, cultural and national initiatives." },
    { n: "04", year: "Year 4", title: "A Growing Community", desc: "Building a network of students united by curiosity, responsibility and the desire to contribute." },
  ];
  return (
    <section className="bg-transparent py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionLabel text="04 / OUR JOURNEY" />
        <h2 className="font-bold text-5xl md:text-7xl mb-4 text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>OUR JOURNEY</h2>
        <p className="text-zinc-600 text-lg mb-16">Growing a community of young changemakers.</p>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-amber-200" />
          <div className="grid grid-cols-4 gap-8">
            {milestones.map((m) => (
              <div key={m.n} className="relative flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-white/80 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
                <span className="font-black text-amber-600 text-sm tracking-widest" style={{ fontFamily: "'Barlow', sans-serif" }}>{m.year}</span>
                <h4 className="font-bold text-xl text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>{m.title}</h4>
                <p className="text-zinc-600 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden flex flex-col gap-0">
          {milestones.map((m, i) => (
            <div key={m.n} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 bg-white/80 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 bg-amber-200 mt-2 mb-2" />}
              </div>
              <div className="pb-10">
                <span className="font-bold text-amber-600 text-xs tracking-widest" style={{ fontFamily: "'Barlow', sans-serif" }}>{m.year}</span>
                <h4 className="font-black text-xl mt-1 text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>{m.title}</h4>
                <p className="text-zinc-600 text-sm leading-relaxed mt-2">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurValues() {
  const values = ["NATION FIRST", "LEADERSHIP", "INNOVATION", "INTEGRITY", "SERVICE", "COLLABORATION"];
  return (
    <section className="bg-zinc-900/95 backdrop-blur-sm py-24 md:py-32 px-8 md:px-16 overflow-hidden relative">
      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionLabel text="05 / OUR VALUES" />
        <h2 className="font-bold text-white text-5xl md:text-6xl mb-16" style={{ fontFamily: "'Barlow', sans-serif" }}>WHAT DRIVES US</h2>
        <div className="flex flex-wrap gap-4 md:gap-6">
          {values.map((v, i) => (
            <div
              key={v}
              className={`border rounded-xl px-6 py-4 hover:bg-amber-600 hover:border-amber-600 transition-all duration-300 cursor-default group
                ${i === 0 ? "border-amber-500 bg-amber-600/20 md:px-12 md:py-7" : "border-white/10 bg-white/5"}`}
            >
              <span
                className={`font-black tracking-[0.12em] group-hover:text-white transition-colors
                  ${i === 0 ? "text-amber-500 text-2xl md:text-4xl" : "text-white/80 text-lg md:text-2xl"}`}
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section className="bg-transparent py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden min-h-[500px] flex items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1758270704763-22072a90d3b6?w=1400&h=700&fit=crop&auto=format"
            alt="Students talking and collaborating"
            className="absolute inset-0 w-full h-full object-cover scale-100 hover:scale-[1.02] transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(217,119,6,0.85) 0%, rgba(15,14,12,0.6) 50%, transparent 100%)" }}
          />
          <div className="relative z-10 p-10 md:p-16 max-w-2xl">
            <h2 className="font-black text-white text-4xl md:text-6xl leading-tight mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
              More than a chapter.<br />
              <span className="text-amber-200">A community of thinkers.</span>
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Think India SVNIT brings together students who want to learn, question, collaborate and create meaningful change.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/team"
                className="bg-amber-600 text-white font-bold text-sm tracking-widest px-7 py-3.5 rounded-full hover:bg-amber-700 transition-colors"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                MEET OUR TEAM →
              </Link>
              <Link
                href="/events"
                className="text-white/80 font-bold text-sm tracking-widest px-4 py-3.5 underline underline-offset-4 hover:text-white transition-colors"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                EXPLORE OUR INITIATIVES →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent relative z-10 w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-delay-1 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; }
        .fade-up-delay-2 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .fade-up-delay-3 { animation-delay: 0.35s; opacity: 0; animation-fill-mode: forwards; }
      `}</style>
      <Hero />
      <WhoWeAre />
      <OurPurpose />
      <WhatWeDo />
      <OurJourney />
      <OurValues />
      <Community />
    </div>
  );
}
