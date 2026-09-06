"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "../lib/adminAuth";

const tabs = [
  { href: "/admin/events", label: "Events", exact: true },
  { href: "/admin/blogs", label: "Blog" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/internship-diaries", label: "Internship" },
  { href: "/admin/queries", label: "Queries" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    logoutAdmin();
    router.replace("/admin/login");
  };

  return (
    <div className="flex gap-2 mb-8 flex-wrap items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-200 ${isActive
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "bg-white border border-amber-300/80 text-slate-900 hover:bg-amber-100/60 hover:text-amber-950 shadow-sm"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 rounded-xl font-extrabold bg-rose-100 border border-rose-200 text-sm text-rose-800 hover:bg-rose-200 shadow-sm transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
