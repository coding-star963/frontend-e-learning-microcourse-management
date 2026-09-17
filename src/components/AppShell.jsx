import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  DashboardIcon,
  CoursesIcon,
  LessonsIcon,
  CategoriesIcon,
  EnrollmentsIcon,
  ProgressIcon,
  AnnouncementsIcon,
  UsersIcon,
  ProfileIcon,
  LogoutIcon,
  ShieldCheckIcon,
} from './Icons';
import { getStorageUrl } from '../utils/imageUrl';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/courses', label: 'Courses', icon: CoursesIcon },
  { to: '/lessons', label: 'Lessons', icon: LessonsIcon },
  { to: '/categories', label: 'Categories', icon: CategoriesIcon },
  { to: '/enrollments', label: 'Enrollments', icon: EnrollmentsIcon },
  { to: '/progress/students', label: 'Student Progress', icon: ProgressIcon },
  { to: '/announcements', label: 'Announcements', icon: AnnouncementsIcon },
  { to: '/users', label: 'Staff & Users', icon: UsersIcon, adminOnly: true },
  { to: '/profile', label: 'My Account', icon: ProfileIcon },
];

export default function AppShell({ title, eyebrow, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'administrator'
  );

  return (
    <div className="min-h-screen bg-slate-900/5 antialiased selection:bg-teal-500 selection:text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-800/80 bg-[#0c1222] text-slate-200 lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/60">
            <Link to="/dashboard" className="flex items-center gap-3.5 group">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 text-white font-black text-lg shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="tracking-tighter">MC</span>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                    MicroLearn
                  </span>
                  <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-400 ring-1 ring-teal-500/30">
                    Staff
                  </span>
                </div>
                <p className="text-xs text-slate-400 tracking-wide font-medium">
                  {user?.role === 'administrator' ? 'Admin Portal' : 'Teacher Workspace'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Management Portal
            </div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-transparent text-teal-300 shadow-sm shadow-teal-950/20 ring-1 ring-teal-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                            : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Profile / Quick Info */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-md shadow-indigo-900/30 overflow-hidden">
                  {user?.profile_photo ? (
                    <img
                      src={getStorageUrl(user.profile_photo)}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
                <div className="min-w-0 truncate">
                  <p className="truncate text-sm font-semibold text-slate-100">{user?.name}</p>
                  <p className="truncate text-xs font-medium text-teal-400">
                    {user?.role === 'administrator' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                title="Sign out"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 min-h-screen">
          {/* Modern Glass Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
              {/* Eyebrow & Title */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-600/20">
                    <ShieldCheckIcon className="h-3 w-3" />
                    {eyebrow || 'Console'}
                  </span>
                  <span className="hidden sm:inline-block text-slate-300">/</span>
                  <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
                    Microcourse Admin
                  </span>
                </div>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {title}
                </h1>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-600/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-800">System Live</span>
                </div>

                {/* Mobile menu toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Desktop Sign Out Button */}
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <LogoutIcon className="h-4 w-4 text-slate-500" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Nav Menu Dropdown */}
            {mobileMenuOpen && (
              <nav className="border-t border-slate-200 bg-slate-900 px-4 py-3 space-y-1 lg:hidden">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                          isActive
                            ? 'bg-teal-500 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            )}
          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-500/20">
                <LogoutIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sign Out of Admin Portal?</h3>
                <p className="text-xs text-slate-500">Your current session will end securely.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to end your session? You will need your staff credentials to log in again.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-rose-600/30 transition hover:bg-rose-700 disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing out...
                  </>
                ) : (
                  'Confirm Sign Out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
