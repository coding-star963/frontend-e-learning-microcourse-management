import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import { LessonsIcon, SearchIcon } from '../components/Icons';
import { useDebounce } from '../hooks/useDebounce';

const statusBadge = {
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  archived: 'bg-slate-100 text-slate-600 ring-slate-400/20',
};

const availabilityBadge = {
  free: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  locked: 'bg-slate-100 text-slate-600 ring-slate-400/20',
  scheduled: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

const ITEMS_PER_PAGE = 12;

export default function AllLessonsPage() {
  const [courses, setCourses] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesRes = await courseService.getAll({ per_page: 100 });
        const coursesData = coursesRes.data.data;
        setCourses(coursesData);

        const lessonsPromises = coursesData.map((c) =>
          lessonService.getAll(c.slug).then((res) =>
            res.data.data.map((lesson) => ({
              ...lesson,
              course_slug: c.slug,
              course_title: c.title,
            }))
          )
        );
        const lessonsArrays = await Promise.all(lessonsPromises);
        setAllLessons(lessonsArrays.flat());
      } catch {
        setError('Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const handleAction = async (action, courseSlug, lessonId) => {
    setError('');
    setSuccess('');
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
        await lessonService.delete(courseSlug, lessonId);
        setSuccess('Lesson deleted successfully.');
        setAllLessons((prev) => prev.filter((l) => l.id !== lessonId));
        return;
      }

      let response;
      switch (action) {
        case 'publish':
          response = await lessonService.publish(courseSlug, lessonId);
          break;
        case 'unpublish':
          response = await lessonService.unpublish(courseSlug, lessonId);
          break;
        case 'archive':
          response = await lessonService.archive(courseSlug, lessonId);
          break;
      }
      setSuccess(response.data.message);

      setAllLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId ? { ...l, status: response.data.lesson.status } : l
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} lesson.`);
    }
  };

  const filteredLessons = allLessons.filter((lesson) => {
    if (statusFilter && lesson.status !== statusFilter) return false;
    if (courseFilter && lesson.course_slug !== courseFilter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const matchTitle = lesson.title?.toLowerCase().includes(q);
      const matchCourse = lesson.course_title?.toLowerCase().includes(q);
      const matchDesc = lesson.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse && !matchDesc) return false;
    }
    return true;
  });

  // Calculate pagination
  const totalItems = filteredLessons.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

  return (
    <AppShell title="Micro-Lesson Master Index" eyebrow="Curriculum">
      <div className="space-y-6 pb-12">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <SearchIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search lessons by title, content, or course..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All Statuses</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 max-w-xs"
              >
                <option value="">All Micro-Courses</option>
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Showing <span className="font-bold text-slate-900">{filteredLessons.length}</span> total lesson{filteredLessons.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Lessons List Container */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Aggregating lessons across courses...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <LessonsIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No lessons found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search || statusFilter || courseFilter
                  ? 'No lessons match your search criteria or filters.'
                  : 'No lessons created yet across your courses.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedLessons.map((lesson) => (
                <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/75 transition-colors">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 font-bold text-xs">
                      #{lesson.order}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses/${lesson.course_slug}/lessons/${lesson.id}`}
                          className="font-bold text-slate-900 hover:text-teal-600 transition-colors truncate"
                        >
                          {lesson.title}
                        </Link>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Link
                          to={`/courses/${lesson.course_slug}`}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium hover:bg-slate-200 transition"
                        >
                          {lesson.course_title}
                        </Link>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ring-1 ${
                            statusBadge[lesson.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lesson.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ring-1 ${
                            availabilityBadge[lesson.availability] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lesson.availability}
                        </span>
                        {lesson.duration_formatted && (
                          <span className="text-slate-400 font-medium">{lesson.duration_formatted}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/courses/${lesson.course_slug}/lessons/${lesson.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      View
                    </Link>
                    <Link
                      to={`/courses/${lesson.course_slug}/lessons/${lesson.id}/edit`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Edit
                    </Link>
                    {lesson.status === 'draft' && (
                      <button
                        onClick={() => handleAction('publish', lesson.course_slug, lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        Publish
                      </button>
                    )}
                    {lesson.status === 'published' && (
                      <button
                        onClick={() => handleAction('unpublish', lesson.course_slug, lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('delete', lesson.course_slug, lesson.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-slate-700">{endIndex}</span> of{' '}
                <span className="font-bold text-slate-700">{totalItems}</span> lessons
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                      p === page
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
