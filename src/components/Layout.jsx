import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PlayerBar from './PlayerBar';
import SearchBar from './SearchBar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] bg-surface-950">
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Overlay when sidebar open on mobile */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
            sidebarOpen ? 'bg-black/60' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-200 ease-out md:relative md:z-auto md:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/5 flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-gray-400 hover:text-white rounded-lg shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <SearchBar />
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-32 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
      <BottomNav />
    </div>
  );
}
