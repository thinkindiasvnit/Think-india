import { useState } from 'react'
import thinkIndiaLogo from '@/imports/icon.png'

/* ─── India Map SVG path (simplified outline) ─── */
const INDIA_PATH = `M 420,30 L 440,35 L 460,28 L 490,32 L 510,20 L 530,25 L 555,18 L 570,30
L 590,28 L 610,40 L 630,38 L 648,55 L 660,70 L 668,90 L 655,105 L 660,125
L 648,140 L 650,160 L 640,180 L 645,200 L 630,218 L 620,240 L 600,258
L 585,275 L 572,295 L 558,315 L 545,335 L 530,352 L 515,370 L 500,388
L 485,405 L 475,425 L 468,448 L 460,468 L 455,490 L 450,512 L 448,535
L 445,555 L 440,570 L 430,555 L 422,535 L 418,512 L 415,490 L 412,468
L 408,450 L 400,432 L 390,415 L 375,400 L 360,385 L 345,368 L 330,350
L 318,332 L 308,312 L 295,295 L 280,278 L 268,258 L 255,240 L 245,220
L 238,200 L 232,180 L 228,160 L 222,140 L 215,120 L 212,100 L 210,80
L 215,62 L 225,48 L 240,40 L 258,35 L 278,32 L 298,28 L 320,25 L 340,22
L 360,25 L 380,28 L 400,28 Z
M 505,530 L 510,545 L 505,560 L 498,545 Z
M 530,510 L 540,525 L 535,542 L 525,528 Z`

function IndiaMapBg({ opacity = 0.12, stroke = '#C8855A' }: { opacity?: number; stroke?: string }) {
  return (
    <svg
      viewBox="150 10 550 600"
      className="absolute inset-0 w-full h-full"
      style={{ opacity }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={INDIA_PATH}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* city dots */}
      <circle cx="448" cy="555" r="3" fill={stroke} opacity="0.7" />
      <text x="420" y="552" fontSize="10" fill={stroke} opacity="0.8" fontFamily="Plus Jakarta Sans">SVNIT SURAT</text>
      <circle cx="462" cy="468" r="2.5" fill={stroke} opacity="0.5" />
      <text x="468" y="465" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">MUMBAI</text>
      <circle cx="390" cy="415" r="2.5" fill={stroke} opacity="0.5" />
      <text x="396" y="412" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">KOLKATA</text>
      <text x="300" y="490" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">BENGALURU</text>
    </svg>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-[#E0780030]"
      style={{ background: 'rgba(250,240,220,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3">
        {/* Think India logo */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0">
          <img src={thinkIndiaLogo} alt="Think India logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-['Barlow'] font-black text-xl tracking-[0.2em] text-[#0F0E0C] uppercase">
          Think India
        </span>
      </div>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 bg-[#0F0E0C] text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-widest hover:bg-[#2a2820] transition-colors"
        aria-label="Menu"
      >
        MENU
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <line x1="0" y1="1" x2="16" y2="1" stroke="white" strokeWidth="1.8"/>
          <line x1="0" y1="6" x2="16" y2="6" stroke="white" strokeWidth="1.8"/>
          <line x1="0" y1="11" x2="16" y2="11" stroke="white" strokeWidth="1.8"/>
        </svg>
      </button>

      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-[#FAF0DC] border-b border-[#E0780030] py-6 px-8 flex flex-col md:flex-row gap-4 md:gap-8 shadow-sm">
          {['Home','About','Events','Blog','Team','Contact'].map(l => (
            <a key={l} href="#" className="font-['Barlow'] font-semibold text-sm tracking-widest uppercase text-[#0F0E0C] hover:text-[#E07800] transition-colors">{l}</a>
          ))}
        </nav>
      )}
    </header>
  )
}

/* ── Section label ── */
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[#E07800] font-['Barlow'] font-bold text-sm tracking-[0.25em] uppercase mb-4">
      {text}
    </p>
  )
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24"
      style={{ background: 'linear-gradient(135deg, #FDECD5 0%, #FAF0DC 35%, #FDE4C8 65%, #FAF0DC 100%)' }}>
      {/* #EE7313 radial glow behind headline */}
      <div className="absolute top-0 left-0 w-[60%] h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 40%, rgba(238,115,19,0.13) 0%, transparent 70%)' }} />
      {/* soft bottom-right warmth */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[60%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 90%, rgba(238,115,19,0.08) 0%, transparent 65%)' }} />
      <IndiaMapBg opacity={0.35} />
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#0F0E0C 1px, transparent 1px), linear-gradient(90deg, #0F0E0C 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-16 py-20">
        <div className="fade-up">
          <SectionLabel text="ABOUT THINK INDIA SVNIT" />
        </div>
        <h1 className="font-['Barlow'] font-bold leading-[0.92] tracking-[-0.01em] fade-up fade-up-delay-1"
          style={{ fontSize: 'clamp(4rem, 11vw, 10rem)' }}>
          THINK.<br/>
          LEAD.<br/>
          <span style={{ color: '#EE7313' }}>TRANSFORM.</span>
        </h1>
        <p className="mt-8 text-[#5A5449] text-xl md:text-2xl max-w-xl leading-relaxed fade-up fade-up-delay-2">
          Building a generation of young thinkers, leaders, innovators and nation-builders.
        </p>
      </div>

      {/* circular arrow button */}
      <button className="absolute bottom-12 right-10 md:right-16 w-14 h-14 rounded-full bg-[#0F0E0C] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        onClick={() => document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 17L17 5M17 5H8M17 5V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  )
}

/* ── 01 Who We Are ── */
function WhoWeAre() {
  return (
    <section id="who-we-are" className="bg-[#FAF0DC] py-24 md:py-32 px-8 md:px-16 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-[1fr_2px_1fr] gap-12 md:gap-16 items-start">
        <div>
          <SectionLabel text="01 / WHO WE ARE" />
          <h2 className="font-['Barlow'] font-bold text-5xl md:text-6xl leading-tight mt-2">
            Young minds.<br/>
            One vision.<br/>
            A stronger nation.
          </h2>
        </div>
        {/* vertical divider */}
        <div className="hidden md:block w-px bg-[#E0780040] self-stretch mx-auto" />
        <div className="flex flex-col justify-center gap-6 text-[#3D3830] text-lg leading-relaxed">
          <p>
            Think India is a youth-driven platform that brings together students and young minds who believe in leadership, innovation, national development and meaningful contribution to society.
          </p>
          <p>
            At SVNIT, the chapter creates opportunities for students to engage with ideas, people and initiatives that encourage critical thinking, leadership, technological excellence and a spirit of service.
          </p>
          <div className="mt-4 pt-4 border-t border-[#E0780030] flex flex-wrap gap-8 text-center">
            {[['200+','Active Members'],['50+','Events Hosted'],['10+','Initiatives']].map(([n,l]) => (
              <div key={l}>
                <p className="font-['Barlow'] font-black text-4xl text-[#E07800]">{n}</p>
                <p className="text-sm text-[#5A5449] tracking-wide mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 02 Our Purpose ── */
function OurPurpose() {
  const cards = [
    { n:'01', title:'THINK', desc:'Encouraging critical thinking, curiosity and informed perspectives on issues that shape India and the world.' },
    { n:'02', title:'LEAD', desc:'Developing confident young leaders through dialogue, collaboration, responsibility and real-world experiences.' },
    { n:'03', title:'TRANSFORM', desc:'Turning ideas into meaningful initiatives that contribute to campus, society and the nation.' },
  ]
  return (
    <section className="py-24 md:py-32 px-8 md:px-16"
      style={{ background: 'linear-gradient(160deg, #FDECD5 0%, #FDE4C8 40%, #FAF0DC 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel text="02 / OUR PURPOSE" />
        <h2 className="font-['Barlow'] font-bold text-5xl md:text-7xl mb-14">
          From ideas to impact.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(c => (
            <div key={c.n}
              className="bg-[#FAF0DC] border border-[#E0780030] rounded-2xl p-8 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(224,120,0,0.15)] transition-all duration-300 cursor-default">
              <span className="font-['Barlow'] font-black text-5xl text-[#E0780020]">{c.n}</span>
              <h3 className="font-['Barlow'] font-bold text-3xl tracking-wide text-[#0F0E0C]">{c.title}</h3>
              <p className="text-[#5A5449] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 03 What We Do ── */
function WhatWeDo() {
  const items = [
    { n:'01', icon:'◈', title:'Leadership & Dialogue', desc:'Guest sessions, discussions and conversations that expose students to diverse perspectives and inspiring leaders.' },
    { n:'02', icon:'◎', title:'Technical & Innovation Initiatives', desc:'Technical workshops, hackathons, exhibitions and innovation-driven activities that connect technology with societal impact.' },
    { n:'03', icon:'◇', title:'Civic & National Engagement', desc:'Initiatives that encourage awareness, responsibility, national integration and active participation in society.' },
    { n:'04', icon:'◉', title:'Youth Development', desc:'Platforms that help students develop communication, confidence, teamwork, leadership and problem-solving skills.' },
  ]
  return (
    <section className="bg-[#FAF0DC] py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <SectionLabel text="03 / WHAT WE DO" />
          <h2 className="font-['Barlow'] font-bold text-5xl md:text-7xl">
            Where ideas<br/>meet action.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#E0780020] border border-[#E0780020] rounded-2xl overflow-hidden">
          {items.map((item, i) => (
            <div key={item.n}
              className={`bg-[#FAF0DC] p-10 flex flex-col gap-4 hover:bg-[#FDF4E3] transition-colors duration-200
                ${i === 0 ? 'rounded-tl-2xl' : ''}
                ${i === 1 ? 'rounded-tr-2xl' : ''}
                ${i === 2 ? 'rounded-bl-2xl' : ''}
                ${i === 3 ? 'rounded-br-2xl' : ''}
              `}>
              <div className="flex items-start justify-between">
                <span className="font-['Barlow'] font-black text-6xl text-[#E07800]">{item.n}</span>
                <span className="text-3xl text-[#E0780060]">{item.icon}</span>
              </div>
              <h3 className="font-['Barlow'] font-bold text-2xl text-[#0F0E0C]">{item.title}</h3>
              <p className="text-[#5A5449] leading-relaxed text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 04 Our Journey ── */
function OurJourney() {
  const milestones = [
    { n:'01', year:'Year 1', title:'Building the Chapter', desc:'Creating a student-led platform at SVNIT focused on leadership, national development and youth engagement.' },
    { n:'02', year:'Year 2', title:'Expanding Conversations', desc:'Bringing inspiring speakers, leaders and experts to campus.' },
    { n:'03', year:'Year 3', title:'From Ideas to Action', desc:'Launching technical, social, cultural and national initiatives.' },
    { n:'04', year:'Year 4', title:'A Growing Community', desc:'Building a network of students united by curiosity, responsibility and the desire to contribute.' },
  ]
  return (
    <section className="py-24 md:py-32 px-8 md:px-16"
      style={{ background: 'linear-gradient(180deg, #FAF0DC 0%, #FDE4C8 50%, #F2D9B0 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel text="04 / OUR JOURNEY" />
        <h2 className="font-['Barlow'] font-bold text-5xl md:text-7xl mb-4">OUR JOURNEY</h2>
        <p className="text-[#5A5449] text-lg mb-16">Growing a community of young changemakers.</p>

        {/* horizontal timeline desktop */}
        <div className="hidden md:block relative">
          {/* connector line */}
          <div className="absolute top-5 left-0 right-0 h-px bg-[#E0780030]" />
          <div className="grid grid-cols-4 gap-8">
            {milestones.map((m, i) => (
              <div key={m.n} className="relative flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#E07800] bg-[#FAF0DC] flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-[#E07800]" />
                </div>
                <span className="font-['Barlow'] font-black text-[#E07800] text-sm tracking-widest">{m.year}</span>
                <h4 className="font-['Barlow'] font-bold text-xl text-[#0F0E0C]">{m.title}</h4>
                <p className="text-[#5A5449] text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* mobile timeline */}
        <div className="md:hidden flex flex-col gap-0">
          {milestones.map((m, i) => (
            <div key={m.n} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#E07800] bg-[#FAF0DC] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E07800]" />
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 bg-[#E0780030] mt-2 mb-2" />}
              </div>
              <div className="pb-10">
                <span className="font-['Barlow'] font-bold text-[#E07800] text-xs tracking-widest">{m.year}</span>
                <h4 className="font-['Barlow'] font-black text-xl mt-1">{m.title}</h4>
                <p className="text-[#5A5449] text-sm leading-relaxed mt-2">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 05 Values ── */
function OurValues() {
  const values = ['NATION FIRST','LEADERSHIP','INNOVATION','INTEGRITY','SERVICE','COLLABORATION']
  return (
    <section className="bg-[#0F0E0C] py-24 md:py-32 px-8 md:px-16 overflow-hidden relative">
      {/* faint India map in dark */}
      <IndiaMapBg opacity={0.06} stroke="#E07800" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionLabel text="05 / OUR VALUES" />
        <h2 className="font-['Barlow'] font-bold text-white text-5xl md:text-6xl mb-16">WHAT DRIVES US</h2>
        <div className="flex flex-wrap gap-4 md:gap-6">
          {values.map((v, i) => (
            <div key={v}
              className={`border rounded-xl px-6 py-4 hover:bg-[#E07800] hover:border-[#E07800] transition-all duration-300 cursor-default group
                ${i === 0
                  ? 'border-[#E07800] bg-[#E078001A] md:px-12 md:py-7'
                  : 'border-white/10 bg-white/5'
                }`}>
              <span className={`font-['Barlow'] font-black tracking-[0.12em] group-hover:text-white transition-colors
                ${i === 0
                  ? 'text-[#E07800] text-2xl md:text-4xl'
                  : 'text-white/80 text-lg md:text-2xl'
                }`}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── 06 Community ── */
function Community() {
  return (
    <section className="bg-[#FAF0DC] py-24 md:py-32 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden min-h-[500px] flex items-end">
          <img
            src="https://images.unsplash.com/photo-1758270704763-22072a90d3b6?w=1400&h=700&fit=crop&auto=format"
            alt="Students talking and collaborating"
            className="absolute inset-0 w-full h-full object-cover scale-100 hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(224,120,0,0.85) 0%, rgba(15,14,12,0.6) 50%, transparent 100%)' }} />
          <div className="relative z-10 p-10 md:p-16 max-w-2xl">
            <h2 className="font-['Barlow'] font-black text-white text-4xl md:text-6xl leading-tight mb-4">
              More than a chapter.<br/>
              <span className="text-[#F5E8C8]">A community of thinkers.</span>
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Think India SVNIT brings together students who want to learn, question, collaborate and create meaningful change.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="bg-[#E07800] text-white font-['Barlow'] font-bold text-sm tracking-widest px-7 py-3.5 rounded-full hover:bg-[#B85E00] transition-colors">
                MEET OUR TEAM →
              </a>
              <a href="#" className="text-white/80 font-['Barlow'] font-bold text-sm tracking-widest px-4 py-3.5 underline underline-offset-4 hover:text-white transition-colors">
                EXPLORE OUR INITIATIVES →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Contact Us ── */
function ContactUs() {
  return (
    <section id="contact" className="relative py-28 md:py-36 px-8 md:px-16 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FDE4C8 0%, #FAF0DC 45%, #FDECD5 100%)' }}>
      <IndiaMapBg opacity={0.18} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <SectionLabel text="GET IN TOUCH" />
            <h2 className="font-['Barlow'] font-bold leading-tight mb-6"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)' }}>
              READY TO MAKE<br/>AN IMPACT?
            </h2>
            <p className="text-[#5A5449] text-lg leading-relaxed mb-10 max-w-md">
              Have questions, ideas, or just want to connect? Reach out to the Think India SVNIT chapter — we'd love to hear from you.
            </p>
            <div className="flex flex-col gap-5">
              <a href="mailto:thinkindia@svnit.ac.in"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#E07800] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg width="18" height="18" viewBox="0 0 20 16" fill="none">
                    <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" strokeWidth="1.6"/>
                    <path d="M1 4l9 6 9-6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Email</p>
                  <p className="text-[#0F0E0C] font-medium group-hover:text-[#E07800] transition-colors">thinkindia@svnit.ac.in</p>
                </div>
              </a>
              <a href="https://www.instagram.com/thinkindia.svnit/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Instagram</p>
                  <p className="text-[#0F0E0C] font-medium group-hover:text-[#E07800] transition-colors">@thinkindia.svnit</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F0E0C] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1C5.03 1 1 5.03 1 10s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16.5A7.5 7.5 0 1110 2.5a7.5 7.5 0 010 15zm-.5-11h-2v5h2V9.5zm0-3h-2v1.5h2V6.5z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Address</p>
                  <p className="text-[#0F0E0C] font-medium text-sm leading-relaxed">SVNIT Campus, Ichchhanath,<br/>Surat, Gujarat – 395007</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-[#E0780020] shadow-[0_8px_40px_-12px_rgba(224,120,0,0.15)]">
            <h3 className="font-['Barlow'] font-bold text-2xl mb-6 text-[#0F0E0C]">Send us a message</h3>
            <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Name</label>
                  <input type="text" placeholder="Your name"
                    className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Email</label>
                  <input type="email" placeholder="your@email.com"
                    className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Subject</label>
                <input type="text" placeholder="How can we help?"
                  className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Message</label>
                <textarea rows={4} placeholder="Tell us more..."
                  className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors resize-none"/>
              </div>
              <button type="submit"
                className="mt-2 bg-[#E07800] text-white font-['Barlow'] font-bold text-sm tracking-[0.18em] px-8 py-4 rounded-full hover:bg-[#B85E00] hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_-4px_rgba(224,120,0,0.35)]">
                SEND MESSAGE →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  const socials = [
    {
      label: 'Instagram', href: 'https://www.instagram.com/thinkindia.svnit/',
      bg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        </svg>
      )
    },
  ]

  return (
    <footer className="border-t border-[#E0780030] pt-16 pb-10 px-8 md:px-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FDE4C8 0%, #FAF0DC 100%)' }}>
      <IndiaMapBg opacity={0.1} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {/* Quick Links */}
          <div>
            <h4 className="font-['Barlow'] font-bold text-xs tracking-[0.2em] uppercase text-[#0F0E0C] mb-5">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {['Home','Events & Conclaves','Blogs & Articles','Internships','Media Gallery','Team & Members','About Think India','Contact Us'].map(l => (
                <li key={l}><a href="#" className="text-[#5A5449] text-sm hover:text-[#E07800] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-['Barlow'] font-bold text-xs tracking-[0.2em] uppercase text-[#0F0E0C] mb-5">Follow Us</h4>
            <div className="flex flex-wrap gap-2.5 mb-5">
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                  style={{ background: s.bg }}>
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-[#5A5449] text-xs leading-relaxed">Stay connected with us on social media for regular updates and announcements.</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-['Barlow'] font-bold text-xs tracking-[0.2em] uppercase text-[#0F0E0C] mb-5">Contact Info</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-sm text-[#5A5449]">
                <svg className="flex-shrink-0 mt-0.5 text-[#E07800]" width="16" height="16" viewBox="0 0 20 16" fill="none">
                  <rect x="1" y="1" width="18" height="14" rx="2" stroke="#E07800" strokeWidth="1.5"/>
                  <path d="M1 4l9 6 9-6" stroke="#E07800" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <a href="mailto:thinkindia@svnit.ac.in" className="hover:text-[#E07800] transition-colors">thinkindia@svnit.ac.in</a>
              </li>
              <li className="flex gap-3 text-sm text-[#5A5449]">
                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="#E07800" strokeWidth="1.5"/>
                </svg>
                +91 98765 43210
              </li>
              <li className="flex gap-3 text-sm text-[#5A5449]">
                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" stroke="#E07800" strokeWidth="1.5"/>
                </svg>
                <span>SVNIT Campus, Ichchhanath,<br/>Surat, Gujarat – 395007</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E0780030] pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src={thinkIndiaLogo} alt="Think India" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-['Barlow'] font-bold text-sm tracking-widest text-[#0F0E0C] uppercase">Think India SVNIT</span>
          </div>
          <span className="text-[#5A5449] text-xs">© 2026 Think India SVNIT. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF0DC]">
      <Header />
      <main>
        <Hero />
        <WhoWeAre />
        <OurPurpose />
        <WhatWeDo />
        <OurJourney />
        <OurValues />
        <Community />
        <ContactUs />
      </main>
      <Footer />
    </div>
  )
}
