import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { songsApi } from '../api';

const FALLBACK_ALBUMS = [];

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [albums, setAlbums] = useState([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [album, setAlbum] = useState(searchParams.get('album') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    songsApi.albums().then((r) => {
      const list = Array.isArray(r.data) ? r.data : [];
      const clean = list.map((a) => String(a || '').trim()).filter(Boolean);
      const unique = [...new Set(clean)];
      setAlbums(unique.length ? unique : FALLBACK_ALBUMS);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setAlbum(searchParams.get('album') || '');
  }, [searchParams]);

  const queryTrimmed = useMemo(() => query.trim(), [query]);

  // Live navigation: typing updates results below (debounced)
  useEffect(() => {
    // If no filter + no query, stay where you are (Home etc.)
    if (!queryTrimmed && !album) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (queryTrimmed) params.set('q', queryTrimmed);
      if (album) params.set('album', album);
      navigate(`/search?${params.toString()}`, { replace: true });
    }, 250);
    return () => clearTimeout(t);
  }, [navigate, queryTrimmed, album]);

  // Suggestions (optional): show quick results while typing
  useEffect(() => {
    let cancelled = false;
    if (queryTrimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      songsApi
        .search(queryTrimmed)
        .then((r) => {
          if (cancelled) return;
          const data = Array.isArray(r.data) ? r.data : [];
          const filtered = album ? data.filter((s) => s.album === album) : data;
          setSuggestions(filtered.slice(0, 6));
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [queryTrimmed, album]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (queryTrimmed) params.set('q', queryTrimmed);
    if (album) params.set('album', album);
    navigate(`/search?${params.toString()}`);
    setSuggestionsOpen(false);
  };

  const selectedLabel = album || 'All albums';

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-w-0 max-w-xl">
      <div className="relative flex flex-1 rounded-xl overflow-visible bg-surface-800 border border-white/10 focus-within:ring-2 focus-within:ring-brand-500 min-w-0">
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
                  onClick={() => { setAlbum(''); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${!album ? 'text-brand-400 font-medium' : 'text-gray-300'}`}
                >
                  All albums
                </button>
                {albums.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAlbum(a); setDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${album === a ? 'text-brand-400 font-medium' : 'text-gray-300'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          placeholder="Search songs, artists, albums..."
          className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-gray-500 focus:outline-none min-w-0"
        />

        {suggestionsOpen && queryTrimmed.length >= 2 && suggestions.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSuggestionsOpen(false)} aria-hidden="true" />
            <div className="absolute top-full left-[120px] right-0 mt-1 rounded-lg bg-surface-800 border border-white/10 shadow-xl z-20 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setQuery(s.title || '');
                    setSuggestionsOpen(false);
                    const params = new URLSearchParams();
                    if (s.title) params.set('q', s.title);
                    if (album) params.set('album', album);
                    navigate(`/search?${params.toString()}`);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-white truncate">{s.title}</span>
                    <span className="block text-xs text-gray-400 truncate">{[s.artist, s.album, s.genre].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">↵</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <button type="submit" className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shrink-0 text-sm sm:text-base">
        Search
      </button>
    </form>
  );
}
