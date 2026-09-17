import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, SearchIcon, EnrollmentsIcon } from '../components/Icons';
import { getStorageUrl } from '../utils/imageUrl';

const statusBadge = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-400/20',
  suspended: 'bg-amber-50 text-amber-700 ring-amber-600/20',
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
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (statusFilter) params.status = statusFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const [enrollmentsRes, statsRes, coursesRes, studentsRes] = await Promise.all([
          enrollmentService.getAll(params),
          enrollmentService.getStats(),
          courseService.getAll({ per_page: 100 }),
          api.get('/users', { params: { role: 'student', per_page: 100 } }),
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
  }, [statusFilter, page, reloadKey, debouncedSearch]);

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
    <AppShell title="Student Enrollments" eyebrow="Academics">
      <div className="space-y-6 pb-12">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Stats Strip */}
        {stats && (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Learning</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">{stats.active}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-black text-blue-600">{stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cancelled</p>
              <p className="mt-2 text-2xl font-black text-slate-500">{stats.cancelled}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Completion</p>
              <p className="mt-2 text-2xl font-black text-teal-600">{stats.average_progress}%</p>
            </div>
          </section>
        )}

        {/* Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Audit course participation, update student completion statuses, or manually grant access.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Enroll Student
          </button>
        </div>

        {/* Modal: Enroll Student */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => !saving && setShowAddModal(false)}
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Enroll Student in Micro-Course</h3>
                <p className="text-xs text-slate-500">Select an existing registered student and target course.</p>
              </div>
              <form onSubmit={handleAddEnrollment} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Student Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addForm.user_id}
                    onChange={(e) => setAddForm({ ...addForm, user_id: e.target.value })}
                    required
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select a student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Micro-Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addForm.course_id}
                    onChange={(e) => setAddForm({ ...addForm, course_id: e.target.value })}
                    required
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Enrolling...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter and Search */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <SearchIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search student name, email, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All Enrollment Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </form>
        </div>

        {/* Enrollments Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading enrollments...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <EnrollmentsIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No enrollments found</h3>
              <p className="mt-1 text-sm text-slate-500">No student enrollment records match the search filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Course</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Progress</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {enrollment.user?.profile_photo ? (
                            <img
                              src={getStorageUrl(enrollment.user.profile_photo)}
                              alt={enrollment.user.name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-xs ring-2 ring-teal-100 shadow-sm">
                              {enrollment.user?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{enrollment.user?.name}</p>
                            <p className="text-xs text-slate-500">{enrollment.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/courses/${enrollment.course?.slug}`}
                          className="font-semibold text-slate-900 hover:text-teal-600 transition-colors"
                        >
                          {enrollment.course?.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                            statusBadge[enrollment.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-500 transition-all duration-300"
                              style={{ width: `${Math.min(enrollment.progress || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{enrollment.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/enrollments/${enrollment.id}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            View
                          </Link>
                          {enrollment.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleAction('complete', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleAction('suspend', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 transition"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => handleAction('cancel', enrollment.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(enrollment.status === 'cancelled' || enrollment.status === 'suspended') && (
                            <button
                              onClick={() => handleAction('activate', enrollment.id)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleAction('delete', enrollment.id)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
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
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{pagination.from}</span> to{' '}
                <span className="font-bold text-slate-700">{pagination.to}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> enrollments
              </p>
              <div className="flex gap-1.5">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                      page === pagination.current_page
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
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
