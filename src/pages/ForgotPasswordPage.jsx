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
      title="Reset password"
      subtitle="Enter your email address to receive password reset instructions."
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && <Alert>{error}</Alert>}
        {message && (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            <p>{message}</p>
            {token && (
              <div className="mt-3">
                <p className="font-semibold text-slate-900">Your Reset Token:</p>
                <code className="mt-1 block break-all rounded bg-white p-2 text-xs text-slate-800 border border-teal-200">
                  {token}
                </code>
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)}
                  className="mt-3 inline-block rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Proceed to Reset Password &rarr;
                </button>
              </div>
            )}
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

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending request...' : 'Send reset instructions'}
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
