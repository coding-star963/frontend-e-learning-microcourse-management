import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { enrollmentService } from '../services/enrollmentService';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

export default function EnrollmentListPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ user_id: '', course_id: '' });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (statusFilter) params.status = statusFilter;
        if (search) params.search = search;

        const [enrollmentsRes, statsRes, coursesRes, studentsRes] = await Promise.all([
          enrollmentService.getAll(params),
          enrollmentService.getStats(),
          import('../services/courseService').then((m) => m.courseService.getAll({ per_page: 100 })),
          import('../services/api').then((m) => m.default.get('/users', { params: { role: 'student', per_page: 100 } })),
        ]);

        setEnrollments(enrollmentsRes.data.data);
        setPagination(enrollmentsRes.data.meta);
        setStats(statsRes.data);
        setCourses(coursesRes.data.data);
        setStudents(studentsRes.data.data);
      } catch {
        setError('Failed to load enrollment data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [statusFilter, page, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    setReloadKey((k) => k + 1);
  };

  const handleAddEnrollment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await enrollmentService.create(addForm);
      setSuccess('Student enrolled successfully.');
      setShowAddModal(false);
      setAddForm({ user_id: '', course_id: '' });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action, id) => {
    setError('');
    setSuccess('');
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this enrollment record?')) return;
        await enrollmentService.delete(id);
        setSuccess('Enrollment deleted successfully.');
        setEnrollments((prev) => prev.filter((e) => e.id !== id));
        return;
      }

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

  return (
    <AppShell title="Enrollments" eyebrow="Enrollment Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {stats && (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total</p>
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
              <p className="text-sm font-medium text-slate-500">Cancelled</p>
              <p className="mt-2 text-2xl font-bold text-slate-600">{stats.cancelled}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg Progress</p>
              <p className="mt-2 text-2xl font-bold text-teal-600">{stats.average_progress}%</p>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Monitor and manage all course enrollments.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Enroll Student
          </button>
        </div>

        {showAddModal && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-950">Enroll Student in Course</h2>
            </div>
            <form onSubmit={handleAddEnrollment} className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Student <span className="text-rose-500">*</span></label>
                  <select
                    value={addForm.user_id}
                    onChange={(e) => setAddForm({ ...addForm, user_id: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Course <span className="text-rose-500">*</span></label>
                  <select
                    value={addForm.course_id}
                    onChange={(e) => setAddForm({ ...addForm, course_id: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by student name, email, or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
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
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading enrollments...</div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No enrollments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Student</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Course</th>
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
                        <div>
                          <p className="font-semibold text-slate-950">{enrollment.user?.name}</p>
                          <p className="text-xs text-slate-500">{enrollment.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/courses/${enrollment.course?.slug}`}
                          className="font-medium text-teal-600 hover:underline"
                        >
                          {enrollment.course?.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColors[enrollment.status]}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${enrollment.progress}%` }}
                            />
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
                            <>
                              <button
                                onClick={() => handleAction('complete', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleAction('suspend', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => handleAction('cancel', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(enrollment.status === 'cancelled' || enrollment.status === 'suspended') && (
                            <button
                              onClick={() => handleAction('activate', enrollment.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleAction('delete', enrollment.id)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
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
                Showing {pagination.from} to {pagination.to} of {pagination.total} enrollments
              </p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      page === pagination.current_page
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
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
