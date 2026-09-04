"use client";

import Link from "next/link";

export default function TeamIntroPage() {
  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center bg-orange-glow-radial-light bg-amber-grid-pattern-light px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-600 selection:text-white">
      
      {/* Decorative gradient blobs with a subtle breathing pulse */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="relative max-w-4xl w-full mr-auto py-20 text-left">
        
        {/* Chapter Subtitle */}
        <div className="animate-[fadeIn_0.6s_ease-out_forwards] opacity-0">
          <span className="inline-block text-xs font-black tracking-widest text-amber-950 uppercase mb-4 px-3.5 py-1.5 bg-amber-100 rounded-xl border border-amber-300 shadow-sm">
            Think India · SVNIT Chapter
          </span>
        </div>

        {/* Main Energetic Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 font-heading leading-tight animate-[slideUp_0.7s_ease-out_0.15s_forwards] opacity-0 [transform:translateY(20px)]">
          Meet our Team <br className="hidden sm:inline" />
          <span className="text-amber-800">Driving innovation and shaping the future together.</span>
        </h1>

        {/* Inspiring Intro Description */}
        <p className="mt-6 text-lg sm:text-lg text-slate-800 font-medium max-w-2xl leading-relaxed animate-[slideUp_0.7s_ease-out_0.3s_forwards] opacity-0 [transform:translateY(20px)]">
          We are the passionate change-makers, leaders, and creators of Think India SVNIT, dedicated to fostering national spirit and technological excellence.
        </p>

        {/* Action Button Box */}
        <div className="mt-10 flex flex-col sm:flex-row items-start justify-start gap-4 animate-[slideUp_0.7s_ease-out_0.45s_forwards] opacity-0 [transform:translateY(20px)]">
          <Link
            href="/team/members"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl shadow-lg shadow-amber-600/30 hover:-translate-y-0.5 transition-all duration-200 border border-amber-500"
          >
            Meet Our Team →
          </Link>
        </div>

      </div>

      {/* Global CSS keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}