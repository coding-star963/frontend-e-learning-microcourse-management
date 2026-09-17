import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService } from '../services/courseService';

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

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseService.getById(slug);
        setCourse(response.data.data);
      } catch {
        setError('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const handleAction = async (action) => {
    setActionLoading(true);
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
            setActionLoading(false);
            return;
          }
          response = await courseService.delete(slug);
          navigate('/courses');
          return;
      }
      const updatedResponse = await courseService.getById(slug);
      setCourse(updatedResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} course.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Course Details" eyebrow="Course Management">
        <div className="text-center text-sm text-slate-500">Loading course...</div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell title="Course Details" eyebrow="Course Management">
        <Alert type="error">Course not found.</Alert>
      </AppShell>
    );
  }

  return (
    <AppShell title="Course Details" eyebrow="Course Management">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/courses" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to courses
          </Link>
          <Link
            to={`/courses/${slug}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit Course
          </Link>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {course.thumbnail && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-slate-100">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-2xl font-bold text-slate-950">{course.title}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[course.status]}`}>
                {course.status}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${difficultyColors[course.difficulty_level]}`}>
                {course.difficulty_level}
              </span>
            </div>

            {course.description && (
              <p className="mt-4 text-sm leading-6 text-slate-600">{course.description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {course.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {course.duration || 'Not set'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Teacher</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {course.teacher?.name || 'Unknown'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Created</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
              <Link
                to={`/courses/${slug}/lessons`}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Manage Lessons
              </Link>
              {course.status === 'draft' && (
                <button
                  onClick={() => handleAction('publish')}
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Publish Course'}
                </button>
              )}
              {course.status === 'published' && (
                <button
                  onClick={() => handleAction('unpublish')}
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Unpublish Course'}
                </button>
              )}
              {course.status !== 'archived' && (
                <button
                  onClick={() => handleAction('archive')}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Archive Course'}
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                disabled={actionLoading}
                className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
