"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/events", label: "Events", exact: true },
  { href: "/admin/blogs", label: "Blog" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/gallery", label: "Gallery" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 mb-8 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              isActive
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-white border border-amber-300/80 text-slate-900 hover:bg-amber-100/60 hover:text-amber-950 shadow-sm"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
