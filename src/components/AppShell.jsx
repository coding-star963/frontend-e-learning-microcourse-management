import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/courses', label: 'Courses', icon: 'C' },
  { to: '/lessons', label: 'Lessons', icon: 'L' },
  { to: '/categories', label: 'Categories', icon: 'G' },
  { to: '/enrollments', label: 'Enrollments', icon: 'E' },
  { to: '/progress/students', label: 'Progress', icon: 'P' },
  { to: '/announcements', label: 'Announcements', icon: 'A' },
  { to: '/users', label: 'Users', icon: 'U', adminOnly: true },
  { to: '/profile', label: 'Profile', icon: 'P' },
];

export default function AppShell({ title, eyebrow, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
              EL
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Microcourse</p>
              <p className="text-xs text-slate-500">Learning manager</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || user?.role === 'administrator')
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-current/15 text-xs">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  {eyebrow}
                </p>
                <h1 className="mt-1 truncate text-xl font-bold text-slate-950 sm:text-2xl">
                  {title}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-950">{user?.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user?.role}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-200 px-4 py-2 sm:px-6 lg:hidden">
              {navItems
                .filter((item) => !item.adminOnly || user?.role === 'administrator')
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium',
                        isActive ? 'bg-teal-600 text-white' : 'text-slate-600',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => !loggingOut && setShowLogoutModal(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-950">Confirm Logout</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to log out? You will need to sign in again to access your account.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {loggingOut ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging out...
                  </span>
                ) : (
                  'Log out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
