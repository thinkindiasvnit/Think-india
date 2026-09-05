"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";

function readableError(error: unknown) {
  if (error instanceof Error && (error.message.includes(".svnit.ac.in") || error.message.includes("@"))) return error.message;
  if (error instanceof Error && error.message.includes("Too many failed attempts")) return error.message;
  const code = (error as { code?: string }).code;
  if (code === "auth/invalid-credential") return "Incorrect email or password.";
  if (code === "auth/email-already-in-use") return "An account already exists for this email.";
  if (code === "auth/weak-password") return "Use a password with at least six characters.";
  if (code === "auth/operation-not-allowed") return "Email/password sign-in is not enabled in Firebase yet.";
  if (code === "auth/network-request-failed") return "Network error. Check your internet connection and try again.";
  return "Unable to continue. Please try again.";
}

function LoginForm() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const destination = searchParams.get("next") === "/submit-article" ? "/submit-article" : "/";

  useEffect(() => {
    if (!loading && user) router.replace(destination);
  }, [destination, loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") await signUp(name, email, password);
      else await signIn(email, password);
      router.replace(destination);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen pt-36 pb-16 px-4 bg-orange-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white border border-amber-200 shadow-xl p-8 space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Think India SVNIT</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-zinc-600">Sign in to submit an article for editorial review.</p>
        </div>
        {mode === "signup" && <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full rounded-xl border border-zinc-300 px-4 py-3" />}
        <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        <input required minLength={6} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-zinc-300 px-4 py-3" />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        <button disabled={submitting} className="w-full rounded-xl bg-amber-600 px-4 py-3 font-bold text-white disabled:opacity-60">{submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        <p className="text-center text-sm text-zinc-600">{mode === "signin" ? "New here?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="font-bold text-amber-700">{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
        <Link href="/Article" className="block text-center text-sm font-medium text-zinc-500 hover:text-zinc-900">← Back to articles</Link>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-zinc-600">Loading sign in…</div>}>
      <LoginForm />
    </Suspense>
  );
}
