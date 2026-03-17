import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      const next = searchParams.get('next');
      navigate(next || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg auth-bg-images p-4 min-h-screen min-h-[100dvh]">
      <div className="vinyl-accent" aria-hidden="true" />
      <div className="vinyl-accent" aria-hidden="true" />
      <div className="vinyl-accent" aria-hidden="true" />
      <div className="auth-bg-notes" aria-hidden="true">
        <span>♪</span><span>♫</span><span>♪</span><span>♫</span><span>♪</span><span>♫</span><span>♪</span>
      </div>
      <div className="relative z-10 w-full max-w-md px-1">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold mb-8 font-logo">
          <img src="/logo.png" alt="" className="h-10 w-auto object-contain" />
          TuneFlow
        </Link>
        <div className="rounded-2xl bg-surface-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-brand-500/10 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-white mb-6">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              minLength={2}
              className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-brand-400 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
