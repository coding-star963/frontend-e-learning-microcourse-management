import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { SearchIcon, ProgressIcon, UsersIcon } from '../components/Icons';
import { getStorageUrl } from '../utils/imageUrl';

export default function StudentProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStudentId = searchParams.get('student_id');

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId ? Number(initialStudentId) : null);
  const [progress, setProgress] = useState(null);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState('');

  const telemetryRef = useRef(null);

  // Fetch students with search & pagination
  useEffect(() => {
    const controller = new AbortController();

    const fetchStudents = async () => {
      setLoadingStudents(true);
      setError('');
      try {
        const params = {
          role: 'student',
          page,
          per_page: 8,
        };
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const res = await api.get('/users', { params, signal: controller.signal });
        if (!controller.signal.aborted) {
          setStudents(res.data.data);
          setPagination(res.data.meta);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || 'Failed to load students.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStudents(false);
        }
      }
    };

    fetchStudents();

    return () => controller.abort();
  }, [debouncedSearch, page]);

  // Fetch telemetry when selectedStudentId changes
  useEffect(() => {
    if (!selectedStudentId) return;

    let ignore = false;
    const loadProgress = async () => {
      setLoadingProgress(true);
      setError('');
      try {
        const res = await progressService.getStudentProgress(selectedStudentId);
        if (!ignore) {
          setProgress(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to load student progress telemetry.');
        }
      } finally {
        if (!ignore) {
          setLoadingProgress(false);
        }
      }
    };

    loadProgress();

    return () => {
      ignore = true;
    };
  }, [selectedStudentId]);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.id);
    setSearchParams({ student_id: student.id });
    if (telemetryRef.current) {
      setTimeout(() => {
        telemetryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentId(null);
    setProgress(null);
    setSearchParams({});
  };

  return (
    <AppShell title="Student Learning Velocity" eyebrow="Progress Telemetry">
      <div className="space-y-8 pb-16">
        {error && <Alert type="error">{error}</Alert>}

        {/* Directory Search & Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Enrolled Student Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and select a student to review real-time course completions, lesson velocity, and audit logs.
              </p>
            </div>
            {selectedStudentId && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Search Bar with Debounce */}
          <div className="mt-6 relative max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <SearchIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name or email address..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-12 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Student Cards Grid */}
          <div className="mt-6">
            {loadingStudents ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                <p className="text-xs font-semibold text-slate-400">Searching student registry...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">No students found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {search ? `No student accounts matched "${search}".` : 'No student accounts currently enrolled.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {students.map((student) => {
                  const isSelected = selectedStudentId === student.id;
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-md'
                          : 'border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {student.profile_photo ? (
                          <img
                            src={getStorageUrl(student.profile_photo)}
                            alt={student.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-bold text-white text-base shadow-sm ring-2 ring-teal-100">
                            {student.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                            {student.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            student.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              student.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {student.is_active ? 'Active' : 'Disabled'}
                        </span>

                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Inspect'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{pagination.from || 0}</span> to{' '}
                <span className="font-bold text-slate-700">{pagination.to || 0}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> students
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                      p === pagination.current_page
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                  disabled={page >= pagination.last_page}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Student Telemetry Section */}
        <div ref={telemetryRef}>
          {loadingProgress && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-600">
                  Retrieving student learning telemetry and module milestones...
                </p>
              </div>
            </div>
          )}

          {!loadingProgress && progress && (
            <div className="space-y-6">
              {/* Student Profile Header Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {progress.student?.profile_photo ? (
                      <img
                        src={getStorageUrl(progress.student.profile_photo)}
                        alt={progress.student.name}
                        className="h-16 w-16 rounded-full object-cover ring-4 ring-teal-500/20 shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-bold text-white text-2xl shadow-md ring-4 ring-teal-500/20">
                        {progress.student?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold text-slate-900">{progress.student?.name}</h2>
                        <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 ring-1 ring-teal-600/20">
                          Student
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{progress.student?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/progress/students/${progress.student.id}`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Open Full Page Report &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* KPI Metric Summary Strip */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Courses</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{progress.summary.total_courses}</p>
                  <p className="mt-1 text-xs text-slate-400">Active learning tracks</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Courses</p>
                  <p className="mt-2 text-3xl font-black text-blue-600">{progress.summary.completed_courses}</p>
                  <p className="mt-1 text-xs text-slate-400">100% finished modules</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Completion</p>
                  <p className="mt-2 text-3xl font-black text-teal-600">{progress.summary.average_progress}%</p>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.min(progress.summary.average_progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* Courses Breakdown */}
              <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6">
                  <h3 className="text-base font-bold text-slate-900">Course Progress Breakdown</h3>
                  <p className="text-xs text-slate-500">Lesson by lesson completion telemetry across all enrolled micro-courses</p>
                </div>

                {progress.courses.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-400">
                    Student is currently not enrolled in any micro-courses.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {progress.courses.map((item) => (
                      <div
                        key={item.enrollment_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-slate-50/75 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/courses/${item.course.slug}`}
                            className="font-bold text-base text-slate-900 hover:text-teal-600 transition-colors"
                          >
                            {item.course.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                              {item.course.category}
                            </span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-500 font-medium">Instructor: {item.course.teacher}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md ring-1 ring-teal-600/20">
                              {item.completed_lessons} of {item.total_lessons} lessons completed
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                          <div className="text-right">
                            <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-teal-500 transition-all duration-300"
                                style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs font-bold text-slate-700">{item.progress}%</p>
                          </div>
                          <Link
                            to={`/enrollments/${item.enrollment_id}`}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Audit Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loadingStudents && !loadingProgress && !progress && selectedStudentId === null && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <ProgressIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No Student Selected</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Select any student card above or use the search bar to review lesson completions, module velocities, and learning milestones.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
