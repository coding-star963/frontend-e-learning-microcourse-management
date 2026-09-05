import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService, categoryService } from '../services/courseService';

const statusColors = {
  draft: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600',
};

const difficultyColors = {
  beginner: 'bg-blue-50 text-blue-700',
  intermediate: 'bg-purple-50 text-purple-700',
  advanced: 'bg-rose-50 text-rose-700',
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
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCourses = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (search) params.search = search;
      const response = await courseService.getAll(params);
      setCourses(response.data.data);
      setPagination(response.data.meta);
    } catch {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ per_page: 100 });
      setCategories(response.data.data);
    } catch {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCourses(), fetchCategories()]);
    };
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

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
          if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            setActionLoading(null);
            return;
          }
          response = await courseService.delete(slug);
          setSuccess(response.data.message);
          fetchCourses();
          break;
      }
      if (action !== 'delete') {
        fetchCourses();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} course.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AppShell title="Micro-Courses" eyebrow="Course Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Manage your micro-courses, publish content, and track status.</p>
          </div>
          <Link
            to="/courses/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Create Course
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search courses..."
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No courses found. <Link to="/courses/create" className="text-teal-600 hover:underline">Create your first course</Link>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Course</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Difficulty</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Teacher</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-950">{course.title}</p>
                          {course.duration && (
                            <p className="text-xs text-slate-500">{course.duration}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {course.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColors[course.status] || 'bg-slate-100 text-slate-600'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${difficultyColors[course.difficulty_level] || 'bg-slate-100 text-slate-600'}`}>
                          {course.difficulty_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {course.teacher?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/courses/${course.slug}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            View
                          </Link>
                          <Link
                            to={`/courses/${course.slug}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handleAction('publish', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}
                          {course.status === 'published' && (
                            <button
                              onClick={() => handleAction('unpublish', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                          )}
                          {course.status !== 'archived' && (
                            <button
                              onClick={() => handleAction('archive', course.slug)}
                              disabled={actionLoading === course.slug}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => handleAction('delete', course.slug)}
                            disabled={actionLoading === course.slug}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
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
                Showing {pagination.from} to {pagination.to} of {pagination.total} courses
              </p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchCourses(page)}
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
