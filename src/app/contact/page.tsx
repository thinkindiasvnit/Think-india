"use client";

import { useState } from "react";
import { addQuery } from "../../lib/queriesService";

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-amber-600 font-bold text-sm tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "'Barlow', sans-serif" }}>
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
    <div className="flex flex-col min-h-screen bg-transparent relative z-10 w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
      `}</style>

      <section className="relative py-28 md:py-36 px-8 md:px-16 min-h-screen flex items-center bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* ── Left: Contact Info ── */}
            <div>
              <SectionLabel text="GET IN TOUCH" />
              <h1
                className="font-bold leading-tight mb-6 text-zinc-900"
                style={{ fontFamily: "'Barlow', sans-serif", fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
              >
                READY TO MAKE<br />AN IMPACT?
              </h1>
              <p className="text-zinc-600 text-lg leading-relaxed mb-10 max-w-md">
                Have questions, ideas, or just want to connect? Reach out to the Think India SVNIT chapter — we&apos;d love to hear from you.
              </p>

              <div className="flex flex-col gap-5">
                {/* Email */}
                <a href="mailto:thinkindia@svnit.ac.in" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <svg width="18" height="18" viewBox="0 0 20 16" fill="none">
                      <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" strokeWidth="1.6" />
                      <path d="M1 4l9 6 9-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold tracking-widest uppercase mb-0.5">Email</p>
                    <p className="text-zinc-900 font-medium group-hover:text-amber-600 transition-colors">thinkindia@svnit.ac.in</p>
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
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md"
                    style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold tracking-widest uppercase mb-0.5">Instagram</p>
                    <p className="text-zinc-900 font-medium group-hover:text-amber-600 transition-colors">@thinkindia.svnit</p>
                  </div>
                </a>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold tracking-widest uppercase mb-0.5">Address</p>
                    <p className="text-zinc-900 font-medium text-sm leading-relaxed">SVNIT Campus, Ichchhanath,<br />Surat, Gujarat – 395007</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-amber-200/50 shadow-[0_8px_40px_-12px_rgba(217,119,6,0.2)]">
              <h3 className="font-bold text-2xl mb-6 text-zinc-900" style={{ fontFamily: "'Barlow', sans-serif" }}>
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
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Message</label>
                  <textarea
                    name="query"
                    required
                    rows={4}
                    placeholder="Tell us more..."
                    value={formData.query}
                    onChange={handleChange}
                    className="bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 bg-amber-600 text-white font-bold text-sm tracking-[0.18em] px-8 py-4 rounded-full hover:bg-amber-700 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_-4px_rgba(217,119,6,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
