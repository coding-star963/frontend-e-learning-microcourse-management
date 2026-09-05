import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { lessonService } from '../services/lessonService';

export default function LessonCreatePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    availability: 'free',
    is_free_preview: false,
    duration_seconds: '',
    video: null,
    audio: null,
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await lessonService.create(slug, formData);
      navigate(`/courses/${slug}/lessons/${response.data.lesson.id}`);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || 'Validation failed.');
      } else {
        setError(err.response?.data?.message || 'Failed to create lesson.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Lesson" eyebrow="Lesson Management">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to={`/courses/${slug}/lessons`} className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to lessons
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-950">New Lesson</h2>
            <p className="mt-1 text-sm text-slate-600">Fill in the details to create a new lesson.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g., Introduction to Variables"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Brief description of this lesson..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-semibold text-slate-700">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="free">Free</option>
                  <option value="locked">Locked</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration_seconds" className="block text-sm font-semibold text-slate-700">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  id="duration_seconds"
                  name="duration_seconds"
                  value={formData.duration_seconds}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_free_preview"
                name="is_free_preview"
                checked={formData.is_free_preview}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="is_free_preview" className="text-sm font-semibold text-slate-700">
                Free preview lesson
              </label>
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-semibold text-slate-700">
                Video
              </label>
              <input
                type="file"
                id="video"
                name="video"
                onChange={handleChange}
                accept="video/mp4,video/webm,video/ogg"
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
              />
              <p className="mt-1 text-xs text-slate-500">MP4, WebM, or OGG. Max 100MB.</p>
            </div>

            <div>
              <label htmlFor="audio" className="block text-sm font-semibold text-slate-700">
                Audio
              </label>
              <input
                type="file"
                id="audio"
                name="audio"
                onChange={handleChange}
                accept="audio/mpeg,audio/wav,audio/ogg"
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
              />
              <p className="mt-1 text-xs text-slate-500">MP3, WAV, or OGG. Max 50MB.</p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <Link
                to={`/courses/${slug}/lessons`}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
