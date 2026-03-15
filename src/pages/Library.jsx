import { useState, useEffect } from 'react';
import { playlistsApi } from '../api';
import PlaylistCard from '../components/PlaylistCard';

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = () => playlistsApi.mine().then((r) => setPlaylists(r.data)).catch(console.error);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await playlistsApi.create({ name: newName.trim(), description: newDesc.trim() });
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">My Library</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium"
        >
          New playlist
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createPlaylist} className="p-4 rounded-xl bg-surface-800 border border-white/10 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist name"
            className="w-full px-4 py-2 rounded-lg bg-surface-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 rounded-lg bg-surface-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium">Create</button>
            <button type="button" onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white">Cancel</button>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <p className="text-gray-500">You have no playlists yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl._id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
}
