import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/courseService';

const statusColors = {
  draft: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await courseService.getAll({ per_page: 100 });
        const allCourses = response.data.data;
        setCourses(allCourses.slice(0, 5));

        const published = allCourses.filter((c) => c.status === 'published').length;
        const draft = allCourses.filter((c) => c.status === 'draft').length;
        setStats({
          total: allCourses.length,
          published,
          draft,
        });
      } catch {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const displayStats = [
    { label: 'Total Courses', value: stats.total, detail: 'Across all categories' },
    { label: 'Published', value: stats.published, detail: 'Live courses' },
    { label: 'Drafts', value: stats.draft, detail: 'In progress' },
  ];

  return (
    <AppShell title="Dashboard" eyebrow="Overview">
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{user?.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review course activity and manage your micro-courses from this workspace.
              </p>
            </div>
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-wider text-slate-400">Current role</p>
              <p className="mt-1 text-sm font-semibold capitalize">{user?.role}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {displayStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Recent Courses</h2>
                  <p className="mt-1 text-sm text-slate-600">Your latest micro-courses.</p>
                </div>
                <Link
                  to="/courses"
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {loading ? (
                <div className="p-5 text-center text-sm text-slate-500">Loading...</div>
              ) : courses.length === 0 ? (
                <div className="p-5 text-center text-sm text-slate-500">
                  No courses yet. <Link to="/courses/create" className="text-teal-600 hover:underline">Create your first course</Link>.
                </div>
              ) : (
                courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-950">{course.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {course.category?.name || 'Uncategorized'} &middot; {course.teacher?.name || 'Unknown'}
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

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Account Details</h2>
            <dl className="mt-5 space-y-4">
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
        </section>
      </div>
    </AppShell>
  );
}
