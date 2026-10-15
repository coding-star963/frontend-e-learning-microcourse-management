import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import api from '../services/api';

export default function ResetPasswordPage() {
  // Set by the forgot-password page after the email is verified.
  const { email = '', token = '' } = useLocation().state || {};
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message || 'Your password has been reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = errors ? Object.values(errors)[0]?.[0] : null;
        setError(firstError || err.response.data.message || 'Validation failed.');
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <AuthLayout title="Set new password" subtitle="Enter your email first to reset your password.">
        <div className="mt-8 space-y-5 text-center">
          <Link
            to="/forgot-password"
            className="inline-block text-sm font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            Go to Forgot Password &rarr;
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle={`Choose a new password for ${email}.`}
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4 text-sm text-teal-300">
            {message} Redirecting to login...
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            New password
          </label>
          <div className="relative mt-2">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Confirm new password
          </label>
          <div className="relative mt-2">
            <PasswordInput
              id="password_confirmation"
              name="password_confirmation"
              autoComplete="new-password"
              required
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="Re-enter password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Resetting password...' : 'Update Password & Sign In'}
        </button>

        <div className="text-center text-sm pt-2">
          <Link to="/login" className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
            &larr; Return to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
