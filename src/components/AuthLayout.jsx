export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-slate-950 font-sans antialiased selection:bg-teal-500 selection:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        {/* Left Branding Showcase Column */}
        <section className="relative hidden bg-[#0b1120] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden border-r border-slate-800/80">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

          {/* Logo & Brand */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-400 to-cyan-300 font-black text-slate-950 text-xl shadow-lg shadow-teal-500/30">
              MC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">MicroLearn</span>
                <span className="rounded-full bg-teal-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-400/30">
                  Staff Console
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Learning Management</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-500/30 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Administrative Workspace
            </div>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              Precision microcourses delivered at scale.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Curate bite-sized lessons, track student milestones, manage instructors, and analyze learning performance all within one unified staff console.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Modules</p>
                <p className="mt-1 text-sm font-bold text-white">Micro-Lessons</p>
                <p className="mt-1 text-[11px] text-slate-400">Modular curriculum</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Audience</p>
                <p className="mt-1 text-sm font-bold text-white">Students & Mobile</p>
                <p className="mt-1 text-[11px] text-slate-400">Synced to Flutter app</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Reports</p>
                <p className="mt-1 text-sm font-bold text-white">Live Insights</p>
                <p className="mt-1 text-[11px] text-slate-400">Progress analytics</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Authorized access only &bull; End-to-end token authenticated</span>
          </div>
        </section>

        {/* Right Form Card Column */}
        <section className="flex items-center justify-center bg-slate-900/40 px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 font-bold text-slate-950">
                MC
              </div>
              <div>
                <p className="text-base font-bold text-white">MicroLearn</p>
                <p className="text-xs text-slate-400">Staff Console</p>
              </div>
            </div>

            {/* Main Auth Card */}
            <div className="rounded-3xl border border-slate-200/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 sm:p-10">
              <div>
                <span className="inline-flex rounded-full bg-teal-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-400/30">
                  Staff Access
                </span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{subtitle}</p>
                )}
              </div>
              {children}
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Students: Please log in through the mobile app to continue learning.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
