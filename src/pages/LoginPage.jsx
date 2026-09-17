import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Administrator and teacher credentials only. Student accounts must sign in via the mobile application."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}

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
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in to Console'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
