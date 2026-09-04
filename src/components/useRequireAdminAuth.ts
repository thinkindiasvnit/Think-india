"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession, AdminUser } from "../lib/adminAuth";

/**
 * Use this hook at the top of every admin page (except /admin/login).
 * It immediately redirects to /admin/login if there is no active session.
 * Returns the current admin user (or null while redirecting).
 */
export function useRequireAdminAuth(): AdminUser | null {
  const router = useRouter();
  const session = getAdminSession();

  useEffect(() => {
    if (!session) {
      router.replace("/admin/login");
    }
  }, [session, router]);

  return session;
}
