import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { courseService, categoryService } from '../services/courseService';

export default function CourseEditPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    difficulty_level: 'beginner',
    duration: '',
    status: 'draft',
    thumbnail: null,
  });

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const [courseResponse, categoriesResponse] = await Promise.all([
          courseService.getById(slug),
          categoryService.getAll({ per_page: 100 }),
        ]);

        const course = courseResponse.data.data;
        setFormData({
          title: course.title,
          description: course.description || '',
          category_id: course.category?.id || '',
          difficulty_level: course.difficulty_level,
          duration: course.duration || '',
          status: course.status,
          thumbnail: null,
        });
        setCategories(categoriesResponse.data.data);
      } catch {
        setError('Failed to load course data.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await courseService.update(slug, formData);
      navigate(`/courses/${response.data.course.slug}`);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || 'Validation failed.');
      } else {
        setError(err.response?.data?.message || 'Failed to update course.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Edit Course" eyebrow="Course Management">
        <div className="text-center text-sm text-slate-500">Loading course...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Course" eyebrow="Course Management">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/courses" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to courses
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-950">Edit Micro-Course</h2>
            <p className="mt-1 text-sm text-slate-600">Update the course details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-semibold text-slate-700">
                  Difficulty Level <span className="text-rose-500">*</span>
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g., 2 hours"
                />
              </div>

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
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-semibold text-slate-700">
                Thumbnail
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
              />
              <p className="mt-1 text-xs text-slate-500">Max 2MB. Leave empty to keep current thumbnail.</p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <Link
                to="/courses"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
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
