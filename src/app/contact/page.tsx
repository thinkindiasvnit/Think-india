"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { addQuery } from "../../lib/queriesService";

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", query: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reveal-item",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await addQuery(formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", query: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("Error submitting query:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-transparent relative z-10 w-full overflow-hidden">
      {/* Contact Section - full height */}
      <section className="relative flex flex-col justify-center min-h-screen py-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-16 items-center lg:items-start justify-between">
          
          {/* Left Column: Contact Info */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-8">
            <div className="reveal-item mb-6 inline-flex items-center gap-4">
              <span className="text-amber-600 font-black tracking-widest uppercase text-xs">Get In Touch</span>
            </div>
            <h1 className="reveal-item text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight font-heading mb-8">
              Contact Us
            </h1>
            <p className="reveal-item text-zinc-600 text-lg leading-relaxed mb-10 max-w-md">
              We would love to hear from you. Whether you have a question about our events, want to join the chapter, or just want to say hi, feel free to reach out.
            </p>

            <div className="reveal-item flex flex-col gap-6 w-full max-w-md">
              <a 
                href="mailto:thinkindia@svnit.ac.in" 
                className="group flex items-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 w-full"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mr-6 group-hover:bg-amber-600 transition-colors duration-300 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-700 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1 text-left">Email</h3>
                  <p className="text-zinc-600 font-medium">thinkindia@svnit.ac.in</p>
                </div>
              </a>

              <a 
                href="https://instagram.com/thinkindiasvnit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 w-full"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mr-6 group-hover:bg-amber-600 transition-colors duration-300 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-700 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1 text-left">Instagram</h3>
                  <p className="text-zinc-600 font-medium">@thinkindiasvnit</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="reveal-item w-full lg:w-1/2 max-w-lg bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl border border-amber-100">
            <h3 className="text-2xl font-black text-zinc-900 mb-6 font-heading">Send us a message</h3>
            
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl font-medium">
                Thank you! Your message has been sent successfully. We will get back to you soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium">
                Oops! Something went wrong. Please try again later.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-zinc-900 mb-2">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white/50"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-zinc-900 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white/50"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="query" className="block text-sm font-bold text-zinc-900 mb-2">Your Message/Query</label>
                <textarea 
                  id="query"
                  name="query"
                  required
                  rows={4}
                  value={formData.query}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white/50 resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
