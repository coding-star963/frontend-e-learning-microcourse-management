import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { announcementService } from '../services/announcementService';
import { useDebounce } from '../hooks/useDebounce';

const typeColors = {
  general: 'bg-slate-100 text-slate-700',
  course_update: 'bg-blue-50 text-blue-700',
  important: 'bg-rose-50 text-rose-700',
};

const typeLabels = {
  general: 'General',
  course_update: 'Course Update',
  important: 'Important',
};

export default function AnnouncementListPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (typeFilter) params.type = typeFilter;
        if (statusFilter) params.is_published = statusFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await announcementService.getAll(params);
        setAnnouncements(res.data.data);
        setPagination(res.data.meta);
      } catch {
        setError('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [typeFilter, statusFilter, page, reloadKey, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;

    try {
      const res = await announcementService.delete(id);
      setSuccess(res.data.message);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  const handleTogglePublish = async (announcement) => {
    try {
      const res = announcement.is_published
        ? await announcementService.unpublish(announcement.id)
        : await announcementService.publish(announcement.id);
      setSuccess(res.data.message);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement.');
    }
  };

  return (
    <AppShell title="Announcements" eyebrow="Announcement Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Create and manage announcements for students.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/announcements/history"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              History
            </Link>
            <Link
              to="/announcements/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <span className="text-lg leading-none">+</span>
              New Announcement
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </form>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="course_update">Course Update</option>
                <option value="important">Important</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Status</option>
                <option value="1">Published</option>
                <option value="0">Draft</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No announcements found. Click "New Announcement" to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/announcements/${announcement.id}/edit`}
                          className="font-semibold text-slate-950 hover:text-teal-600"
                        >
                          {announcement.title}
                        </Link>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${typeColors[announcement.type]}`}>
                          {typeLabels[announcement.type]}
                        </span>
                        {announcement.is_published ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{announcement.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>by {announcement.user?.name}</span>
                        {announcement.course && (
                          <span>for {announcement.course.title}</span>
                        )}
                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.published_at && (
                          <span>published {new Date(announcement.published_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(announcement)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                          announcement.is_published
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {announcement.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        to={`/announcements/${announcement.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Showing {pagination.from} to {pagination.to} of {pagination.total}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      p === pagination.current_page
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
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
