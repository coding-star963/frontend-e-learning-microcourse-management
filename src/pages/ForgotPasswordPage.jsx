import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message || 'Password reset token generated successfully.');
      if (response.data.token) {
        setToken(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered staff email address to receive password reset instructions."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4 text-sm text-teal-300">
            <p className="font-semibold">{message}</p>
            {token && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wider text-teal-400 font-bold">Your Reset Token:</p>
                <code className="mt-1 block break-all rounded-xl bg-slate-950 p-2.5 text-xs text-teal-200 border border-teal-500/20 font-mono">
                  {token}
                </code>
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110"
                >
                  Proceed to Reset Password &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Staff email address
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
          {loading ? 'Sending request...' : 'Generate Reset Token'}
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
