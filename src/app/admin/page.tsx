import { redirect } from "next/navigation";

/**
 * /admin root — redirects unauthenticated users to login.
 * After login, users land on /admin/events.
 */
export default function AdminRootPage() {
  redirect("/admin/login");
}
