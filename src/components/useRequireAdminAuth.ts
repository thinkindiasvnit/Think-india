"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession, AdminUser } from "../lib/adminAuth";

/**
 * Use this hook at the top of every admin page (except /admin/login).
 * It immediately redirects to /admin/login if there is no active session.
 * Returns the current admin user (or null while redirecting).
 */
export function useRequireAdminAuth(): AdminUser | null {
  const router = useRouter();
  // sessionStorage only exists in the browser. Reading it during initial render
  // makes the server render differ from the hydrated client render.
  const [session, setSession] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedSession = getAdminSession();
    if (!storedSession) {
      router.replace("/admin/login");
      return;
    }
    setSession(storedSession);
  }, [router]);

  return session;
}
