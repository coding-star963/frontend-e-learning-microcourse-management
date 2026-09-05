import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { enrollmentService } from '../services/enrollmentService';
import api from '../services/api';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

export default function StudentEnrollmentsPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (statusFilter) params.status = statusFilter;

        const [studentRes, enrollmentsRes] = await Promise.all([
          api.get(`/users/${id}`),
          enrollmentService.getStudentEnrollments(id, params),
        ]);

        setStudent(studentRes.data.data);
        setEnrollments(enrollmentsRes.data.data);
        setPagination(enrollmentsRes.data.meta);
      } catch {
        setError('Failed to load student data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, statusFilter, page]);

  if (loading && !student) {
    return (
      <AppShell title="Student Enrollments" eyebrow="Enrollment Management">
        <div className="text-center text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;

  return (
    <AppShell title={student ? `Enrollments - ${student.name}` : 'Student Enrollments'} eyebrow="Enrollment Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <Link to="/users" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to users
          </Link>
        </div>

        {student && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                {student.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">{student.name}</h2>
                <p className="text-sm text-slate-500">{student.email}</p>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{enrollments.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Courses</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{completedCount}</p>
          </div>
        </section>

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
            <div className="divide-y divide-slate-200">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/courses/${enrollment.course?.slug}`}
                      className="font-semibold text-slate-950 hover:text-teal-600"
                    >
                      {enrollment.course?.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[enrollment.status]}`}>
                        {enrollment.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {enrollment.course?.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-slate-400">
                        by {enrollment.course?.teacher?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600">{enrollment.progress}%</p>
                    </div>
                    <Link
                      to={`/enrollments/${enrollment.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
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
