import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import AppShell from '../components/AppShell';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../hooks/useAuth';
import { useLiveSync } from '../hooks/useLiveSync';
import { getStorageUrl } from '../utils/imageUrl';
import {
  accountActionConfirm,
  accountStatusBadge,
  accountStatusLabels,
  accountStatusOf,
  FROZEN_HINT,
} from '../utils/accountStatus';

const accountActionPaths = {
  suspend: 'suspend',
  unsuspend: 'unsuspend',
  deactivate: 'toggle-status',
  activate: 'toggle-status',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const isSelf = String(currentUser?.id) === String(id);
  const status = accountStatusOf(user);

  useLiveSync(() => setReloadKey((k) => k + 1));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, reloadKey]);

  const runAccountAction = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/users/${id}/${accountActionPaths[pendingAction]}`);
      setUser(response.data.user);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <AppShell title="User details" eyebrow="Management">
        <div className="text-sm text-slate-500">Loading user...</div>
      </AppShell>
    );
  }

  if (error && !user) {
    return (
      <AppShell title="User details" eyebrow="Management">
        <Alert>{error}</Alert>
        <div className="mt-4">
          <Link to="/users" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            &larr; Back to users
          </Link>
        </div>
      </AppShell>
    );
  }

  const roleBadge = (role) => {
    const styles = {
      administrator: 'bg-purple-50 text-purple-700',
      teacher: 'bg-blue-50 text-blue-700',
      student: 'bg-teal-50 text-teal-700',
    };
    return styles[role] || 'bg-slate-50 text-slate-700';
  };

  return (
    <AppShell title="User details" eyebrow="Management">
      <div className="max-w-3xl space-y-6">
        {error && <Alert>{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        {status === 'deactivated' && <Alert>{FROZEN_HINT}</Alert>}
        {pendingAction && (
          <ConfirmModal
            {...accountActionConfirm(pendingAction, user)}
            busy={busy}
            onConfirm={runAccountAction}
            onCancel={() => setPendingAction(null)}
          />
        )}

        {/* User header card */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user?.profile_photo ? (
                <img
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-teal-500/20 shadow-md"
                  src={getStorageUrl(user.profile_photo)}
                  alt={user.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md ring-4 ring-slate-100">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-950">{user?.name}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(user?.role)}`}>
                    {user?.role === 'administrator' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${accountStatusBadge[status]}`}>
                    {accountStatusLabels[status]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {user?.role === 'student' && (
                <Link
                  to={`/progress/students/${id}`}
                  className="rounded-lg bg-teal-50 border border-teal-200 px-3.5 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
                >
                  View Progress Telemetry
                </Link>
              )}
              {status !== 'deactivated' && (
                <Link
                  to={`/users/${id}/edit`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Edit user
                </Link>
              )}
              {/* The signed-in administrator cannot suspend or deactivate themself. */}
              {!isSelf && status === 'active' && (
                <button
                  type="button"
                  onClick={() => setPendingAction('suspend')}
                  className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  Suspend
                </button>
              )}
              {!isSelf && status === 'suspended' && (
                <button
                  type="button"
                  onClick={() => setPendingAction('unsuspend')}
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Reactivate
                </button>
              )}
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setPendingAction(user?.is_active ? 'deactivate' : 'activate')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    user?.is_active
                      ? 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
                      : 'border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {user?.is_active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account information */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="border-b border-slate-200 pb-5">
            <h3 className="text-lg font-bold text-slate-950">Account information</h3>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">User ID</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Full name</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email address</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Role</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-slate-950">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Account status</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">
                {accountStatusLabels[status]}
                {status === 'suspended' && user?.suspended_at && (
                  <span className="font-normal text-slate-500"> since {new Date(user.suspended_at).toLocaleString()}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Member since</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last updated</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">
                {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Back link */}
        <div>
          <Link to="/users" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            &larr; Back to users
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
