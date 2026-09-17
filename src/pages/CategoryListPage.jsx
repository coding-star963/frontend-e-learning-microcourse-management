import { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { categoryService } from '../services/courseService';
import { PlusIcon, CategoriesIcon, SearchIcon } from '../components/Icons';
import { useDebounce } from '../hooks/useDebounce';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const params = { page, per_page: 10 };
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await categoryService.getAll(params);
        if (!ignore) {
          setCategories(response.data.data);
          setPagination(response.data.meta);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load categories.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, reloadKey]);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        const response = await categoryService.update(editingCategory.slug, formData);
        setSuccess(response.data.message);
      } else {
        const response = await categoryService.create(formData);
        setSuccess(response.data.message);
      }
      resetForm();
      setReloadKey((k) => k + 1);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || 'Validation failed.');
      } else {
        setError(err.response?.data?.message || 'Failed to save category.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await categoryService.delete(category.slug);
      setSuccess(response.data.message);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <AppShell title="Subject Categories" eyebrow="Taxonomy">
      <div className="space-y-6 pb-12">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Categorize and classify micro-courses to streamline learning tracks and mobile navigation.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Search Bar with Debounce */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
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
              placeholder="Search categories by name or description..."
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
        </div>

        {/* Modal / Form Drawer */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => !saving && resetForm()}
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-slate-500">Provide a distinct name and description for student discovery.</p>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                    placeholder="e.g., Software Engineering"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Describe what learners will find in this category..."
                  />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CategoriesIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No categories found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search ? `No categories match "${search}".` : 'Create a category to begin classifying micro-courses.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-slate-50/75 transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/20">
                      <CategoriesIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-1">{category.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {category.courses_count ?? 0} course{(category.courses_count ?? 0) !== 1 ? 's' : ''} assigned
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-400 font-mono">/{category.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{pagination.from || 0}</span> to{' '}
                <span className="font-bold text-slate-700">{pagination.to || 0}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> categories
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
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
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
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                  disabled={page >= pagination.last_page}
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
