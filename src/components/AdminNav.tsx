"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "📅 Events", exact: true },
  { href: "/admin/team", label: "👥 Team" },
  { href: "/admin/gallery", label: "🖼️ Gallery" },
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
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              isActive
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                : "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
