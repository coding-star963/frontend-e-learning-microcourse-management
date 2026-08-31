export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-slate-950">
              EL
            </div>
            <div>
              <p className="text-sm font-semibold">Microcourse</p>
              <p className="text-xs text-slate-400">Learning manager</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
              E-learning workspace
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Manage focused lessons, learners, and progress in one place.
            </h1>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Courses', 'Learners', 'Reports'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold">{item}</p>
                  <p className="mt-1 text-xs text-slate-400">Organized tools</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-400">Secure access for administrators and teachers.</p>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                EL
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Microcourse</p>
                <p className="text-xs text-slate-500">Learning manager</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
                {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
