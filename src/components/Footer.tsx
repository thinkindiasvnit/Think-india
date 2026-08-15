import Link from "next/link";

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

          {/* Follow Us & Social Column */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white" aria-label="Instagram">
                Insta
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white" aria-label="LinkedIn">
                In
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white" aria-label="YouTube">
                YT
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white" aria-label="X">
                X
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white" aria-label="Facebook">
                FB
              </a>
            </div>
            <p className="text-xs text-zinc-500">
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
