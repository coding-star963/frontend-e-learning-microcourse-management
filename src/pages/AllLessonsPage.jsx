import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';

const statusColors = {
  draft: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600',
};

const availabilityColors = {
  free: 'bg-blue-50 text-blue-700',
  locked: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-purple-50 text-purple-700',
};

export default function AllLessonsPage() {
  const [courses, setCourses] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

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
    return true;
  });

  if (loading) {
    return (
      <AppShell title="All Lessons" eyebrow="Lesson Management">
        <div className="text-center text-sm text-slate-500">Loading lessons...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="All Lessons" eyebrow="Lesson Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
              <span className="text-sm text-slate-500">
                {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No lessons found.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">#{lesson.order}</span>
                      <h3 className="truncate font-semibold text-slate-950">{lesson.title}</h3>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Link
                        to={`/courses/${lesson.course_slug}`}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        {lesson.course_title}
                      </Link>
                      <span className="text-xs text-slate-300">|</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[lesson.status]}`}>
                        {lesson.status}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${availabilityColors[lesson.availability]}`}>
                        {lesson.availability}
                      </span>
                      {lesson.duration_formatted && (
                        <span className="text-xs text-slate-500">{lesson.duration_formatted}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/courses/${lesson.course_slug}/lessons/${lesson.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/courses/${lesson.course_slug}/lessons/${lesson.id}/edit`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    {lesson.status === 'draft' && (
                      <button
                        onClick={() => handleAction('publish', lesson.course_slug, lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        Publish
                      </button>
                    )}
                    {lesson.status === 'published' && (
                      <button
                        onClick={() => handleAction('unpublish', lesson.course_slug, lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('delete', lesson.course_slug, lesson.id)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
