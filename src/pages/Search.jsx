import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { songsApi } from '../api';
import SongCard from '../components/SongCard';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export default function Search() {
  const { user } = useAuth();
  const { prefetchDurations } = usePlayer();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const album = searchParams.get('album') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSongModal, setAddSongModal] = useState(null);

  const browseParams = { genre: genre || undefined, album: album || undefined };
  const hasBrowseFilter = genre || album;

  useEffect(() => {
    if (hasBrowseFilter && !q.trim()) {
      setLoading(true);
      songsApi.list(browseParams).then((r) => { setResults(r.data); setLoading(false); }).catch(() => setLoading(false));
      return;
    }
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    songsApi.search(q).then((r) => {
      let data = r.data;
      if (genre) data = data.filter((s) => s.genre === genre);
      if (album) data = data.filter((s) => s.album === album);
      setResults(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [q, genre, album]);

  useEffect(() => {
    if (results?.length) prefetchDurations(results);
  }, [results, prefetchDurations]);

  const handleAddToPlaylist = user ? (song) => setAddSongModal(song) : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-semibold text-white">Search</h1>
      <p className="text-gray-400">Use the search bar above to find songs, or browse by genre or album on Home.</p>
      {hasBrowseFilter && !q && (
        <p className="text-gray-400">
          Browsing: <span className="text-white font-medium">{[genre && `Genre: ${genre}`, album && `Album: ${album}`].filter(Boolean).join(' · ')}</span>
        </p>
      )}
      {q && (
        <p className="text-gray-400">
          Results for &quot;{q}&quot;
          {hasBrowseFilter && <> in {[genre, album].filter(Boolean).join(', ')}</>}
        </p>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-500 py-8">No results. Try a different search or browse by genre on Home.</p>
      ) : (
        <div className="space-y-1">
          {results.map((song) => (
            <SongCard
              key={song._id}
              song={song}
              onAddToPlaylist={handleAddToPlaylist}
            />
          ))}
        </div>
      )}

      {addSongModal && (
        <AddToPlaylistModal
          song={addSongModal}
          onClose={() => setAddSongModal(null)}
          onAdded={() => setAddSongModal(null)}
        />
      )}
    </div>
  );
}
