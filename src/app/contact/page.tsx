"use client";

import { useState } from "react";
import { addQuery } from "../../lib/queriesService";

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
M 530,510 L 540,525 L 535,542 L 525,528 Z`;

function IndiaMapBg({ opacity = 0.12, stroke = "#C8855A" }: { opacity?: number; stroke?: string }) {
  return (
    <svg
      viewBox="150 10 550 600"
      className="absolute inset-0 w-full h-full"
      style={{ opacity }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={INDIA_PATH} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="448" cy="555" r="3" fill={stroke} opacity="0.7" />
      <text x="420" y="552" fontSize="10" fill={stroke} opacity="0.8" fontFamily="Plus Jakarta Sans">SVNIT SURAT</text>
      <circle cx="462" cy="468" r="2.5" fill={stroke} opacity="0.5" />
      <text x="468" y="465" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">MUMBAI</text>
      <circle cx="390" cy="415" r="2.5" fill={stroke} opacity="0.5" />
      <text x="396" y="412" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">KOLKATA</text>
      <text x="300" y="490" fontSize="9" fill={stroke} opacity="0.6" fontFamily="Plus Jakarta Sans">BENGALURU</text>
    </svg>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[#E07800] font-bold text-sm tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
      {text}
    </p>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", query: "" });
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await addQuery({ ...formData, query: subject ? `[${subject}] ${formData.query}` : formData.query });
      setSubmitStatus("success");
      setFormData({ name: "", email: "", query: "" });
      setSubject("");
      setTimeout(() => setSubmitStatus("idle"), 6000);
    } catch (error) {
      console.error("Error submitting query:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF0DC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
      `}</style>

      <section
        id="contact"
        className="relative py-28 md:py-36 px-8 md:px-16 overflow-hidden min-h-screen flex items-center"
        style={{ background: "linear-gradient(160deg, #FDE4C8 0%, #FAF0DC 45%, #FDECD5 100%)" }}
      >
        <IndiaMapBg opacity={0.18} />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* ── Left: Contact Info ── */}
            <div>
              <SectionLabel text="GET IN TOUCH" />
              <h1
                className="font-bold leading-tight mb-6"
                style={{ fontFamily: "'Barlow', sans-serif", fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
              >
                READY TO MAKE<br />AN IMPACT?
              </h1>
              <p className="text-[#5A5449] text-lg leading-relaxed mb-10 max-w-md">
                Have questions, ideas, or just want to connect? Reach out to the Think India SVNIT chapter — we&apos;d love to hear from you.
              </p>

              <div className="flex flex-col gap-5">
                {/* Email */}
                <a href="mailto:thinkindia@svnit.ac.in" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-[#E07800] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 20 16" fill="none">
                      <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" strokeWidth="1.6" />
                      <path d="M1 4l9 6 9-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Email</p>
                    <p className="text-[#0F0E0C] font-medium group-hover:text-[#E07800] transition-colors">thinkindia@svnit.ac.in</p>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/thinkindia.svnit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Instagram</p>
                    <p className="text-[#0F0E0C] font-medium group-hover:text-[#E07800] transition-colors">@thinkindia.svnit</p>
                  </div>
                </a>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F0E0C] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#E07800] font-semibold tracking-widest uppercase mb-0.5">Address</p>
                    <p className="text-[#0F0E0C] font-medium text-sm leading-relaxed">SVNIT Campus, Ichchhanath,<br />Surat, Gujarat – 395007</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-[#E0780020] shadow-[0_8px_40px_-12px_rgba(224,120,0,0.15)]">
              <h3 className="font-bold text-2xl mb-6 text-[#0F0E0C]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                Send us a message
              </h3>

              {submitStatus === "success" && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                  ✓ Message sent! We&apos;ll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                  Something went wrong. Please try again later.
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-[#5A5449] uppercase">Message</label>
                  <textarea
                    name="query"
                    required
                    rows={4}
                    placeholder="Tell us more..."
                    value={formData.query}
                    onChange={handleChange}
                    className="bg-[#FAF0DC] border border-[#E0780025] rounded-xl px-4 py-3 text-sm text-[#0F0E0C] placeholder-[#B0A898] focus:outline-none focus:border-[#E07800] focus:ring-1 focus:ring-[#E0780040] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 bg-[#E07800] text-white font-bold text-sm tracking-[0.18em] px-8 py-4 rounded-full hover:bg-[#B85E00] hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_-4px_rgba(224,120,0,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ fontFamily: "'Barlow', sans-serif" }}
                >
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE →"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
