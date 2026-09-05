import { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { announcementService } from '../services/announcementService';

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

export default function NotificationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = { per_page: 15, page };
        if (typeFilter) params.type = typeFilter;
        if (search) params.search = search;

        const res = await announcementService.getNotificationHistory(params);
        setHistory(res.data.data);
        setPagination(res.data.meta);
      } catch {
        setError('Failed to load notification history.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [typeFilter, page, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setReloadKey((k) => k + 1);
  };

  return (
    <AppShell title="Notification History" eyebrow="Announcement Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Search
              </button>
            </form>
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
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No notifications found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      <span className="text-xs font-bold">N</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-950">{item.title}</h3>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${typeColors[item.type]}`}>
                          {typeLabels[item.type]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{item.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>by {item.user?.name}</span>
                        {item.course && (
                          <span>for {item.course.title}</span>
                        )}
                        <span>published {new Date(item.published_at).toLocaleDateString()}</span>
                        <span>{new Date(item.published_at).toLocaleTimeString()}</span>
                      </div>
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
