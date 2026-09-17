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
      subtitle="Enter your email, reset token, and choose a new password."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            {message} Redirecting to login...
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-semibold text-slate-700">
            Reset token
          </label>
          <div className="mt-2">
            <input
              id="token"
              name="token"
              type="text"
              required
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="Paste the reset token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            New password
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700">
            Confirm new password
          </label>
          <div className="mt-2">
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              placeholder="Confirm your new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>

        <div className="text-center text-sm">
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
            &larr; Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
