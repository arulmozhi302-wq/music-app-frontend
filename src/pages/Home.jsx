import { useState, useEffect } from 'react';
import { songsApi } from '../api';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import { usePlayer } from '../context/PlayerContext';

export default function Home() {
  const { play } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      songsApi.list().then((r) => setSongs(r.data)),
      songsApi.recommended().then((r) => setRecommended(r.data)),
      songsApi.genres().then((r) => setGenres(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    import('../api').then(({ playlistsApi }) => playlistsApi.public().then((r) => setPublicPlaylists(r.data)).catch(() => {}));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Recommended for you</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommended.slice(0, 10).map((song) => (
            <button
              key={song._id}
              type="button"
              onClick={() => play(song)}
              className="rounded-xl bg-white/5 overflow-hidden hover:bg-white/10 transition-colors text-left"
            >
              <div className="aspect-square bg-surface-800">
                <img src={song.coverUrl || 'https://picsum.photos/300/300'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="font-medium text-white truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Browse by genre</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <Link
              key={g}
              to={`/search?genre=${encodeURIComponent(g)}`}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-brand-500/30 text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Popular tracks</h2>
        <div className="space-y-1">
          {songs.slice(0, 15).map((song) => (
            <SongCard key={song._id} song={song} />
          ))}
        </div>
      </section>

      {publicPlaylists.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Public playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {publicPlaylists.slice(0, 8).map((pl) => (
              <PlaylistCard key={pl._id} playlist={pl} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
