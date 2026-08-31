import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active microcourses', value: '12', detail: '4 ready to publish' },
    { label: 'Learners enrolled', value: '248', detail: '32 joined this week' },
    { label: 'Completion rate', value: '86%', detail: 'Across all courses' },
  ];

  const courses = [
    { title: 'Onboarding Essentials', status: 'Published', progress: 92 },
    { title: 'Digital Safety Basics', status: 'Draft', progress: 64 },
    { title: 'Teaching with Micro-lessons', status: 'Review', progress: 78 },
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
                Review course activity, learner progress, and account details from this workspace.
              </p>
            </div>
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-wider text-slate-400">Current role</p>
              <p className="mt-1 text-sm font-semibold capitalize">{user?.role}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
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
              <h2 className="text-lg font-bold text-slate-950">Course workspace</h2>
              <p className="mt-1 text-sm text-slate-600">Quick view of microcourse publishing progress.</p>
            </div>
            <div className="divide-y divide-slate-200">
              {courses.map((course) => (
                <div key={course.title} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{course.status}</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Account details</h2>
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
