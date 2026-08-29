"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, loading, isAdmin, signIn, signOut } = useAuth();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "EVENTS", href: "/events" },
    { name: "BLOGS", href: "/blogs" },
    { name: "ARTICLES", href: "/articles" },
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
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-amber-300 border-t-transparent animate-spin"></div>
              ) : isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300 bg-white hover:bg-amber-50 transition-colors shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.photoURL || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      {user.displayName.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-amber-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
                      <div className="px-4 py-2 border-b border-amber-100 mb-1 bg-amber-50/50">
                        <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs font-medium text-amber-700">{user.collegeEmail}</p>
                      </div>
                      
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/articles/my"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                      >
                        My Articles
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold border bg-amber-600 border-amber-600 text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 bg-white rounded-full p-0.5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign In (SVNIT)
                </button>
              )}
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
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-3 mt-4 border-t border-zinc-200 dark:border-zinc-700 bg-amber-50/50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.photoURL || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-500">{user.collegeEmail}</p>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 mt-2 rounded-md text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/articles/my"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 mt-2 rounded-md text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800"
                  >
                    My Articles
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3 py-2 mt-2 rounded-md text-base font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signIn();
                  }}
                  className="flex items-center gap-2 mt-4 px-3 py-2 w-full rounded-md text-base font-semibold bg-amber-600 text-white hover:bg-amber-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 bg-white rounded-full p-1">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign In (SVNIT)
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
