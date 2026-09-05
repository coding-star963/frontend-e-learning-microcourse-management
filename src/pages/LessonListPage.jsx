import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { lessonService } from '../services/lessonService';
import { courseService } from '../services/courseService';

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

export default function LessonListPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseService.getById(slug),
          lessonService.getAll(slug),
        ]);
        setCourse(courseRes.data.data);
        setLessons(lessonsRes.data.data);
      } catch {
        setError('Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const handleAction = async (action, lessonId) => {
    setError('');
    setSuccess('');
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
        await lessonService.delete(slug, lessonId);
        setSuccess('Lesson deleted successfully.');
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        return;
      }

      let response;
      switch (action) {
        case 'publish':
          response = await lessonService.publish(slug, lessonId);
          break;
        case 'unpublish':
          response = await lessonService.unpublish(slug, lessonId);
          break;
        case 'archive':
          response = await lessonService.archive(slug, lessonId);
          break;
      }
      setSuccess(response.data.message);

      const lessonsRes = await lessonService.getAll(slug);
      setLessons(lessonsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} lesson.`);
    }
  };

  const handleDragStart = (e, lessonId) => {
    setDraggedId(lessonId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const lessonIds = lessons.map((l) => l.id);
    const draggedIndex = lessonIds.indexOf(draggedId);
    const targetIndex = lessonIds.indexOf(targetId);

    lessonIds.splice(draggedIndex, 1);
    lessonIds.splice(targetIndex, 0, draggedId);

    setLessons((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });

    try {
      await lessonService.reorder(slug, lessonIds);
      setSuccess('Lesson order updated.');
    } catch {
      setError('Failed to update lesson order.');
      const lessonsRes = await lessonService.getAll(slug);
      setLessons(lessonsRes.data.data);
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (loading) {
    return (
      <AppShell title="Lessons" eyebrow="Lesson Management">
        <div className="text-center text-sm text-slate-500">Loading lessons...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={course ? `Lessons - ${course.title}` : 'Lessons'} eyebrow="Lesson Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to={`/courses/${slug}`} className="text-sm text-slate-600 hover:text-teal-600">
              &larr; Back to course
            </Link>
            <p className="mt-1 text-sm text-slate-600">Drag and drop to reorder lessons.</p>
          </div>
          <Link
            to={`/courses/${slug}/lessons/create`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Lesson
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No lessons yet. <Link to={`/courses/${slug}/lessons/create`} className="text-teal-600 hover:underline">Create your first lesson</Link>.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lesson.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, lesson.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-4 transition ${
                    draggedId === lesson.id ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="cursor-grab text-slate-400 hover:text-slate-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">#{lesson.order}</span>
                      <h3 className="truncate font-semibold text-slate-950">{lesson.title}</h3>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[lesson.status]}`}>
                        {lesson.status}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${availabilityColors[lesson.availability]}`}>
                        {lesson.availability}
                      </span>
                      {lesson.duration_formatted && (
                        <span className="text-xs text-slate-500">{lesson.duration_formatted}</span>
                      )}
                      {lesson.video_url && (
                        <span className="text-xs text-slate-400">Video</span>
                      )}
                      {lesson.audio_url && (
                        <span className="text-xs text-slate-400">Audio</span>
                      )}
                      {lesson.resources?.length > 0 && (
                        <span className="text-xs text-slate-400">{lesson.resources.length} file{lesson.resources.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/courses/${slug}/lessons/${lesson.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/courses/${slug}/lessons/${lesson.id}/edit`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    {lesson.status === 'draft' && (
                      <button
                        onClick={() => handleAction('publish', lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        Publish
                      </button>
                    )}
                    {lesson.status === 'published' && (
                      <button
                        onClick={() => handleAction('unpublish', lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      >
                        Unpublish
                      </button>
                    )}
                    {lesson.status !== 'archived' && (
                      <button
                        onClick={() => handleAction('archive', lesson.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('delete', lesson.id)}
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
