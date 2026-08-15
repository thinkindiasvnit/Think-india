import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="max-w-3xl">
          <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-6 shadow-xl shadow-amber-500/20">
            TI
          </div>
          <span className="text-xs font-black tracking-widest text-amber-600 uppercase">
            Think India SVNIT Chapter
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            Empowering Youth, <br />
            <span className="text-amber-600">Inspiring Innovation</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-650 dark:text-zinc-400">
            A forum to bind the youth of India with nationalistic spirit and channelize their creative energies towards building a stronger nation through education, innovation, and leadership.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-base font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all duration-200"
            >
              Explore Events
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-base font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl font-bold mb-6">
              📅
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Events & Programs</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Participate in national hackathons, technical workshops, seminars, and social contribution activities organized on campus.
            </p>
            <Link href="/events" className="mt-4 inline-block text-sm font-bold text-amber-600 hover:underline">
              Browse Events →
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl font-bold mb-6">
              💼
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Internships</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Gain industrial exposure, work with national agencies, and access summer internship opportunities within the Think India network.
            </p>
            <span className="mt-4 inline-block text-sm font-bold text-zinc-400 cursor-not-allowed">
              Coming Soon
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl font-bold mb-6">
              👥
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Core Team</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Connect with SVNIT student leaders, mentors, and alumni coordinators working to drive positive change.
            </p>
            <span className="mt-4 inline-block text-sm font-bold text-zinc-400 cursor-not-allowed">
              Coming Soon
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
