import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

export default function CourseEnrollmentsPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (statusFilter) params.status = statusFilter;

        const [courseRes, enrollmentsRes, statsRes] = await Promise.all([
          courseService.getById(slug),
          enrollmentService.getCourseEnrollments(slug, params),
          enrollmentService.getCourseStats(slug),
        ]);

        setCourse(courseRes.data.data);
        setEnrollments(enrollmentsRes.data.data);
        setPagination(enrollmentsRes.data.meta);
        setStats(statsRes.data);
      } catch {
        setError('Failed to load enrollment data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, statusFilter, reloadKey, page]);

  const handleAction = async (action, id) => {
    setError('');
    setSuccess('');
    try {
      let status;
      switch (action) {
        case 'complete': status = 'completed'; break;
        case 'cancel': status = 'cancelled'; break;
        case 'suspend': status = 'suspended'; break;
        case 'activate': status = 'active'; break;
      }

      const response = await enrollmentService.update(id, { status });
      setSuccess(response.data.message);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} enrollment.`);
    }
  };

  if (loading && !course) {
    return (
      <AppShell title="Course Enrollments" eyebrow="Enrollment Management">
        <div className="text-center text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={course ? `Enrollments - ${course.title}` : 'Course Enrollments'} eyebrow="Enrollment Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div>
          <Link to={`/courses/${slug}`} className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to course
          </Link>
        </div>

        {stats && (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.active}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg Progress</p>
              <p className="mt-2 text-2xl font-bold text-teal-600">{stats.average_progress}%</p>
            </div>
          </section>
        )}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No enrollments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Student</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Progress</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Enrolled</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">{enrollment.user?.name}</p>
                        <p className="text-xs text-slate-500">{enrollment.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColors[enrollment.status]}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-600" style={{ width: `${enrollment.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{enrollment.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/enrollments/${enrollment.id}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            View
                          </Link>
                          {enrollment.status === 'active' && (
                            <button
                              onClick={() => handleAction('complete', enrollment.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              Complete
                            </button>
                          )}
                          {(enrollment.status === 'cancelled' || enrollment.status === 'suspended') && (
                            <button
                              onClick={() => handleAction('activate', enrollment.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Showing {pagination.from} to {pagination.to} of {pagination.total}
              </p>
              <div className="flex gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      p === pagination.current_page
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
