import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import { enrollmentService } from '../services/enrollmentService';
import { useLiveSync } from '../hooks/useLiveSync';
import { getStorageUrl } from '../utils/imageUrl';
import { enrollmentActionConfirm, enrollmentActionStatus } from '../utils/enrollmentActions';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

export default function EnrollmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const silentRef = useRef(false);

  // Progress the student makes in the mobile app shows up without a reload.
  useLiveSync(() => {
    silentRef.current = true;
    setReloadKey((k) => k + 1);
  });

  useEffect(() => {
    const silent = silentRef.current;
    silentRef.current = false;

    const fetchEnrollment = async () => {
      try {
        const response = await enrollmentService.getById(id);
        setEnrollment(response.data.data);
        if (!silent) setProgressInput(String(response.data.data.progress));
      } catch {
        // A silent refresh after the record was deleted elsewhere shows "not found".
        if (silent) setEnrollment(null);
        else setError('Failed to load enrollment.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [id, reloadKey]);

  // Runs the action the user confirmed in the modal.
  const runAction = async () => {
    const action = pendingAction;
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      if (action === 'delete') {
        await enrollmentService.delete(id);
        navigate('/enrollments');
        return;
      }

      if (action === 'progress') {
        const response = await enrollmentService.update(id, { progress: parseFloat(progressInput) });
        setSuccess('Progress updated successfully.');
        setEnrollment(response.data.enrollment);
        return;
      }

      const response = await enrollmentService.update(id, { status: enrollmentActionStatus[action] });
      setSuccess(response.data.message);
      setEnrollment(response.data.enrollment);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} enrollment.`);
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  const handleAction = (action) => setPendingAction(action);

  const handleProgressUpdate = () => {
    const value = parseFloat(progressInput);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError('Progress must be a number from 0 to 100.');
      return;
    }
    setPendingAction('progress');
  };

  if (loading) {
    return (
      <AppShell title="Enrollment Details" eyebrow="Enrollment Management">
        <div className="text-center text-sm text-slate-500">Loading enrollment...</div>
      </AppShell>
    );
  }

  if (!enrollment) {
    return (
      <AppShell title="Enrollment Details" eyebrow="Enrollment Management">
        <Alert type="error">Enrollment not found. It may have been deleted.</Alert>
        <div className="mt-4">
          <Link to="/enrollments" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to enrollments
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Enrollment Details" eyebrow="Enrollment Management">
      <div className="mx-auto max-w-3xl space-y-6">
        {pendingAction && (
          <ConfirmModal
            {...enrollmentActionConfirm(pendingAction, enrollment, { progress: parseFloat(progressInput) })}
            busy={busy}
            onConfirm={runAction}
            onCancel={() => setPendingAction(null)}
          />
        )}
        <div className="flex items-center justify-between">
          <Link to="/enrollments" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to enrollments
          </Link>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-2xl font-bold text-slate-950">Enrollment #{enrollment.id}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[enrollment.status]}`}>
                {enrollment.status}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Student Information</h3>
                <div className="rounded-2xl bg-slate-50 p-4 flex items-center gap-4">
                  {enrollment.user?.profile_photo ? (
                    <img
                      src={getStorageUrl(enrollment.user.profile_photo)}
                      alt={enrollment.user.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-200 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-bold text-white text-lg shadow-sm ring-2 ring-teal-100">
                      {enrollment.user?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">{enrollment.user?.name}</p>
                    <p className="text-xs text-slate-500">{enrollment.user?.email}</p>
                    <p className="mt-1 inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-teal-700 ring-1 ring-teal-600/20">
                      {enrollment.user?.role === 'student' ? 'Student' : enrollment.user?.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Course Information</h3>
                <div className="rounded-lg bg-slate-50 p-4">
                  <Link
                    to={`/courses/${enrollment.course?.slug}`}
                    className="font-semibold text-teal-600 hover:underline"
                  >
                    {enrollment.course?.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {enrollment.course?.category?.name || 'Uncategorized'}
                  </p>
                  <p className="text-xs text-slate-400">
                    by {enrollment.course?.teacher?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{enrollment.progress}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    min="0"
                    max="100"
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleProgressUpdate}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Enrolled</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Completed</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : 'Not completed'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Last Accessed</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {enrollment.last_accessed_at ? new Date(enrollment.last_accessed_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Created</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {new Date(enrollment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
              {enrollment.status === 'active' && (
                <>
                  <button
                    onClick={() => handleAction('complete')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => handleAction('suspend')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleAction('cancel')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              {(enrollment.status === 'cancelled' || enrollment.status === 'suspended') && (
                <button
                  onClick={() => handleAction('activate')}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Reactivate
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
