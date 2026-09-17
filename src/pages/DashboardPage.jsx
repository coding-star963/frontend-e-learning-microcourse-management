import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import {
  CoursesIcon,
  EnrollmentsIcon,
  ProgressIcon,
  UsersIcon,
  AnnouncementsIcon,
  PlusIcon,
  SparklesIcon,
} from '../components/Icons';
import { getStorageUrl } from '../utils/imageUrl';

const statusBadge = {
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  archived: 'bg-slate-100 text-slate-600 ring-slate-400/20',
};

const enrollmentBadge = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  suspended: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

const announcementBadge = {
  general: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  course_update: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  important: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <AppShell title="Executive Overview" eyebrow="Analytics">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading platform metrics...</p>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Executive Overview" eyebrow="Analytics">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-medium text-rose-700">
          Failed to load dashboard metrics. Please refresh or verify server connection.
        </div>
      </AppShell>
    );
  }

  const isAdmin = data.role === 'administrator';

  return (
    <AppShell title="Executive Overview" eyebrow="Analytics">
      <div className="space-y-8 pb-10">
        {/* Hero Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 ring-1 ring-white/10">
          {/* Subtle decorative glow shapes */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Staff Operations Console
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {user?.role === 'administrator' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-white">
                Welcome back, {user?.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {isAdmin
                  ? 'Complete control over your microcourse catalog, teachers, students, enrollments, and global announcements.'
                  : 'Monitor your course delivery, student milestones, completion rates, and lesson announcements.'}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:brightness-110 hover:shadow-teal-500/40"
              >
                <PlusIcon className="h-4 w-4" />
                New Course
              </Link>
              <Link
                to="/enrollments"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <EnrollmentsIcon className="h-4 w-4" />
                Enrollments
              </Link>
              {isAdmin && (
                <Link
                  to="/users"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <UsersIcon className="h-4 w-4" />
                  Staff & Users
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* KPI Metrics Cards */}
        {isAdmin ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Metric 1: Total Users */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Users</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                  <UsersIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {data.summary.total_users}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                  {data.summary.total_students} Learners
                </span>
                <span>&bull;</span>
                <span className="text-slate-600">{data.summary.total_teachers} Teachers</span>
              </div>
            </div>

            {/* Metric 2: Total Courses */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Micro-Courses</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                  <CoursesIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {data.summary.total_courses}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                  {data.summary.published_courses} Published
                </span>
                <span>&bull;</span>
                <span className="text-slate-600">{data.summary.draft_courses} Drafts</span>
              </div>
            </div>

            {/* Metric 3: Total Enrollments */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrollments</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                  <EnrollmentsIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-teal-600">
                {data.summary.total_enrollments}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 font-bold text-teal-700">
                  {data.summary.active_enrollments} Active
                </span>
                <span>&bull;</span>
                <span className="text-slate-600">{data.summary.completed_enrollments} Completed</span>
              </div>
            </div>

            {/* Metric 4: Average Progress */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Progress</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-500/20">
                  <ProgressIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-cyan-600">
                {data.summary.average_progress}%
              </p>
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.min(data.summary.average_progress || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Teacher KPI 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My Courses</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                  <CoursesIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {data.summary.total_courses}
              </p>
              <div className="mt-3 text-xs font-medium text-slate-500">
                <span className="font-bold text-emerald-600">{data.summary.published_courses} Published</span>
                {' '}&bull; {data.summary.draft_courses} Drafts
              </div>
            </div>

            {/* Teacher KPI 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My Students</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                  <UsersIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {data.summary.total_students}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">Enrolled across all courses</p>
            </div>

            {/* Teacher KPI 3 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrollments</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                  <EnrollmentsIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-teal-600">
                {data.summary.total_enrollments}
              </p>
              <div className="mt-3 text-xs font-medium text-slate-500">
                <span className="font-bold text-teal-600">{data.summary.active_enrollments} Active</span>
              </div>
            </div>

            {/* Teacher KPI 4 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Progress</p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-500/20">
                  <ProgressIcon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-cyan-600">
                {data.summary.average_progress}%
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {data.summary.total_lessons} Total lessons delivered
              </p>
            </div>
          </section>
        )}

        {/* Analytics Distribution Cards */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Course Status Distribution */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Course Portfolio</h3>
                <p className="text-xs text-slate-500">Status distribution across micro-courses</p>
              </div>
              <Link
                to="/courses"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
              >
                View Catalog &rarr;
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-emerald-50/60 p-4 ring-1 ring-emerald-500/10">
                <p className="text-2xl font-black text-emerald-600">{data.summary.published_courses}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-800">Published</p>
              </div>
              <div className="rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-500/10">
                <p className="text-2xl font-black text-amber-600">{data.summary.draft_courses}</p>
                <p className="mt-1 text-xs font-semibold text-amber-800">Drafts</p>
              </div>
              <div className="rounded-xl bg-slate-100/60 p-4 ring-1 ring-slate-400/10">
                <p className="text-2xl font-black text-slate-500">
                  {isAdmin ? data.summary.archived_courses : 0}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">Archived</p>
              </div>
            </div>
          </div>

          {/* Enrollment Lifecycle Distribution */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enrollment Lifecycle</h3>
                <p className="text-xs text-slate-500">Student active and completion stages</p>
              </div>
              <Link
                to="/enrollments"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Manage Enrollments &rarr;
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-teal-50/60 p-4 ring-1 ring-teal-500/10">
                <p className="text-2xl font-black text-teal-600">{data.summary.active_enrollments}</p>
                <p className="mt-1 text-xs font-semibold text-teal-800">Active</p>
              </div>
              <div className="rounded-xl bg-blue-50/60 p-4 ring-1 ring-blue-500/10">
                <p className="text-2xl font-black text-blue-600">{data.summary.completed_enrollments}</p>
                <p className="mt-1 text-xs font-semibold text-blue-800">Completed</p>
              </div>
              <div className="rounded-xl bg-slate-100/60 p-4 ring-1 ring-slate-400/10">
                <p className="text-2xl font-black text-slate-500">
                  {Math.max(
                    0,
                    data.summary.total_enrollments -
                      data.summary.active_enrollments -
                      data.summary.completed_enrollments
                  )}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">Other</p>
              </div>
            </div>
          </div>
        </section>

        {/* Split Grid: Recent Courses & Announcements */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Recent Courses */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Courses</h3>
                <p className="text-xs text-slate-500">Recently created or updated micro-learning modules</p>
              </div>
              <Link
                to="/courses"
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                All Courses
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recent_courses.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No courses registered yet.</div>
              ) : (
                data.recent_courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          {course.title}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                          {course.category}
                        </span>
                        {isAdmin && course.teacher && (
                          <>
                            <span>&bull;</span>
                            <span>Instructor: {course.teacher}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                        statusBadge[course.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-500/20">
                  <AnnouncementsIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Announcements</h3>
                  <p className="text-xs text-slate-500">Live platform bulletins & alerts</p>
                </div>
              </div>
              <Link
                to="/announcements"
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Manage
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recent_announcements.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No recent announcements.</div>
              ) : (
                data.recent_announcements.map((a) => (
                  <div key={a.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{a.title}</h4>
                      <span
                        className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                          announcementBadge[a.type] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {a.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                      <span>Posted by {a.author || a.user?.name || 'Staff'}</span>
                      <span>&bull;</span>
                      <span>
                        {a.published_at
                          ? new Date(a.published_at).toLocaleDateString()
                          : new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recent Enrollments Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Enrollments</h3>
              <p className="text-xs text-slate-500">Latest students participating in micro-courses</p>
            </div>
            <Link
              to="/enrollments"
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              All Enrollments
            </Link>
          </div>
          <div className="overflow-x-auto">
            {data.recent_enrollments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No enrollments recorded yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Course
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Progress
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent_enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {e.profile_photo ? (
                            <img
                              src={getStorageUrl(e.profile_photo)}
                              alt={e.student}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 text-xs shadow-sm ring-1 ring-teal-200">
                              {e.student?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900">{e.student}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{e.course}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                            enrollmentBadge[e.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-500"
                              style={{ width: `${Math.min(e.progress || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
