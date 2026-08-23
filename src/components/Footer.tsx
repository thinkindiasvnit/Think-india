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
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">✉</span>
                <span>thinkindia@svnit.ac.in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">📍</span>
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
