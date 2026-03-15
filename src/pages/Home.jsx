import { useState, useEffect } from 'react';
import { songsApi } from '../api';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import AddSongModal from '../components/AddSongModal';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { play } = usePlayer();
  const { user } = useAuth();
  const [addSongModal, setAddSongModal] = useState(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [songs, setSongs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [browseSongs, setBrowseSongs] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);

  const loadData = () => {
    setApiError(false);
    setLoading(true);
    Promise.all([
      songsApi.list().then((r) => setSongs(r.data)),
      songsApi.recommended().then((r) => setRecommended(r.data)),
      songsApi.albums().then((r) => setAlbums(r.data || [])).catch(() => {}),
    ])
      .catch((err) => {
        console.error('API error:', err?.message || err);
        setApiError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedAlbum) {
      setBrowseSongs([]);
      return;
    }
    setBrowseLoading(true);
    songsApi.list({ album: selectedAlbum }).then((r) => {
      setBrowseSongs(r.data);
      setBrowseLoading(false);
    }).catch(() => setBrowseLoading(false));
  }, [selectedAlbum]);

  useEffect(() => {
    import('../api').then(({ playlistsApi }) => playlistsApi.public().then((r) => setPublicPlaylists(r.data)).catch(() => {}));
  }, []);

  useEffect(() => {
    if (!showAddedToast) return;
    const t = setTimeout(() => setShowAddedToast(false), 3000);
    return () => clearTimeout(t);
  }, [showAddedToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="home-bg-circles absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="vinyl-accent" />
        <div className="vinyl-accent" />
        <div className="vinyl-accent" />
      </div>
      <div className="relative z-10 flex flex-col gap-6 sm:gap-8 animate-fade-in">
      {apiError && (
        <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <svg className="w-6 h-6 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-amber-200">Backend not connected</p>
            <p className="text-sm text-amber-200/80 mt-0.5">
              {typeof window !== 'undefined' && !/^localhost$|^127\.0\.0\.1$/.test(window.location.hostname)
                ? <>Set <code className="bg-black/30 px-1 py-0.5 rounded">VITE_API_URL</code> in Vercel to your backend URL (e.g. <code className="bg-black/30 px-1 py-0.5 rounded">https://your-backend.vercel.app/api</code>). Redeploy the frontend, then click Retry.</>}
                : <>Start the API server: <code className="bg-black/30 px-1.5 py-0.5 rounded">cd backend && npm run dev</code></>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadData()}
            className="px-4 py-2 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-medium text-sm shrink-0"
          >
            Retry
          </button>
        </div>
      )}

        <section className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-white shrink-0 w-full sm:w-auto sm:mb-0 mb-1">Browse</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${!selectedAlbum ? 'bg-brand-500 text-white' : 'bg-white/10 hover:bg-brand-500/30 text-gray-300 hover:text-white'}`}
              >
                All
              </button>
              {albums.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setSelectedAlbum(a)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 truncate max-w-[140px] sm:max-w-none ${selectedAlbum === a ? 'bg-brand-500 text-white' : 'bg-white/10 hover:bg-brand-500/30 text-gray-300 hover:text-white'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          {user && (
            <button
              type="button"
              onClick={() => setShowAddSong(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Tamil Song
            </button>
          )}
        </section>

        <section className="flex-1 min-w-0 flex flex-col">
      {selectedAlbum ? (
        <section className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">{selectedAlbum}</h2>
          {browseLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : browseSongs.length === 0 ? (
            <p className="text-gray-500 py-8">No songs in this album.</p>
          ) : (
            <div className="space-y-1">
              {browseSongs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onAddToPlaylist={user ? () => setAddSongModal(song) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">
      <section className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Recommended for you</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {recommended.slice(0, 10).map((song) => (
            <div key={song._id} className="relative group">
              <button
                type="button"
                onClick={() => play(song)}
                className="w-full rounded-xl bg-white/5 overflow-hidden hover:bg-white/10 transition-colors text-left"
              >
                <div className="aspect-square bg-surface-800">
                  <img src={song.coverUrl || `https://picsum.photos/seed/${song._id}/300/300`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-2 sm:p-3">
                  <p className="font-medium text-white truncate">{song.title}</p>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAddSongModal(song); }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-brand-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Add to playlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      

      <section className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Popular tracks</h2>
        <div className="space-y-1">
          {songs.slice(0, 15).map((song) => (
            <SongCard
              key={song._id}
              song={song}
              onAddToPlaylist={user ? () => setAddSongModal(song) : undefined}
            />
          ))}
        </div>
      </section>

      {publicPlaylists.length > 0 && (
        <section className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Public playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {publicPlaylists.slice(0, 8).map((pl) => (
              <PlaylistCard key={pl._id} playlist={pl} />
            ))}
          </div>
        </section>
      )}
        </div>
      )}
        </section>
      </div>

      {addSongModal && (
        <AddToPlaylistModal
          song={addSongModal}
          onClose={() => setAddSongModal(null)}
          onAdded={() => setAddSongModal(null)}
        />
      )}
      {showAddedToast && (
        <div className="fixed top-4 right-4 z-[60] animate-toast-right flex items-center gap-3 px-5 py-3 rounded-xl bg-brand-500/95 text-white shadow-lg shadow-brand-500/30 border border-white/20">
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pop">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </span>
          <span className="font-medium">Song added successfully!</span>
        </div>
      )}
      {showAddSong && (
        <AddSongModal
          onClose={() => setShowAddSong(false)}
          onAdded={() => {
            setShowAddSong(false);
            setShowAddedToast(true);
            Promise.all([
              songsApi.list().then((r) => setSongs(r.data)),
              songsApi.recommended().then((r) => setRecommended(r.data)),
              songsApi.albums().then((r) => setAlbums(r.data || [])).catch(() => {}),
            ]).catch(() => {});
            if (selectedAlbum) {
              songsApi.list({ album: selectedAlbum }).then((r) => setBrowseSongs(r.data)).catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
}
