"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const { user, loading, logOut } = useAuth();
  
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Blogs", href: "/blogs" },
    { name: "Articles", href: "/Article" },
    { name: "Gallery", href: "/gallery" },
    { name: "Internships", href: "/internships" },
    { name: "Team", href: "/team" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // GSAP animation for opening/closing the menu
  useEffect(() => {
    if (isOpen) {
      // Slide the overlay down
      gsap.to(overlayRef.current, {
        duration: 0.8,
        y: "0%",
        ease: "power4.inOut",
      });
      // Stagger the menu links in
      gsap.fromTo(
        ".menu-link-item",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power4.out", delay: 0.2 }
      );
    } else {
      // Slide the overlay up
      gsap.to(overlayRef.current, {
        duration: 0.7,
        y: "-100%",
        ease: "power4.inOut",
      });
    }
  }, [isOpen]);

  // Premium hover animation splitting text and staggering opacity/blur
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const chars = e.currentTarget.querySelectorAll('.char');
    gsap.killTweensOf(chars);
    gsap.fromTo(chars, 
      { opacity: 1, filter: "blur(0px)" },
      {
        opacity: 0.3,
        filter: "blur(4px)",
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      }
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-6 sm:p-10 flex items-center justify-between pointer-events-none">
        {/* Floating Logo Component */}
        <Link 
          href="/" 
          className="pointer-events-auto flex items-center gap-4 group"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm" />
          </div>
          <span className={`font-black tracking-[0.2em] text-base sm:text-lg hidden sm:block ${isOpen ? 'text-zinc-900' : 'text-zinc-900'} transition-colors duration-700 font-heading`}>
            THINK INDIA
          </span>
        </Link>

        {!loading && user && (
          <button
            onClick={() => { void logOut(); setIsOpen(false); }}
            className="pointer-events-auto absolute right-40 sm:right-48 px-4 py-3 rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-300 font-bold tracking-widest text-xs uppercase"
          >
            Log out
          </button>
        )}

        {/* Floating Menu Button Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 font-bold tracking-widest text-xs uppercase shadow-sm ${
            isOpen 
              ? "bg-transparent border-zinc-900 text-zinc-900 hover:bg-zinc-900/5" 
              : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          <span>MENU</span>
          <span className="text-xl font-normal leading-none -mt-0.5">{isOpen ? "×" : "="}</span>
        </button>
      </header>

      {/* Full Screen Overlay Menu */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-orange-50 z-40 flex flex-col pt-20 sm:pt-28 pb-4 sm:pb-8 px-8 sm:px-24 overflow-hidden"
        style={{ transform: "translateY(-100%)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/20 to-transparent pointer-events-none" />
        
        <nav className="flex flex-col max-w-4xl relative z-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={handleMouseEnter}
                className="menu-link-item text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tighter text-orange-950 flex font-heading w-fit group py-1"
              >
                {link.name.split('').map((char, index) => (
                  <span key={index} className="char inline-block transition-transform duration-500 group-hover:translate-x-2">{char}</span>
                ))}
                {isActive && <span className="text-amber-600 ml-4 hidden sm:inline-block">•</span>}
              </Link>
            );
          })}
          <Link
            href="/submit-article"
            onClick={() => setIsOpen(false)}
            className="menu-link-item text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tighter text-amber-700 flex font-heading w-fit group py-1"
          >
            Write an Article
          </Link>
        </nav>

        {/* Premium Bottom Details Section */}
        <div className="mt-auto text-orange-950 flex flex-col sm:flex-row gap-6 sm:gap-24 relative z-10 pt-8 border-t border-amber-900/10 shrink-0">
          <div>
            <p className="text-xs tracking-widest uppercase font-black text-amber-700 mb-2 font-heading">Business Enquiry</p>
            <div className="flex flex-col gap-1">
              <p className="text-sm sm:text-base font-medium tracking-wide"><span className="font-black text-amber-700 mr-2">Email:</span> hello@thinkindia.org</p>
              <p className="text-sm sm:text-base font-medium tracking-wide"><span className="font-black text-amber-700 mr-2">Phone:</span> +91 98241 82099</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs tracking-widest uppercase font-black text-amber-700 mb-2 font-heading">Location</p>
            <p className="text-sm sm:text-base font-medium tracking-wide max-w-xs leading-relaxed">
              SVNIT Campus, Ichchhanath<br/>
              Surat, Gujarat 395007
            </p>
          </div>
          {!loading && (
            <div className="sm:ml-auto flex flex-col items-start gap-2">
              {user ? (
                <>
                  <p className="text-sm font-bold">Signed in as {user.displayName || user.email}</p>
                  <button onClick={() => { void logOut(); setIsOpen(false); }} className="text-xs tracking-widest uppercase font-black text-amber-700 hover:text-amber-900">Sign out</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-xs tracking-widest uppercase font-black text-amber-700 hover:text-amber-900">Sign in to write</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
