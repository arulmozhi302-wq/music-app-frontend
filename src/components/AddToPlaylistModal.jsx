import { useState, useEffect } from 'react';
import { playlistsApi } from '../api';

export default function AddToPlaylistModal({ song, currentPlaylistId, onClose, onAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playlistsApi.mine().then((r) => setPlaylists(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addTo = async (playlistId) => {
    try {
      await playlistsApi.addSong(playlistId, song._id);
      onAdded?.();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-surface-900 rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Add to playlist</h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">✕</button>
        </div>
        <p className="px-4 py-2 text-sm text-gray-400 truncate">Adding: {song.title}</p>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-gray-500 text-sm">Create a playlist in My Library first.</p>
          ) : (
            playlists.map((pl) => {
              const hasSong = pl.songs?.some((s) => s._id === song._id || s === song._id);
              return (
                <button
                  key={pl._id}
                  type="button"
                  onClick={() => !hasSong && addTo(pl._id)}
                  disabled={hasSong}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    hasSong ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {pl.name} {hasSong && '(already in playlist)'}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
