import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playlistsApi } from '../api';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { play, prefetchDurations } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addSongModal, setAddSongModal] = useState(null);

  useEffect(() => {
    if (!id) return;
    playlistsApi.getById(id).then((r) => setPlaylist(r.data)).catch(() => setPlaylist(null)).finally(() => setLoading(false));
  }, [id]);

  const removeSong = async (songId) => {
    if (!user || playlist.owner._id !== user._id) return;
    try {
      const { data } = await playlistsApi.removeSong(id, songId);
      setPlaylist(data);
    } catch (e) {
      console.error(e);
    }
  };

  const isOwner = user && playlist?.owner?._id === user._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return <p className="text-gray-500">Playlist not found.</p>;
  }

  const songs = playlist.songs || [];
  const coverUrl = playlist.coverUrl || songs[0]?.coverUrl || `https://picsum.photos/seed/${playlist._id}/400/400`;

  useEffect(() => {
    if (songs?.length) prefetchDurations(songs);
  }, [songs, prefetchDurations]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end">
        <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-surface-800 shrink-0">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left w-full">
          <p className="text-sm text-gray-400 uppercase tracking-wider">Playlist</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">{playlist.name}</h1>
          {playlist.description && <p className="text-gray-400 mt-1">{playlist.description}</p>}
          <p className="text-sm text-gray-500 mt-2">{playlist.owner?.username} · {songs.length} song{songs.length !== 1 ? 's' : ''}</p>
          <div className="flex justify-center sm:justify-start gap-2 mt-4">
            <button
              type="button"
              onClick={() => songs.length && play(songs)}
              className="px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-medium flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
              </span>
              Play all
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {songs.map((song) => (
          <div key={song._id} className="group flex items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <SongCard song={song} songList={songs} showActions onAddToPlaylist={user ? () => setAddSongModal(song) : undefined} />
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={() => removeSong(song._id)}
                className="p-2 text-gray-500 hover:text-red-400 rounded-lg shrink-0"
                title="Remove from playlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {addSongModal && (
        <AddToPlaylistModal
          song={addSongModal}
          currentPlaylistId={id}
          onClose={() => setAddSongModal(null)}
          onAdded={() => { playlistsApi.getById(id).then((r) => setPlaylist(r.data)); setAddSongModal(null); }}
        />
      )}
    </div>
  );
}
