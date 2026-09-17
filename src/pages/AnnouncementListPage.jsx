import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { announcementService } from '../services/announcementService';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, SearchIcon, AnnouncementsIcon } from '../components/Icons';

const typeBadge = {
  general: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  course_update: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  important: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const typeLabels = {
  general: 'General Notice',
  course_update: 'Course Update',
  important: 'High Priority',
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
    <AppShell title="Announcements & Bulletins" eyebrow="Communication">
      <div className="space-y-6 pb-12">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Broadcast critical updates, course notices, and general announcements to students and mobile app users.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/announcements/history"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Audits
            </Link>
            <Link
              to="/announcements/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
            >
              <PlusIcon className="h-4 w-4" />
              New Announcement
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_200px]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <SearchIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bulletins and content..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="course_update">Course Update</option>
                <option value="important">Important</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All States</option>
                <option value="1">Published Only</option>
                <option value="0">Drafts Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List Container */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading bulletins...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <AnnouncementsIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No announcements found</h3>
              <p className="mt-1 text-sm text-slate-500">Create your first announcement to notify staff or students.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-slate-50/75 transition-colors">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/announcements/${announcement.id}/edit`}
                          className="font-bold text-base text-slate-900 hover:text-teal-600 transition-colors"
                        >
                          {announcement.title}
                        </Link>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${
                            typeBadge[announcement.type] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {typeLabels[announcement.type] || announcement.type}
                        </span>
                        {announcement.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">Author: {announcement.user?.name || 'Staff'}</span>
                        {announcement.course && (
                          <>
                            <span>&bull;</span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                              {announcement.course.title}
                            </span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>Created {new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.published_at && (
                          <>
                            <span>&bull;</span>
                            <span className="text-emerald-600 font-medium">
                              Published {new Date(announcement.published_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => handleTogglePublish(announcement)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                          announcement.is_published
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {announcement.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link
                        to={`/announcements/${announcement.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
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
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{pagination.from}</span> to{' '}
                <span className="font-bold text-slate-700">{pagination.to}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> bulletins
              </p>
              <div className="flex gap-1.5">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
