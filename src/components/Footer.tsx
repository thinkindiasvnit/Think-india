import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-amber-50 via-amber-100/40 to-orange-100/50 text-slate-900 border-t border-amber-300/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links Column */}
          <div>
            <h3 className="text-slate-950 font-black text-sm tracking-wider uppercase mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2 text-xs font-bold text-slate-800">
              <li><Link href="/" className="hover:text-amber-700 transition-colors">Home</Link></li>
              <li><Link href="/events" className="hover:text-amber-700 transition-colors">Events & Conclaves</Link></li>
              <li><Link href="/blogs" className="hover:text-amber-700 transition-colors">Blogs & Articles</Link></li>
              <li><Link href="/internships" className="hover:text-amber-700 transition-colors">Internships</Link></li>
              <li><Link href="/gallery" className="hover:text-amber-700 transition-colors">Media Gallery</Link></li>
              <li><Link href="/team" className="hover:text-amber-700 transition-colors">Team & Members</Link></li>
              <li><Link href="/about" className="hover:text-amber-700 transition-colors">About Think India</Link></li>
              <li><Link href="/contact" className="hover:text-amber-700 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Follow Us & Social Column */}
          <div>
            <h3 className="text-slate-950 font-black text-sm tracking-wider uppercase mb-4 font-heading">Follow Us</h3>
            <div className="flex gap-2 mb-4">
              <a href="#" className="w-8 h-8 rounded-xl bg-white border border-amber-300 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors text-slate-900 font-bold text-xs shadow-sm" aria-label="Instagram">
                Insta
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white border border-amber-300 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors text-slate-900 font-bold text-xs shadow-sm" aria-label="LinkedIn">
                In
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white border border-amber-300 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors text-slate-900 font-bold text-xs shadow-sm" aria-label="YouTube">
                YT
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white border border-amber-300 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors text-slate-900 font-bold text-xs shadow-sm" aria-label="X">
                X
              </a>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Stay connected with us on social media for regular updates and announcements.
            </p>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-slate-950 font-black text-sm tracking-wider uppercase mb-4 font-heading">Contact Info</h3>
            <ul className="space-y-3 text-xs font-bold text-slate-800">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-700 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>thinkindia@svnit.ac.in</span>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-700 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.47-5.116-3.762-6.586-6.586l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>SVNIT Campus, Ichchhanath, Surat, Gujarat - 395007</span>
              </li>
            </ul>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="text-slate-950 font-black text-sm tracking-wider uppercase mb-4 font-heading">Useful Links</h3>
            <ul className="space-y-2 text-xs font-bold text-slate-800">
              <li><a href="#" className="hover:text-amber-700 transition-colors">Join Us</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-amber-700 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-amber-300 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Think India Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
            <span className="font-extrabold text-slate-950 font-heading">THINK INDIA SVNIT</span>
          </div>
          <p>© {new Date().getFullYear()} Think India SVNIT. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
