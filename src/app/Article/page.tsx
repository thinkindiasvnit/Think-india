"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Globe, Library, X, PenSquare, ArrowLeft, Clock } from "lucide-react";
import {
  Article,
  ARTICLE_CATEGORY_LABELS,
  DEFAULT_EDITIONS,
  getArticlePreview,
  getNewspaperEditions,
  getPublishedArticles,
  NewspaperEdition,
  NewspaperPage,
} from "../../lib/articleService";

const Instagram = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// ─── Fallback Image ──────────────────────────────────────────────────────────

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}


// ─── CSS Animations ──────────────────────────────────────────────────────────
// Per-keyframe timing functions give the acceleration physics of real paper:
// fast pickup → peak speed at the fold → deceleration as it lands.
// skewY simulates the paper flexing (top/bottom lag behind the centre).

const PAGE_FLIP_CSS = `
  @keyframes flipForward {
    0%   {
      transform: rotateY(0deg) translateZ(0px) skewY(0deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.8, 0.6);
    }
    18%  {
      transform: rotateY(-36deg) translateZ(50px) skewY(-1.8deg);
      animation-timing-function: cubic-bezier(0.35, 0, 0.55, 1);
    }
    47%  {
      transform: rotateY(-89deg) translateZ(110px) skewY(-3.2deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.3, 1);
    }
    80%  {
      transform: rotateY(-152deg) translateZ(45px) skewY(-1deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    100% { transform: rotateY(-180deg) translateZ(0px) skewY(0deg); }
  }

  @keyframes flipBackward {
    0%   {
      transform: rotateY(0deg) translateZ(0px) skewY(0deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.8, 0.6);
    }
    18%  {
      transform: rotateY(36deg) translateZ(50px) skewY(1.8deg);
      animation-timing-function: cubic-bezier(0.35, 0, 0.55, 1);
    }
    47%  {
      transform: rotateY(89deg) translateZ(110px) skewY(3.2deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.3, 1);
    }
    80%  {
      transform: rotateY(152deg) translateZ(45px) skewY(1deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    100% { transform: rotateY(180deg) translateZ(0px) skewY(0deg); }
  }

  /* Glare sweeps across the page as it catches then loses light */
  @keyframes glareForward {
    0%   { opacity: 0; background: transparent; }
    8%   { opacity: 1; background: linear-gradient(to right,
             rgba(0,0,0,0.04) 0%, rgba(255,246,210,0.18) 50%,
             rgba(160,120,55,0.32) 80%, rgba(50,25,5,0.52) 100%); }
    30%  { opacity: 1; background: linear-gradient(to right,
             rgba(0,0,0,0.12) 0%, rgba(255,246,210,0.45) 28%,
             rgba(148,108,42,0.56) 62%, rgba(30,12,2,0.75) 100%); }
    46%  { opacity: 1; background: linear-gradient(to right,
             rgba(0,0,0,0.22) 0%, rgba(255,246,210,0.58) 18%,
             rgba(128,88,30,0.65) 52%, rgba(18,8,1,0.82) 100%); }
    52%  { opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes glareBackward {
    0%   { opacity: 0; background: transparent; }
    8%   { opacity: 1; background: linear-gradient(to left,
             rgba(0,0,0,0.04) 0%, rgba(255,246,210,0.18) 50%,
             rgba(160,120,55,0.32) 80%, rgba(50,25,5,0.52) 100%); }
    30%  { opacity: 1; background: linear-gradient(to left,
             rgba(0,0,0,0.12) 0%, rgba(255,246,210,0.45) 28%,
             rgba(148,108,42,0.56) 62%, rgba(30,12,2,0.75) 100%); }
    46%  { opacity: 1; background: linear-gradient(to left,
             rgba(0,0,0,0.22) 0%, rgba(255,246,210,0.58) 18%,
             rgba(128,88,30,0.65) 52%, rgba(18,8,1,0.82) 100%); }
    52%  { opacity: 0; }
    100% { opacity: 0; }
  }

  /* Crescent shadow cast by the flipping page onto the revealed page */
  @keyframes shadowForward {
    0%   { opacity: 0; background: linear-gradient(to right,
             rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 20%,
             rgba(0,0,0,0.12) 48%, transparent 66%); }
    6%   { opacity: 1; }
    46%  { opacity: 1; background: linear-gradient(to right,
             rgba(0,0,0,0.3)  0%, rgba(0,0,0,0.14) 16%,
             rgba(0,0,0,0.03) 36%, transparent 52%); }
    70%  { opacity: 0.35; }
    100% { opacity: 0; }
  }
  @keyframes shadowBackward {
    0%   { opacity: 0; background: linear-gradient(to left,
             rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 20%,
             rgba(0,0,0,0.12) 48%, transparent 66%); }
    6%   { opacity: 1; }
    46%  { opacity: 1; background: linear-gradient(to left,
             rgba(0,0,0,0.3)  0%, rgba(0,0,0,0.14) 16%,
             rgba(0,0,0,0.03) 36%, transparent 52%); }
    70%  { opacity: 0.35; }
    100% { opacity: 0; }
  }

  /* Spine crease line */
  @keyframes creaseForward  {
    0%   { opacity: 0; left: 100%; }
    6%   { opacity: 1; }
    46%  { opacity: 0.8; left: 50%; box-shadow: -8px 0 20px rgba(0,0,0,0.35), 6px 0 14px rgba(0,0,0,0.12); }
    52%  { opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes creaseBackward {
    0%   { opacity: 0; right: 100%; }
    6%   { opacity: 1; }
    46%  { opacity: 0.8; right: 50%; box-shadow: 8px 0 20px rgba(0,0,0,0.35), -6px 0 14px rgba(0,0,0,0.12); }
    52%  { opacity: 0; }
    100% { opacity: 0; }
  }

  .page-flip-forward {
    animation: flipForward var(--flip-dur) linear forwards;
    transform-origin: left center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .page-flip-backward {
    animation: flipBackward var(--flip-dur) linear forwards;
    transform-origin: right center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Column = { title: string; body: string };
type PageData = {
  id: number;
  label: string;
  headline: string;
  deck: string;
  dropCapLetter: string;
  dropCapRest: string;
  paragraphs: string[];
  pullQuote: { text: string; attribution: string };
  photo: string;
  photoAlt: string;
  imageCaption: string;
  columns: Column[];
  authorName?: string;
};

// ─── Content ─────────────────────────────────────────────────────────────────

const PAGES: PageData[] = [
  {
    id: 1,
    label: "COVER STORY",
    headline: "Small Steps, Big Impact:\nBuilding a Better Tomorrow",
    deck: "Think India SVNIT drives change through ideas, initiatives, and collective action.",
    dropCapLetter: "I",
    dropCapRest:
      "n a world brimming with challenges, change begins with a single thought and grows through collective purpose. Think India SVNIT continues to empower young minds to turn that thought into action.",
    paragraphs: [
      "From campus clean-ups to education initiatives, from awareness drives to policy discussions, our mission remains clear — to build a society that is informed, inclusive, and inspired.",
      "Our recent events and campaigns have seen overwhelming participation from students, faculty, and community members. Each step, no matter how small, brings us closer to a future where empathy drives progress and every individual feels responsible for the world we share.",
      "This is not just a journey of service, but a journey of self-discovery — finding our Ikigai in creating impact that lasts.",
    ],
    pullQuote: { text: "Be the change you wish to see in the world.", attribution: "– Mahatma Gandhi" },
    photo: "https://images.unsplash.com/photo-1708578200684-3aa944b73237?w=800&h=600&fit=crop&auto=format",
    photoAlt: "Students gathered for an outdoor campus discussion",
    imageCaption: "Members of Think India SVNIT during a discussion session at the campus amphitheatre.",
    columns: [
      { title: "INITIATIVES THAT MATTER", body: "Our ongoing projects focus on quality education, environmental sustainability, rural development, and youth engagement. Each initiative is designed to create measurable impact and inspire long-term change." },
      { title: "THE POWER OF TOGETHER", body: "We believe that meaningful change happens when individuals come together with a shared vision. Our volunteers, partners, and well-wishers are the backbone of every program we run." },
      { title: "LOOKING AHEAD", body: "With more ideas in the pipeline and a growing community of changemakers, we are excited for the journey ahead. Because when purpose meets passion, there is no limit to what we can achieve together." },
    ],
  },
  {
    id: 2,
    label: "PHILOSOPHY",
    headline: "Ikigai: Discovering the\nReason to Rise Each Morning",
    deck: "The ancient Japanese concept guides our mission — find where passion, skill, purpose, and need converge.",
    dropCapLetter: "T",
    dropCapRest:
      "he word Ikigai (生き甲斐) comes from the Japanese tradition — iki meaning 'life' and kai meaning 'effect, worth, benefit.' Together they describe the feeling that your existence has enduring value.",
    paragraphs: [
      "At Think India SVNIT, we have adopted this philosophy as the cornerstone of our identity. We believe that every student has within them a spark — a unique intersection of passion, skill, purpose, and need — that when ignited, can illuminate an entire community.",
      "Ikigai is not found in isolation. It emerges at the crossroads of four questions: What do you love? What are you good at? What does the world need? And what can you be supported for? When these four circles converge, you find your reason for being.",
      "For our members, this manifests in different ways. For some it is teaching underprivileged children. For others, drafting policy papers on climate adaptation. For many, it is simply showing up — consistently, passionately, for others.",
    ],
    pullQuote: { text: "The purpose of life is a life of purpose.", attribution: "– Robert Byrne" },
    photo: "https://images.unsplash.com/photo-1509029032154-54ba8b3216d4?w=800&h=600&fit=crop&auto=format",
    photoAlt: "A young man looking reflectively out of a window",
    imageCaption: "Reflection and purpose — the two pillars of finding your Ikigai.",
    columns: [
      { title: "WHAT IS YOUR IKIGAI?", body: "Take a moment to reflect: What makes you leap out of bed in the morning? What is the one thing you would do even if you were never paid? The answer might just be the beginning of your ikigai." },
      { title: "THE FOUR CIRCLES", body: "Passion: What you love. Mission: What the world needs. Vocation: What you can be paid for. Profession: What you are good at. Your Ikigai lives at the intersection of all four." },
      { title: "JOIN THE JOURNEY", body: "Whether you are a first-year or a final-year, Think India SVNIT welcomes you. Attend our open sessions, volunteer for a cause, or simply start a conversation. Every step counts." },
    ],
  },
  {
    id: 3,
    label: "OPINION",
    headline: "Youth, Policy & the Responsibility\nWe Cannot Escape",
    deck: "In a democracy, silence is never neutral. The youth of India must engage — loudly, thoughtfully, with conviction.",
    dropCapLetter: "T",
    dropCapRest:
      "here is a particular brand of cynicism that afflicts educated youth in India — a belief that policy is someone else's business, that politics is dirty, and that idealism is naïve. Think India SVNIT was founded precisely to challenge this belief.",
    paragraphs: [
      "The founding story of Think India is not one of grand politics, but of students who realised that their silence was itself a political act. By choosing not to engage, they were choosing the status quo. And the status quo, for millions of Indians, is not acceptable.",
      "At SVNIT, we are surrounded by some of the brightest minds in the country — engineers, scientists, technologists who will shape industry, policy, and society. What we choose to care about, matters enormously.",
      "The challenges India faces — from climate change and digital inequality to rural poverty and urban migration — are complex, technical, and urgent. They require exactly the kind of minds being trained in institutions like ours.",
    ],
    pullQuote: { text: "The youth of a nation are the trustees of posterity.", attribution: "– Benjamin Disraeli" },
    photo: "https://images.unsplash.com/photo-1775338736191-36a6817890cc?w=800&h=600&fit=crop&auto=format",
    photoAlt: "A young woman speaking confidently at a microphone to an audience",
    imageCaption: "A student addresses the Policy Conclave at Think India SVNIT's inaugural inter-college forum.",
    columns: [
      { title: "OUR DEBATES", body: "From energy policy to digital governance, our weekly debate sessions tackle real policy questions with rigour and respect. All perspectives are welcome; all arguments must be evidenced and reasoned." },
      { title: "RESEARCH & WRITING", body: "We publish policy briefs, opinion pieces, and research notes authored by our members. This newsletter is just the beginning. We aim to amplify student voices at the national level." },
      { title: "BE THE AUTHOR", body: "Have an opinion? A policy idea? A story to tell? Write for IKIGAI. We accept submissions from all students and faculty at SVNIT. Reach us at thinkindia@svnit.ac.in" },
    ],
  },
  {
    id: 4,
    label: "COMMUNITY",
    headline: "Events, Voices & the Road Ahead:\nA Season in Review",
    deck: "From orientation drives to flagship debates — a look at what we built together this semester.",
    dropCapLetter: "T",
    dropCapRest:
      "his semester at Think India SVNIT has been one of our most active yet. We welcomed over 80 new members in our orientation drive, conducted three major awareness campaigns, and hosted our first inter-college policy conclave.",
    paragraphs: [
      "The Policy Conclave saw participation from seven institutions across Gujarat, with students presenting research on topics from electric vehicle adoption policy to the right to digital privacy. The quality of discourse was a testament to what young minds can achieve when given a platform.",
      "Our campus clean-up initiative — co-organised with the NSS unit at SVNIT — saw 200 volunteers over two weekends, collecting over 400 kg of waste from the campus and surrounding areas. It sparked conversations about institutional responsibility and student agency.",
      "The semester closed with our flagship event: The Ikigai Talks — a TED-style speaker series where alumni and community leaders shared their journeys of purpose. Four speakers, four stories — each a reminder that impact begins with intention.",
    ],
    pullQuote: { text: "Alone we can do so little; together we can do so much.", attribution: "– Helen Keller" },
    photo: "https://images.unsplash.com/photo-1758599668178-d9716bbda9d5?w=800&h=600&fit=crop&auto=format",
    photoAlt: "Smiling volunteer at a community clean-up drive",
    imageCaption: "Think India SVNIT volunteers during the campus and neighbourhood clean-up campaign.",
    columns: [
      { title: "POLICY HACKATHON", body: "Our first-ever 24-hour Policy Hackathon arrives this October. Teams of 4 will develop solutions for real civic challenges. Registrations open September 1st. All SVNIT students are welcome." },
      { title: "WORKSHOP SERIES", body: "A 6-week workshop series on policy writing, public speaking, and community organizing starts next month. Free for all SVNIT students. Limited seats — register early at our membership portal." },
      { title: "CONNECT WITH US", body: "Follow us @thinkindia_svnit for live updates and announcements. Visit www.thinkindiasvnit.in for archives, membership portal, and past editions of IKIGAI." },
    ],
  },
];

function articleToPage(article: Article, index: number): PageData {
  const paragraphs = article.content.split(/\n\s*\n|\r?\n/).map((item) => item.trim()).filter(Boolean);
  const opening = paragraphs.shift() || article.content;
  const firstCharacter = opening.trim().charAt(0).toUpperCase() || "A";
  return {
    id: 1000 + index,
    label: (ARTICLE_CATEGORY_LABELS[article.category] || "ARTICLE").toUpperCase(),
    headline: article.title,
    deck: article.summary,
    dropCapLetter: firstCharacter,
    dropCapRest: opening.trim().slice(1),
    paragraphs,
    pullQuote: { text: article.tags.length ? article.tags.map((tag) => `#${tag}`).join("  ") : "A contribution from the Think India SVNIT community.", attribution: `â€“ ${article.authorName}` },
    photo: article.coverImageURL || "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&auto=format",
    photoAlt: article.title,
    imageCaption: `Article submitted by ${article.authorName}.`,
    columns: [
      { title: "AUTHOR", body: article.authorName },
      { title: "CATEGORY", body: ARTICLE_CATEGORY_LABELS[article.category] || article.category },
      { title: "THINK INDIA SVNIT", body: "Published after editorial review." },
    ],
    authorName: article.authorName,
  };
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const ThinkIndiaLogo = ({ className = "", style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 50 62" className={className} style={style} fill="none">
    <line x1="7"  y1="9"  x2="4"  y2="5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="15" y1="5"  x2="14" y2="1"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="25" y1="3"  x2="25" y2="0"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="35" y1="5"  x2="36" y2="1"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="43" y1="9"  x2="46" y2="5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="25" cy="15" r="5.5" fill="currentColor" />
    <line x1="25" y1="20.5" x2="25" y2="42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="25" y1="28"   x2="10" y2="19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="25" y1="28"   x2="40" y2="19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="25" y1="42"   x2="16" y2="58" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="25" y1="42"   x2="34" y2="58" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const Masthead = ({ edition }: { edition: NewspaperEdition }) => (
  <div style={{ borderBottom: "2px solid #1a1209", paddingBottom: "8px", marginBottom: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
      <div style={{ flex: 1, height: 1, background: "#1a1209" }} />
      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "9px", letterSpacing: "0.28em", color: "#1a1209" }}>
        {edition.tagline}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1a1209" }} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <ThinkIndiaLogo className="text-[#1a1209]" style={{ width: 36, height: 44 }} />
        <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "7px", letterSpacing: "0.1em", color: "#1a1209", textAlign: "center", lineHeight: 1.3 }}>
          THINK INDIA<br />SVNIT
        </span>
      </div>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "clamp(1.9rem,7.5vw,4.2rem)", color: "#1a1209", lineHeight: 1, letterSpacing: "-0.01em", margin: 0 }}>
          IKIGAI
        </h1>
        <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(8px,1.1vw,11px)", letterSpacing: "0.22em", color: "#1a1209", marginTop: "2px" }}>
          by THINK INDIA SVNIT · {edition.editionName}
        </p>
      </div>
      <div style={{ textAlign: "right", maxWidth: "86px" }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: "#1a1209", lineHeight: 1, display: "block" }}>"</span>
        <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: "9.5px", color: "#1a1209", lineHeight: 1.45 }}>
          A platform for thoughts that matter and actions that create impact.
        </p>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: "#1a1209", lineHeight: 1, display: "block" }}>"</span>
      </div>
    </div>
  </div>
);

// ─── Page Content ─────────────────────────────────────────────────────────────

const PageContent = ({ page, edition }: { page: PageData; edition: NewspaperEdition }) => (
  <div
    style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden",
      backgroundColor: "#e8dcd0",
      backgroundImage: [
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.55 0 0 0 0 0.46 0 0 0 0 0.35 0 0 0 0.11 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        "repeating-linear-gradient(transparent 0px, transparent 21px, rgba(80,60,35,0.045) 21px, rgba(80,60,35,0.045) 22px)",
      ].join(", "),
      fontFamily: "'EB Garamond',Georgia,serif",
    }}
  >
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", padding: "clamp(10px,1.8vw,18px) clamp(14px,2.2vw,22px) clamp(8px,1.4vw,12px)" }}>
      <Masthead edition={edition} />

      {/* Edition bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #1a1209", borderBottom: "1px solid #1a1209", padding: "2px 0", margin: "0 0 5px", fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.9vw,8.5px)", letterSpacing: "0.12em", color: "#1a1209" }}>
        <span>DATE: {edition.date.toUpperCase()}</span>
        <span>|</span><span>{edition.editionName.toUpperCase()}</span>
        <span>|</span><span>{edition.volume.toUpperCase()}</span>
        <span>|</span><span>SVNIT, SURAT</span>
        <span>|</span><span>PRICE: {edition.price.toUpperCase()}</span>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(7px,0.9vw,9px)", letterSpacing: "0.32em", color: "#1a1209", borderBottom: "1px solid #1a1209", paddingBottom: "1px" }}>
          {page.label}
        </span>
      </div>

      {/* Headline */}
      <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "clamp(1.05rem,2.8vw,1.9rem)", color: "#1a1209", lineHeight: 1.08, whiteSpace: "pre-line", textAlign: "center", margin: "0 0 4px" }}>
        {page.headline}
      </h2>

      {/* Deck */}
      <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(0.6rem,1.1vw,0.8rem)", color: "#1a1209", lineHeight: 1.4, textAlign: "center", fontStyle: "italic", borderBottom: "1px solid #1a1209", paddingBottom: "7px", margin: "0 0 7px" }}>
        {page.deck}
      </p>
      {page.authorName && (
        <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.85vw,8.5px)", letterSpacing: "0.15em", color: "#1a1209", textAlign: "center", margin: "-3px 0 7px" }}>
          WRITTEN BY {page.authorName.toUpperCase()}
        </p>
      )}

      {/* 2-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
        {/* Left: text */}
        <div>
          <p style={{ fontSize: "clamp(9px,1.05vw,10.5px)", color: "#1a1209", lineHeight: 1.62, textAlign: "justify", marginBottom: "6px" }}>
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: "3.4em", lineHeight: 0.7, marginTop: "0.08em", float: "left", marginRight: "3px", color: "#1a1209" }}>
              {page.dropCapLetter}
            </span>
            {page.dropCapRest}
          </p>
          {page.paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: "clamp(9px,1.05vw,10.5px)", color: "#1a1209", lineHeight: 1.62, textAlign: "justify", marginBottom: "6px" }}>
              {p}
            </p>
          ))}
          {/* Pull quote */}
          <div style={{ borderTop: "2px solid #1a1209", borderBottom: "2px solid #1a1209", padding: "6px 4px", marginTop: "4px" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: "#1a1209", lineHeight: 1, display: "block" }}>"</span>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(0.58rem,1.1vw,0.76rem)", color: "#1a1209", lineHeight: 1.4, fontStyle: "italic", fontWeight: 700, margin: 0 }}>
              {page.pullQuote.text}
            </p>
            <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.85vw,8.5px)", color: "#1a1209", marginTop: "4px", letterSpacing: "0.1em" }}>
              {page.pullQuote.attribution}
            </p>
          </div>
        </div>

        {/* Right: photo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ border: "1px solid #1a1209", overflow: "hidden", flex: 1, minHeight: 0, aspectRatio: "4/3" }}>
            <ImageWithFallback
              src={page.photo}
              alt={page.photoAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: "8.5px", color: "#1a1209", textAlign: "center", marginTop: "4px", fontStyle: "italic", lineHeight: 1.4 }}>
            {page.imageCaption}
          </p>
        </div>
      </div>

      {/* Bottom 3-column section */}
      <div style={{ borderTop: "1px solid #1a1209", paddingTop: "7px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {page.columns.map((col, i) => (
          <div key={i} style={{ paddingRight: i < 2 ? "10px" : 0, marginRight: i < 2 ? "10px" : 0, borderRight: i < 2 ? "1px solid #1a1209" : "none" }}>
            <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.85vw,8.5px)", fontWeight: 600, letterSpacing: "0.18em", color: "#1a1209", marginBottom: "4px" }}>
              {col.title}
            </h3>
            <p style={{ fontSize: "clamp(8px,0.95vw,10px)", color: "#1a1209", lineHeight: 1.55, textAlign: "justify" }}>
              {col.body}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "2px solid #1a1209", marginTop: "7px", paddingTop: "5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Globe style={{ width: 10, height: 10, color: "#1a1209" }} />
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.8vw,8px)", color: "#1a1209" }}>www.thinkindiasvnit.in</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Instagram style={{ width: 10, height: 10, color: "#1a1209" }} />
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.8vw,8px)", color: "#1a1209" }}>@thinkindia_svnit</span>
        </div>
        <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(6.5px,0.8vw,8px)", color: "#1a1209", letterSpacing: "0.12em" }}>
          Let's Think. Let's Act. Let's Create Impact.
        </span>
      </div>
    </div>
  </div>
);

// ─── Nav Button ───────────────────────────────────────────────────────────────

const NavButton = ({
  direction, onClick, disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) => {
  const isPrev = direction === "prev";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: "absolute",
        top: "calc(50% + 5%)",
        transform: "translateY(-50%)",
        [isPrev ? "left" : "right"]: "clamp(8px, 2vw, 20px)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        width: "clamp(48px, 6vw, 68px)",
        height: "clamp(100px, 16vh, 140px)",
        background: "rgba(26,18,9,0.84)",
        border: "1px solid rgba(232,220,208,0.22)",
        borderRadius: isPrev ? "0 10px 10px 0" : "10px 0 0 10px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0 : 1,
        transition: "opacity 0.25s, background 0.2s",
        backdropFilter: "blur(4px)",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,18,9,0.96)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,18,9,0.84)"; }}
    >
      {isPrev
        ? <ChevronLeft style={{ width: "clamp(22px,3.5vw,34px)", height: "clamp(22px,3.5vw,34px)", color: "#e8dcd0" }} strokeWidth={1.8} />
        : <ChevronRight style={{ width: "clamp(22px,3.5vw,34px)", height: "clamp(22px,3.5vw,34px)", color: "#e8dcd0" }} strokeWidth={1.8} />
      }
      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(7px,1vw,9px)", letterSpacing: "0.18em", color: "rgba(232,220,208,0.75)", writingMode: "vertical-rl", transform: isPrev ? "rotate(180deg)" : "none" }}>
        {isPrev ? "PREV" : "NEXT"}
      </span>
    </button>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────

const FLIP_DUR = "1.05s";

export default function App() {
  const [editions, setEditions] = useState<NewspaperEdition[]>(DEFAULT_EDITIONS);
  const [selectedEditionId, setSelectedEditionId] = useState<string>("edition-1");
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [newsstandOpen, setNewsstandOpen] = useState(true);
  const [pages, setPages] = useState<PageData[]>(DEFAULT_EDITIONS[0].pages);
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingPage,  setPendingPage]  = useState<number | null>(null);
  const [isFlipping,   setIsFlipping]   = useState(false);
  const [direction,    setDirection]    = useState<"forward" | "backward">("forward");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeEdition = editions.find((e) => e.id === selectedEditionId) || editions[0] || DEFAULT_EDITIONS[0];

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = PAGE_FLIP_CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  // Check URL params for direct edition or preview
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEdition = params.get("edition");
      const isPreview = params.get("preview") === "1";
      const forceStand = params.get("stand") === "1";

      if (urlEdition) {
        setSelectedEditionId(urlEdition);
      }

      if (forceStand) {
        setNewsstandOpen(true);
      } else if (isPreview || (urlEdition && !forceStand)) {
        setNewsstandOpen(false);
      } else {
        // Direct click to /Article opens the newsstand shelf
        setNewsstandOpen(true);
      }
    }
  }, []);

  // Load editions and published articles
  useEffect(() => {
    let cancelled = false;
    getNewspaperEditions()
      .then((loaded) => {
        if (!cancelled && loaded && loaded.length > 0) setEditions(loaded);
      })
      .catch((err) => console.error("Error loading editions", err));

    getPublishedArticles()
      .then((articles) => {
        if (!cancelled) setPublishedArticles(articles);
      })
      .catch((error) => console.error("Unable to load published articles", error));

    return () => { cancelled = true; };
  }, []);

  // Compute pages whenever activeEdition, publishedArticles, or preview changes
  useEffect(() => {
    const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
    const preview = isPreview ? getArticlePreview() : null;

    const basePages: PageData[] = activeEdition.pages && activeEdition.pages.length > 0
      ? activeEdition.pages
      : DEFAULT_EDITIONS[0].pages;

    const matchingArticles = publishedArticles.filter(
      (a) => a.editionId === activeEdition.id || (!a.editionId && activeEdition.id === "edition-1")
    );

    const articlePages = matchingArticles.map(articleToPage);
    const combinedPages = [...basePages, ...articlePages];

    if (preview) {
      combinedPages.push(articleToPage(preview, combinedPages.length));
    }

    setPages(combinedPages);
    setCurrentPage(0);
  }, [activeEdition, publishedArticles]);

  const flipTo = (target: number) => {
    if (isFlipping || target < 0 || target >= pages.length || target === currentPage) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setDirection(target > currentPage ? "forward" : "backward");
    setPendingPage(target);
    setIsFlipping(true);
    timerRef.current = setTimeout(() => {
      setCurrentPage(target);
      setIsFlipping(false);
      setPendingPage(null);
    }, 1060);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const selectEdition = (editionId: string) => {
    setSelectedEditionId(editionId);
    setCurrentPage(0);
    setNewsstandOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edition", editionId);
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#d0c4b4" }}>
      {/* ── Floating Header: Navigation & Newsstand Opener ── */}
      <div style={{
        position: "absolute",
        top: "14px",
        left: "clamp(10px, 2.5vw, 24px)",
        right: "clamp(10px, 2.5vw, 24px)",
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "auto" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "rgba(26,18,9,0.86)",
              color: "#e8dcd0",
              borderRadius: "9999px",
              border: "1px solid rgba(232,220,208,0.22)",
              fontSize: "11px",
              fontFamily: "'Oswald',sans-serif",
              letterSpacing: "0.14em",
              textDecoration: "none",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <ArrowLeft size={13} />
            PORTAL HOME
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "6px 12px",
              background: "rgba(245,236,223,0.92)",
              color: "#1a1209",
              borderRadius: "9999px",
              border: "1px solid #1a1209",
              fontSize: "10.5px",
              fontFamily: "'Oswald',sans-serif",
              letterSpacing: "0.1em",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#b45309" }} />
            <span>{activeEdition.volume} · {activeEdition.editionName}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "auto" }}>
          <button
            onClick={() => setNewsstandOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 16px",
              background: "#1a1209",
              color: "#f5ecdf",
              borderRadius: "9999px",
              border: "1px solid #8b7355",
              fontSize: "11px",
              fontFamily: "'Oswald',sans-serif",
              letterSpacing: "0.15em",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(26,18,9,0.3)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Library size={13} />
            <span>THE NEWSSTAND ({editions.length} EDITIONS)</span>
          </button>
          <Link
            href="/submit-article?tab=my-articles"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "rgba(245,236,223,0.92)",
              color: "#1a1209",
              borderRadius: "9999px",
              border: "1px solid #1a1209",
              fontSize: "11px",
              fontFamily: "'Oswald',sans-serif",
              letterSpacing: "0.12em",
              textDecoration: "none",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Clock size={13} />
            <span>MY ARTICLES</span>
          </Link>
          <Link
            href="/submit-article"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              background: "#b45309",
              color: "#ffffff",
              borderRadius: "9999px",
              fontSize: "11px",
              fontFamily: "'Oswald',sans-serif",
              letterSpacing: "0.12em",
              textDecoration: "none",
              fontWeight: 600,
              boxShadow: "0 3px 10px rgba(180,83,9,0.3)",
            }}
          >
            <PenSquare size={13} />
            <span>SUBMIT ARTICLE</span>
          </Link>
        </div>
      </div>

      {/* 3-D stage */}
      <div style={{ position: "absolute", top: "10%", bottom: 0, left: 0, right: 0, perspective: "3500px", perspectiveOrigin: "50% 50%" }}>

        {/* Bottom layer: page being revealed */}
        <div style={{ position: "absolute", inset: 0 }}>
          {pages.length > 0 && (
            <PageContent page={pages[pendingPage ?? currentPage] || pages[0]} edition={activeEdition} />
          )}
        </div>

        {/* Shadow on revealed page */}
        {isFlipping && pendingPage !== null && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
            animation: `${direction === "forward" ? "shadowForward" : "shadowBackward"} ${FLIP_DUR} linear forwards`,
          }} />
        )}

        {/* Spine crease */}
        {isFlipping && pendingPage !== null && (
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "3px",
            background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.15), transparent)",
            pointerEvents: "none", zIndex: 4,
            animation: `${direction === "forward" ? "creaseForward" : "creaseBackward"} ${FLIP_DUR} linear forwards`,
          }} />
        )}

        {/* Top layer: the page that flips away */}
        {isFlipping && pages.length > 0 && (
          <div
            className={`page-flip-${direction}`}
            style={({ "--flip-dur": FLIP_DUR, position: "absolute", inset: 0, zIndex: 2 } as React.CSSProperties)}
          >
            <PageContent page={pages[currentPage] || pages[0]} edition={activeEdition} />

            {/* Glare on turning page */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
              animation: `${direction === "forward" ? "glareForward" : "glareBackward"} ${FLIP_DUR} linear forwards`,
            }} />

            {/* Paper-edge thickness strip */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, width: "3px",
              [direction === "forward" ? "left" : "right"]: 0,
              background: "linear-gradient(to right, rgba(70,45,18,0.55), rgba(200,175,130,0.4), transparent)",
              zIndex: 11, pointerEvents: "none",
            }} />
          </div>
        )}
      </div>

      {/* ── Large side nav buttons ── */}
      <NavButton direction="prev" onClick={() => flipTo(currentPage - 1)} disabled={currentPage === 0 || isFlipping} />
      <NavButton direction="next" onClick={() => flipTo(currentPage + 1)} disabled={currentPage === pages.length - 1 || isFlipping} />

      {/* ── Bottom page-dot indicator ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        padding: "9px 0 10px",
        background: "rgba(232,220,208,0.9)", backdropFilter: "blur(6px)",
        borderTop: "1px solid rgba(26,18,9,0.18)",
      }}>
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => flipTo(i)}
            disabled={isFlipping}
            style={{
              borderRadius: "9999px",
              width: i === currentPage ? 24 : 7,
              height: 7,
              background: i === currentPage ? "#1a1209" : "#8b7355",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
              cursor: isFlipping ? "default" : "pointer",
              border: "none",
              padding: 0,
            }}
          />
        ))}
        <span style={{ position: "absolute", right: 16, fontFamily: "'Oswald',sans-serif", fontSize: "9px", letterSpacing: "0.2em", color: "#5a4a35" }}>
          {currentPage + 1} / {pages.length}
        </span>
      </div>

      {/* ── Newsstand Modal / Newspaper Shelf ── */}
      {newsstandOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(18, 12, 7, 0.84)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setNewsstandOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              maxHeight: "90vh",
              background: "#e8dcd0",
              backgroundImage:
                "repeating-linear-gradient(transparent 0px, transparent 24px, rgba(80,60,35,0.04) 24px, rgba(80,60,35,0.04) 25px)",
              borderRadius: "20px",
              border: "3px solid #1a1209",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Newsstand Header */}
            <div style={{ padding: "18px 24px", borderBottom: "2px solid #1a1209", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(232,220,208,0.85)" }}>
              <div>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "10px", letterSpacing: "0.26em", color: "#8b5e3c", display: "block" }}>
                  THE THINK INDIA ARCHIVES
                </span>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.75rem", fontWeight: 900, color: "#1a1209", margin: 0 }}>
                  The Newspaper Stand & Editions
                </h2>
                <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: "13px", color: "#5a4a35", margin: "2px 0 0" }}>
                  Select any edition below to open its broadsheet and read its front-page coverage.
                </p>
              </div>
              <button
                onClick={() => setNewsstandOpen(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #1a1209",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#1a1209",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Rack Grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px" }}>
              {editions.map((ed) => {
                const isCurrent = ed.id === activeEdition.id;
                return (
                  <div
                    key={ed.id}
                    onClick={() => selectEdition(ed.id)}
                    style={{
                      background: "#f4ede2",
                      border: isCurrent ? "2.5px solid #b45309" : "1.5px solid #1a1209",
                      borderRadius: "12px",
                      padding: "18px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      boxShadow: isCurrent ? "0 10px 25px rgba(180,83,9,0.2)" : "0 4px 12px rgba(0,0,0,0.06)",
                      transform: isCurrent ? "translateY(-2px)" : "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.16)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isCurrent ? "translateY(-2px)" : "none";
                      e.currentTarget.style.boxShadow = isCurrent ? "0 10px 25px rgba(180,83,9,0.2)" : "0 4px 12px rgba(0,0,0,0.06)";
                    }}
                  >
                    {/* Active Ribbon Badge */}
                    {isCurrent && (
                      <div style={{ position: "absolute", top: 12, right: 12, background: "#b45309", color: "#fff", fontSize: "9px", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.15em", padding: "2px 8px", borderRadius: "9999px" }}>
                        CURRENTLY OPEN
                      </div>
                    )}

                    {/* Mini masthead */}
                    <div style={{ borderBottom: "1px solid #1a1209", paddingBottom: "8px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "8.5px", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.14em", color: "#5a4a35" }}>
                        <span>{ed.volume}</span>
                        <span>{ed.date}</span>
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.3rem", fontWeight: 900, color: "#1a1209", margin: "4px 0 2px" }}>
                        {ed.title}
                      </h3>
                      <span style={{ fontSize: "9px", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.12em", color: "#8b5e3c" }}>
                        {ed.editionName}
                      </span>
                    </div>

                    {/* Cover Thumbnail */}
                    <div style={{ height: "135px", overflow: "hidden", border: "1px solid #1a1209", borderRadius: "4px", marginBottom: "10px" }}>
                      <ImageWithFallback
                        src={ed.coverPhoto}
                        alt={ed.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Cover Headline & Deck */}
                    <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: "12px", color: "#1a1209", margin: "0 0 6px", lineHeight: 1.35 }}>
                      "{ed.coverStoryHeadline.replace("\n", " ")}"
                    </p>
                    <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: "11px", color: "#5a4a35", lineHeight: 1.4, flex: 1, margin: 0 }}>
                      {ed.description}
                    </p>

                    {/* Action Bar */}
                    <div style={{ borderTop: "1px solid rgba(26,18,9,0.15)", marginTop: "12px", paddingTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "9px", letterSpacing: "0.12em", color: "#5a4a35" }}>
                        {ed.pages?.length || 4} BROADSHEET PAGES
                      </span>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: isCurrent ? "#b45309" : "#1a1209", display: "flex", alignItems: "center", gap: "4px" }}>
                        {isCurrent ? "READING NOW →" : "READ EDITION →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
