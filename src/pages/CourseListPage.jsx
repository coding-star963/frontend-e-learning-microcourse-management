import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService, categoryService } from '../services/courseService';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, SearchIcon, CoursesIcon } from '../components/Icons';

const statusBadge = {
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  archived: 'bg-slate-100 text-slate-600 ring-slate-400/20',
};

const difficultyBadge = {
  beginner: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  intermediate: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  advanced: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { page, per_page: 10 };
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category_id = categoryFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        const [coursesResponse, categoriesResponse] = await Promise.all([
          courseService.getAll(params),
          categoryService.getAll({ per_page: 100 }),
        ]);
        setCourses(coursesResponse.data.data);
        setPagination(coursesResponse.data.meta);
        setCategories(categoriesResponse.data.data);
      } catch {
        setError('Failed to load course catalog.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [statusFilter, categoryFilter, debouncedSearch, page, reloadKey]);

  const handleAction = async (action, slug) => {
    setActionLoading(slug);
    setError('');
    setSuccess('');
    try {
      let response;
      switch (action) {
        case 'publish':
          response = await courseService.publish(slug);
          setSuccess(response.data.message);
          break;
        case 'unpublish':
          response = await courseService.unpublish(slug);
          setSuccess(response.data.message);
          break;
        case 'archive':
          response = await courseService.archive(slug);
          setSuccess(response.data.message);
          break;
        case 'delete':
          if (!window.confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
            setActionLoading(null);
            return;
          }
          response = await courseService.delete(slug);
          setSuccess(response.data.message);
          setReloadKey((k) => k + 1);
          break;
      }
      if (action !== 'delete') {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} course.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AppShell title="Micro-Course Catalog" eyebrow="Curriculum">
      <div className="space-y-6 pb-12">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Manage courses, configure modular lessons, adjust publishing states, and track learning content.
            </p>
          </div>
          <Link
            to="/courses/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Create Course
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_200px]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <SearchIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search by title, description..."
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
                <option value="">All Statuses</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Courses Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading catalog...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CoursesIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No courses found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria or create a new course.</p>
              <div className="mt-5">
                <Link
                  to="/courses/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Course</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Level</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Teacher</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="min-w-[200px]">
                          <Link
                            to={`/courses/${course.slug}`}
                            className="font-bold text-slate-900 hover:text-teal-600 transition-colors"
                          >
                            {course.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            {course.duration && <span>{course.duration}</span>}
                            {course.lessons_count !== undefined && (
                              <>
                                <span>&bull;</span>
                                <span>{course.lessons_count} lessons</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {course.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                            statusBadge[course.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                            difficultyBadge[course.difficulty_level] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {course.difficulty_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {course.teacher?.name || 'Staff'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/courses/${course.slug}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            View
                          </Link>
                          <Link
                            to={`/courses/${course.slug}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            Edit
                          </Link>
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handleAction('publish', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}
                          {course.status === 'published' && (
                            <button
                              onClick={() => handleAction('unpublish', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                          )}
                          {course.status !== 'archived' && (
                            <button
                              onClick={() => handleAction('archive', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => handleAction('delete', course.slug)}
                            disabled={actionLoading === course.slug}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
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
                <span className="font-bold text-slate-700">{pagination.total}</span> courses
              </p>
              <div className="flex gap-1.5">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
