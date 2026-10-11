import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevToken('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message || 'Password reset instructions have been sent to your email address.');
      // Only returned when the backend runs locally (no real email is sent).
      setDevToken(response.data.dev_token || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered admin email address to receive password reset instructions."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && devToken && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4 text-sm text-teal-300">
            <p className="font-semibold">{message}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-teal-400">Reset token</p>
            <p className="mt-1 break-all rounded-lg bg-slate-900/80 p-2 font-mono text-xs text-teal-200">{devToken}</p>
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(devToken)}`}
              className="mt-3 inline-block text-xs font-bold underline hover:text-teal-300"
            >
              Continue to reset password &rarr;
            </Link>
          </div>
        )}
        {message && !devToken && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4 text-sm text-teal-300">
            <p className="font-semibold">{message}</p>
            <p className="mt-2 text-xs text-teal-400">
              Open the link in the email, or{' '}
              <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="font-bold underline hover:text-teal-300">
                enter the reset token here
              </Link>
              .
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Admin email address
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

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending request...' : 'Send Reset Instructions'}
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
