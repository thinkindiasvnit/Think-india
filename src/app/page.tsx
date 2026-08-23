import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-glow-radial-light bg-amber-grid-pattern-light text-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-amber-200/60">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="card-orange-glass-light rounded-3xl border border-amber-300 shadow-2xl p-8 sm:p-14 text-center bg-white/95 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-600/30 p-2">
              <Image
                src="/logo.png"
                alt="Think India Logo"
                width={56}
                height={56}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-widest mb-4 shadow-sm font-heading">
              Think India SVNIT Chapter
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 font-heading leading-tight">
              Empowering Youth, <br />
              <span className="text-amber-700">Inspiring Innovation</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-800 font-medium max-w-2xl mx-auto">
              A forum to bind the youth of India with nationalistic spirit and channelize creative energies towards building a stronger nation through education, innovation, and leadership.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/events"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 transition-all duration-200"
              >
                Explore Events & Conclaves
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-extrabold border border-amber-300 bg-white text-slate-900 hover:bg-amber-100/60 shadow-sm transition-all duration-200"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="card-orange-glass-light bg-white/95 p-8 rounded-3xl border border-amber-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-3 font-heading">Events & Programs</h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                Participate in national hackathons, technical workshops, seminars, and social contribution activities organized on campus.
              </p>
            </div>
            <Link href="/events" className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-amber-700 hover:text-amber-800 hover:underline">
              Browse Events →
            </Link>
          </div>

          {/* Card 2 */}
          <div className="card-orange-glass-light bg-white/95 p-8 rounded-3xl border border-amber-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v1.069m7.5 0c.969.06 1.933.155 2.885.284m-13.27 0C6.302 6.474 7.266 6.379 8.235 6.319" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-3 font-heading">Blogs & Insights</h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                Read articles, youth opinions, and research highlights published by members of the Think India network.
              </p>
            </div>
            <Link href="/blogs" className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-amber-700 hover:text-amber-800 hover:underline">
              Read Blogs →
            </Link>
          </div>

          {/* Card 3 */}
          <div className="card-orange-glass-light bg-white/95 p-8 rounded-3xl border border-amber-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-3 font-heading">Core Team</h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                Connect with SVNIT student leaders, mentors, and alumni coordinators working to drive positive change.
              </p>
            </div>
            <Link href="/team" className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-amber-700 hover:text-amber-800 hover:underline">
              Meet Our Team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
