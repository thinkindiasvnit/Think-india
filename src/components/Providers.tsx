"use client";

import { AuthProvider } from "./AuthProvider";
import type { ReactNode } from "react";

/**
 * Client-side providers wrapper.
 * Used in layout.tsx to wrap children with all client-side context providers
 * while keeping the root layout as a Server Component.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
