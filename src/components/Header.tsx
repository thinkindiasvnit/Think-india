"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "BLOGS", href: "/blogs" },
    { name: "GALLERY", href: "/gallery" },
    { name: "INTERNSHIPS", href: "/internships" },
    { name: "TEAM / MEMBERS", href: "/team" },
    { name: "ABOUT US", href: "/about" },
    { name: "CONTACT US", href: "/contact" },
  ];

  return (
    <header className="w-full z-50">
      {/* Top Announcement Bar */}
      <div className="bg-amber-600 text-white text-center py-2 px-4 text-xs font-bold tracking-wide uppercase">
        Welcome to Think India SVNIT | Check out our latest events and apply directly.
      </div>

      {/* Main Header Container with Glassmorphism */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-amber-300/80 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Think India Logo"
                  className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tight text-slate-950 font-heading group-hover:text-amber-700 transition-colors">
                    THINK INDIA
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-amber-700 -mt-1">
                    SVNIT CHAPTER
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-extrabold tracking-wider transition-colors duration-200 hover:text-amber-700 ${
                      isActive
                        ? "text-amber-700 border-b-2 border-amber-600 py-1"
                        : "text-slate-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* User Profile / Dashboard Link */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold border transition-all duration-300 shadow-sm ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-600 border-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/20"
                    : "border-amber-300 bg-white text-slate-950 hover:bg-amber-100/60"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                Admin Panel
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {isOpen && (
          <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-semibold ${
                      isActive
                        ? "bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-500"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 mt-4 px-3 py-2 rounded-md text-base font-semibold bg-amber-600 text-white hover:bg-amber-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
