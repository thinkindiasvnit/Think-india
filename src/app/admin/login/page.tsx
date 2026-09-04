"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginAdmin, isAdminLoggedIn } from "../../../lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect straight to events
  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.replace("/admin/events");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(email, password);
      router.replace("/admin/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#fffdfa]">

      {/* ── Background layers matching project globals ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_#ffedd5_0%,_#fff7ed_50%,_#fffdfa_100%)]" />

      {/* Ambient orange glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-amber-300/8 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(217,119,6,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(217,119,6,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative top-left ornament */}
      <div className="absolute top-8 left-8 hidden lg:flex flex-col gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-1.5">
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                className="w-1 h-1 rounded-full bg-amber-400/40"
                style={{ opacity: 1 - (i + j) * 0.08 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Decorative bottom-right ornament */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-1.5">
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                className="w-1 h-1 rounded-full bg-amber-400/40"
                style={{ opacity: 1 - (i + j) * 0.08 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="relative w-full max-w-[440px]">

        {/* Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-200 shadow-lg shadow-amber-200/60 flex items-center justify-center mb-5 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Think India SVNIT Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          {/* Overline */}
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-amber-500" />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-amber-700">
              Admin Portal
            </span>
            <div className="w-8 h-px bg-amber-500" />
          </div>

          <h1 className="text-3xl font-black text-slate-950 tracking-tight font-heading leading-tight">
            Think India
            <span className="text-amber-600"> SVNIT</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1.5">
            Sign in to manage events, blogs & team
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border border-amber-200/80 p-7 sm:p-9"
          style={{
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 40px -8px rgba(217,119,6,0.14), 0 2px 8px -2px rgba(0,0,0,0.06)",
          }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 font-heading leading-none">
                Sign In
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                @svnit.ac.in addresses only
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="yourname@svnit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-950 placeholder-slate-300 shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-amber-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-950 placeholder-slate-300 shadow-sm transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-amber-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <svg className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-rose-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-white text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-600/30 hover:shadow-amber-600/40 transition-all duration-200 relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Admin Panel
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-amber-100 flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-slate-400 text-center">
              Restricted to authorised Think India SVNIT administrators
            </p>
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs font-semibold text-slate-400 mt-6">
          © {new Date().getFullYear()} Think India SVNIT Chapter · All rights reserved
        </p>
      </div>
    </div>
  );
}
