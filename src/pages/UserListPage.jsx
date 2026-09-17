import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import AppShell from '../components/AppShell';
import { useDebounce } from '../hooks/useDebounce';
import { PlusIcon, SearchIcon, UsersIcon } from '../components/Icons';
import { getStorageUrl } from '../utils/imageUrl';

const roleStyles = {
  administrator: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  teacher: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  student: 'bg-teal-50 text-teal-700 ring-teal-600/20',
};

const roleAvatarGradients = {
  administrator: 'from-purple-600 to-indigo-600',
  teacher: 'from-blue-600 to-cyan-600',
  student: 'from-teal-600 to-emerald-600',
};

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const abortRef = useRef(null);
  const debouncedSearch = useDebounce(search);


  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page, per_page: 15 };
        if (roleFilter) params.role = roleFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        const response = await api.get('/users', { params, signal: controller.signal });
        if (!controller.signal.aborted) {
          setUsers(response.data.data);
          setPagination(response.data.meta);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || 'Failed to load users.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => controller.abort();
  }, [roleFilter, debouncedSearch, page]);

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      const response = await api.post(`/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? response.data.user : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };


  return (
    <AppShell title="Staff & Accounts" eyebrow="Administration">
      <div className="space-y-6 pb-12">
        {error && <Alert>{error}</Alert>}

        {/* Header with actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Manage system administrators, course instructors, and student mobile access records.
            </p>
          </div>
          <Link
            to="/users/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Add User
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <SearchIcon className="h-4 w-4" />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search staff or students by name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">All Account Roles</option>
                <option value="administrator">Admin</option>
                <option value="teacher">Teachers & Instructors</option>
                <option value="student">Students (Mobile)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No users found</h3>
              <p className="mt-1 text-sm text-slate-500">No accounts match the current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Registered
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          {user.profile_photo ? (
                            <img
                              src={getStorageUrl(user.profile_photo)}
                              alt={user.name}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                                roleAvatarGradients[user.role] || 'from-slate-700 to-slate-900'
                              } font-bold text-white text-sm shadow-sm`}
                            >
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/users/${user.id}`}
                              className="font-bold text-slate-900 hover:text-teal-600 transition-colors"
                            >
                              {user.name}
                            </Link>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            roleStyles[user.role] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {user.role === 'administrator' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            user.is_active
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                              : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {user.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/users/${user.id}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            View
                          </Link>
                          <Link
                            to={`/users/${user.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={togglingId === user.id}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                              user.is_active
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {togglingId === user.id ? 'Updating...' : user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-4">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{pagination.from || 0}</span> to{' '}
                <span className="font-bold text-slate-700">{pagination.to || 0}</span> of{' '}
                <span className="font-bold text-slate-700">{pagination.total}</span> accounts
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Previous
                </button>
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
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
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
