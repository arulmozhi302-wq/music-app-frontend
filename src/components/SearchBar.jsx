import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { songsApi } from '../api';

const FALLBACK_GENRES = ['Tamil', 'Melody', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Latin', 'R&B', 'Country', 'Jazz', 'Classical', 'Indie'];

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [genres, setGenres] = useState(FALLBACK_GENRES);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    songsApi.genres().then((r) => {
      if (r.data?.length) {
        const fromApi = new Set(r.data);
        const merged = [...r.data, ...FALLBACK_GENRES.filter((g) => !fromApi.has(g))].sort();
        setGenres(merged);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setGenre(searchParams.get('genre') || '');
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (genre) params.set('genre', genre);
    navigate(`/search?${params.toString()}`);
  };

  const selectedLabel = genre || 'All genres';

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-w-0 max-w-xl">
      <div className="relative flex flex-1 rounded-xl overflow-hidden bg-surface-800 border border-white/10 focus-within:ring-2 focus-within:ring-brand-500 min-w-0">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="h-full px-3 sm:px-4 py-2.5 flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white border-r border-white/10 min-w-[90px] sm:min-w-[120px]"
          >
            <span className="truncate text-xs sm:text-sm font-medium">{selectedLabel}</span>
            <svg className={`w-4 h-4 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
              <div className="absolute top-full left-0 mt-1 w-48 py-1 rounded-lg bg-surface-800 border border-white/10 shadow-xl z-20 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setGenre(''); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${!genre ? 'text-brand-400 font-medium' : 'text-gray-300'}`}
                >
                  All genres
                </button>
                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGenre(g); setDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${genre === g ? 'text-brand-400 font-medium' : 'text-gray-300'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-gray-500 focus:outline-none min-w-0"
        />
      </div>
      <button type="submit" className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shrink-0 text-sm sm:text-base">
        Search
      </button>
    </form>
  );
}
