import Link from "next/link";


function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
              <li><Link href="/events" className="hover:text-amber-500 transition-colors">Events</Link></li>
              <li><Link href="/blogs" className="hover:text-amber-500 transition-colors">Blogs</Link></li>
              <li><Link href="/internships" className="hover:text-amber-500 transition-colors">Internships</Link></li>
              <li><Link href="/gallery" className="hover:text-amber-500 transition-colors">Gallery</Link></li>
              <li><Link href="/team" className="hover:text-amber-500 transition-colors">Team / Members</Link></li>
              <li><Link href="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* ── FOLLOW US Section in Footer ── */}
<div className="flex flex-col">
  <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
    FOLLOW US
  </h4>
  
  {/* Replace your old text spans/buttons with this */}
  <div className="flex items-center gap-3">
    <a 
      href="https://instagram.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-700 transition-colors" 
      aria-label="Instagram"
    >
      <InstagramIcon />
    </a>
    
    <a 
      href="https://linkedin.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-700 transition-colors" 
      aria-label="LinkedIn"
    >
      <LinkedInIcon />
    </a>
    
    <a 
      href="https://youtube.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-700 transition-colors" 
      aria-label="YouTube"
    >
      <YouTubeIcon />
    </a>
    
    <a 
      href="https://twitter.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-700 transition-colors" 
      aria-label="X (Twitter)"
    >
      <TwitterXIcon />
    </a>
    
    <a 
      href="https://facebook.com" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-500 hover:bg-zinc-700 transition-colors" 
      aria-label="Facebook"
    >
      <FacebookIcon />
    </a>
  </div>

  <p className="text-xs text-zinc-500 mt-4 max-w-xs leading-relaxed">
    Stay connected with us on social media for regular updates and announcements.
  </p>
</div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">✉</span>
                <span>thinkindia@svnit.ac.in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">📍</span>
                <span>SVNIT Campus, Ichchhanath, Surat, Gujarat - 395007</span>
              </li>
            </ul>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Join Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-zinc-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-[10px]">
              TI
            </div>
            <span className="font-bold text-zinc-400">THINK INDIA SVNIT</span>
          </div>
          <p>© {new Date().getFullYear()} Think India SVNIT. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
