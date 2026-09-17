import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { announcementService } from '../services/announcementService';
import { courseService } from '../services/courseService';

export default function AnnouncementEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'general',
    course_id: '',
    is_published: false,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [announcementRes, coursesRes] = await Promise.all([
          announcementService.getById(id),
          courseService.getAll({ per_page: 100 }),
        ]);
        const data = announcementRes.data.data;
        setAnnouncement(data);
        setCourses(coursesRes.data.data);
        setForm({
          title: data.title,
          content: data.content,
          type: data.type,
          course_id: data.course_id || '',
          is_published: data.is_published,
        });
      } catch {
        setError('Failed to load announcement.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = { ...form };
      if (!data.course_id) data.course_id = null;

      await announcementService.update(id, data);
      navigate('/announcements');
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || 'Validation failed.');
      } else {
        setError(err.response?.data?.message || 'Failed to update announcement.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Edit Announcement" eyebrow="Announcement Management">
        <div className="text-center text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  if (!announcement) {
    return (
      <AppShell title="Edit Announcement" eyebrow="Announcement Management">
        <Alert type="error">Announcement not found.</Alert>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Announcement" eyebrow="Announcement Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <Link to="/announcements" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to announcements
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-950">Edit Announcement</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-700">
                Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={6}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-slate-700">
                  Type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="general">General</option>
                  <option value="course_update">Course Update</option>
                  <option value="important">Important</option>
                </select>
              </div>

              <div>
                <label htmlFor="course_id" className="block text-sm font-semibold text-slate-700">
                  Course (optional)
                </label>
                <select
                  id="course_id"
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-slate-700">
                Published
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/announcements"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
