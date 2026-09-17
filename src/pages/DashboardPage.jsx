import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';

const statusColors = {
  draft: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600',
};

const enrollmentStatusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

const announcementTypeColors = {
  general: 'bg-slate-100 text-slate-700',
  course_update: 'bg-blue-50 text-blue-700',
  important: 'bg-rose-50 text-rose-700',
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
      <AppShell title="Dashboard" eyebrow="Overview">
        <div className="text-center text-sm text-slate-500">Loading dashboard...</div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Dashboard" eyebrow="Overview">
        <div className="text-center text-sm text-slate-500">Failed to load dashboard.</div>
      </AppShell>
    );
  }

  const isAdmin = data.role === 'administrator';

  return (
    <AppShell title="Dashboard" eyebrow="Overview">
      <div className="space-y-6">
        {/* Welcome */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{user?.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {isAdmin
                  ? 'Manage users, courses, enrollments, and announcements from this workspace.'
                  : 'Monitor your courses, student enrollments, and announcements from this workspace.'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-wider text-slate-400">Current role</p>
              <p className="mt-1 text-sm font-semibold capitalize">{user?.role}</p>
            </div>
          </div>
        </section>

        {/* Admin Stats */}
        {isAdmin && (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{data.summary.total_users}</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.total_students} students, {data.summary.total_teachers} teachers</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Courses</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{data.summary.total_courses}</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.published_courses} published</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Enrollments</p>
              <p className="mt-2 text-2xl font-bold text-teal-600">{data.summary.total_enrollments}</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.active_enrollments} active</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg Progress</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{data.summary.average_progress}%</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.completed_enrollments} completed</p>
            </div>
          </section>
        )}

        {/* Teacher Stats */}
        {!isAdmin && (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">My Courses</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{data.summary.total_courses}</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.published_courses} published</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{data.summary.total_students}</p>
              <p className="mt-1 text-xs text-slate-400">across all courses</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Enrollments</p>
              <p className="mt-2 text-2xl font-bold text-teal-600">{data.summary.total_enrollments}</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.active_enrollments} active</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg Progress</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{data.summary.average_progress}%</p>
              <p className="mt-1 text-xs text-slate-400">{data.summary.total_lessons} lessons</p>
            </div>
          </section>
        )}

        {/* Course Summary + Enrollment Summary */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Course Summary */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Course Summary</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {isAdmin ? 'All courses across the platform.' : 'Your courses.'}
                  </p>
                </div>
                <Link to="/courses" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.summary.published_courses}</p>
                  <p className="text-xs text-slate-500">Published</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{data.summary.draft_courses}</p>
                  <p className="text-xs text-slate-500">Drafts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-400">{isAdmin ? data.summary.archived_courses : 0}</p>
                  <p className="text-xs text-slate-500">Archived</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Summary */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Enrollment Summary</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {isAdmin ? 'All enrollments across the platform.' : 'Enrollments in your courses.'}
                  </p>
                </div>
                <Link to="/enrollments" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{data.summary.active_enrollments}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{data.summary.completed_enrollments}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-400">{data.summary.total_enrollments - data.summary.active_enrollments - data.summary.completed_enrollments}</p>
                  <p className="text-xs text-slate-500">Other</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent + Announcements */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Recent Courses */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">Recent Courses</h2>
                <Link to="/courses" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {data.recent_courses.length === 0 ? (
                <div className="p-5 text-center text-sm text-slate-500">No courses yet.</div>
              ) : (
                data.recent_courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-950">{course.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {course.category} {isAdmin ? ` \u00b7 ${course.teacher}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[course.status]}`}>
                        {course.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">Announcements</h2>
                <Link to="/announcements" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {data.recent_announcements.length === 0 ? (
                <div className="p-5 text-center text-sm text-slate-500">No announcements.</div>
              ) : (
                data.recent_announcements.map((a) => (
                  <div key={a.id} className="p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-950">{a.title}</h3>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${announcementTypeColors[a.type]}`}>
                        {a.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      by {a.author || a.user?.name} &middot;{' '}
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString()
                        : new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recent Enrollments */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">Recent Enrollments</h2>
              <Link to="/enrollments" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                View all
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {data.recent_enrollments.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">No enrollments yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-slate-600">Student</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Course</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Progress</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.recent_enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-950">{e.student}</td>
                      <td className="px-5 py-3 text-slate-600">{e.course}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${enrollmentStatusColors[e.status]}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-600" style={{ width: `${e.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Account Details</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Member since</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unavailable'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Access level</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-slate-950">{user?.role}</dd>
            </div>
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
