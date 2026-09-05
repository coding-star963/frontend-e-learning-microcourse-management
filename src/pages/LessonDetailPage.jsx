import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
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

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function LessonDetailPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await lessonService.getById(slug, id);
        setLesson(response.data.data);
      } catch {
        setError('Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [slug, id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this lesson? This cannot be undone.')) {
          setActionLoading(false);
          return;
        }
        await lessonService.delete(slug, id);
        navigate(`/courses/${slug}/lessons`);
        return;
      }

      let response;
      switch (action) {
        case 'publish':
          response = await lessonService.publish(slug, id);
          break;
        case 'unpublish':
          response = await lessonService.unpublish(slug, id);
          break;
        case 'archive':
          response = await lessonService.archive(slug, id);
          break;
      }
      setSuccess(response.data.message);
      const res = await lessonService.getById(slug, id);
      setLesson(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} lesson.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAvailabilityChange = async (availability) => {
    setError('');
    setSuccess('');
    try {
      const response = await lessonService.updateAvailability(slug, id, availability);
      setSuccess(response.data.message);
      const res = await lessonService.getById(slug, id);
      setLesson(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability.');
    }
  };

  const handleUploadResource = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResource(true);
    setError('');
    setSuccess('');
    try {
      await lessonService.addResource(slug, id, file);
      setSuccess('Resource uploaded successfully.');
      const res = await lessonService.getById(slug, id);
      setLesson(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resource.');
    } finally {
      setUploadingResource(false);
      e.target.value = '';
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;

    setError('');
    setSuccess('');
    try {
      await lessonService.deleteResource(slug, id, resourceId);
      setSuccess('Resource deleted successfully.');
      const res = await lessonService.getById(slug, id);
      setLesson(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource.');
    }
  };

  if (loading) {
    return (
      <AppShell title="Lesson Details" eyebrow="Lesson Management">
        <div className="text-center text-sm text-slate-500">Loading lesson...</div>
      </AppShell>
    );
  }

  if (!lesson) {
    return (
      <AppShell title="Lesson Details" eyebrow="Lesson Management">
        <Alert type="error">Lesson not found.</Alert>
      </AppShell>
    );
  }

  return (
    <AppShell title="Lesson Details" eyebrow="Lesson Management">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/courses/${slug}/lessons`} className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to lessons
          </Link>
          <Link
            to={`/courses/${slug}/lessons/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit Lesson
          </Link>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex flex-wrap items-start gap-3">
              <span className="text-xs font-medium text-slate-400">#{lesson.order}</span>
              <h1 className="text-2xl font-bold text-slate-950">{lesson.title}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[lesson.status]}`}>
                {lesson.status}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${availabilityColors[lesson.availability]}`}>
                {lesson.availability}
              </span>
            </div>

            {lesson.description && (
              <p className="mt-4 text-sm leading-6 text-slate-600">{lesson.description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {lesson.duration_formatted || 'Not set'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Free Preview</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {lesson.is_free_preview ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Video</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {lesson.video_url ? formatFileSize(lesson.video_size) : 'None'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Audio</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {lesson.audio_url ? formatFileSize(lesson.audio_size) : 'None'}
                </p>
              </div>
            </div>

            {lesson.video_url && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700 mb-2">Video</p>
                <video controls className="w-full rounded-lg bg-black" src={lesson.video_url} />
              </div>
            )}

            {lesson.audio_url && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700 mb-2">Audio</p>
                <audio controls className="w-full" src={lesson.audio_url} />
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Availability</p>
              <div className="flex gap-2">
                {['free', 'locked', 'scheduled'].map((avail) => (
                  <button
                    key={avail}
                    onClick={() => handleAvailabilityChange(avail)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      lesson.availability === avail
                        ? 'bg-teal-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {avail}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Resources ({lesson.resources?.length || 0})</p>
                <label className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer ${uploadingResource ? 'opacity-50' : ''}`}>
                  <input
                    type="file"
                    onChange={handleUploadResource}
                    className="hidden"
                    disabled={uploadingResource}
                  />
                  {uploadingResource ? 'Uploading...' : '+ Upload File'}
                </label>
              </div>
              {lesson.resources?.length > 0 ? (
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {lesson.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-950 truncate">{resource.name}</p>
                        <p className="text-xs text-slate-500">{resource.file_type} &middot; {formatFileSize(resource.file_size)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No resources uploaded yet.</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
              {lesson.status === 'draft' && (
                <button
                  onClick={() => handleAction('publish')}
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Publish Lesson'}
                </button>
              )}
              {lesson.status === 'published' && (
                <button
                  onClick={() => handleAction('unpublish')}
                  disabled={actionLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Unpublish Lesson'}
                </button>
              )}
              {lesson.status !== 'archived' && (
                <button
                  onClick={() => handleAction('archive')}
                  disabled={actionLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Archive Lesson'}
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                disabled={actionLoading}
                className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Delete Lesson'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
