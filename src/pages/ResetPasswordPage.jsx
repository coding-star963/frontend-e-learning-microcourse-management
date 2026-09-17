import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [token, setToken] = useState(() => searchParams.get('token') || '');
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
        setError(err.response?.data?.message || 'Failed to reset password. Please verify your token and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your email, reset token, and choose a strong new password."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4 text-sm text-teal-300">
            {message} Redirecting to login...
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Email address
          </label>
          <div className="relative mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="token" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Reset token
          </label>
          <div className="relative mt-2">
            <input
              id="token"
              name="token"
              type="text"
              required
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="Paste token received"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            New password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type="password"
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
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
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
