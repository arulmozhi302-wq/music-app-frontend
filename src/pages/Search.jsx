import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { songsApi } from '../api';
import SongCard from '../components/SongCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q || '');

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    if (genre) {
      setLoading(true);
      songsApi.list({ genre }).then((r) => { setResults(r.data); setLoading(false); }).catch(() => setLoading(false));
      return;
    }
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    songsApi.search(q).then((r) => { setResults(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [q, genre]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
    else setSearchParams({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-semibold text-white">Search</h1>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by song, artist, album, movie..."
          className="flex-1 px-4 py-3 rounded-xl bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium">
          Search
        </button>
      </form>
      {genre && <p className="text-gray-400">Genre: <span className="text-white font-medium">{genre}</span></p>}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-500 py-8">No results. Try a different search or browse by genre on Home.</p>
      ) : (
        <div className="space-y-1">
          {results.map((song) => (
            <SongCard key={song._id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
