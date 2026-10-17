import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { teacherService } from '../services/teacherService';
import { useDebounce } from '../hooks/useDebounce';
import { useLiveSync } from '../hooks/useLiveSync';
import { accountStatusBadge, accountStatusLabels, accountStatusOf } from '../utils/accountStatus';
import { PlusIcon, SearchIcon, TeachersIcon } from '../components/Icons';
import { getStorageUrl } from '../utils/imageUrl';

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);
  const debouncedSearch = useDebounce(search, 300);

  useLiveSync(() => {
    silentRef.current = true;
    setReloadKey((k) => k + 1);
  });

  useEffect(() => {
    let ignore = false;
    const silent = silentRef.current;
    silentRef.current = false;

    const loadTeachers = async () => {
      if (!silent) setLoading(true);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        const response = await teacherService.getAll(params);
        if (!ignore) setTeachers(response.data.data);
      } catch {
        if (!ignore) setError('Failed to load teachers.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadTeachers();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, reloadKey]);

  return (
    <AppShell title="Teacher Management" eyebrow="Administration">
      <div className="space-y-6 pb-12">
        {error && <Alert>{error}</Alert>}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Teachers listed here can be assigned to courses when creating or editing a course.
          </p>
          <Link
            to="/users/create?role=teacher&return=teachers"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Add Teacher
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <SearchIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teachers by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <TeachersIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No teachers found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search ? `No teachers match "${search}".` : 'Add a teacher so courses can be assigned to them.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Teacher</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Courses</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {teacher.profile_photo ? (
                            <img
                              src={getStorageUrl(teacher.profile_photo)}
                              alt={teacher.name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                              {teacher.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{teacher.name}</p>
                            <p className="text-xs text-slate-500">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {teacher.courses_count} course{teacher.courses_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            accountStatusBadge[accountStatusOf(teacher)]
                          }`}
                        >
                          {accountStatusLabels[accountStatusOf(teacher)]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {new Date(teacher.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/users/${teacher.id}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            View
                          </Link>
                          <Link
                            to={`/users/${teacher.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-50 transition"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
