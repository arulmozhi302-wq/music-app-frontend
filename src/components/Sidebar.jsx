import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/library', label: 'My Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-full h-full bg-surface-900/80 md:bg-transparent border-r border-white/5 flex flex-col shrink-0">
      <div className="p-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white font-logo">
          <img src="/logo.png" alt="" className="h-8 w-auto object-contain" />
          TuneFlow
        </NavLink>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
            {label}
          </NavLink>
        ))}
      </nav>
      {user ? (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 font-semibold">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-gray-500 hover:text-red-400"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/5 flex gap-2">
          <NavLink to="/login" className="flex-1 py-2 text-center text-sm font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white">
            Log in
          </NavLink>
          <NavLink to="/register" className="flex-1 py-2 text-center text-sm font-medium rounded-lg bg-brand-500 hover:bg-brand-600 text-white">
            Sign up
          </NavLink>
        </div>
      )}
    </aside>
  );
}
