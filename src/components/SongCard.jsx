import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { apiBaseUrl } from '../api';
import LikeButton from './LikeButton';
import ShareButtons from './ShareButtons';
import CommentModal from './CommentModal';
import { useAuth } from '../context/AuthContext';

function formatDuration(raw) {
  if (raw == null) return '0:00';

  // Support "mm:ss"
  if (typeof raw === 'string' && raw.includes(':')) {
    const [mm, ss] = raw.split(':');
    const m = Number(mm);
    const s = Number(ss);
    if (Number.isFinite(m) && Number.isFinite(s)) {
      return `${Math.max(0, Math.floor(m))}:${Math.max(0, Math.floor(s)).toString().padStart(2, '0')}`;
    }
  }

  // Support numeric seconds OR minutes like "3.00"
  const n = typeof raw === 'string' ? Number(raw.trim()) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return '0:00';

  // Heuristic: backend often stores minutes as decimals (e.g., 3.00)
  const looksLikeMinutes = typeof raw === 'string' && raw.includes('.') && n > 0 && n < 60;
  const totalSeconds = looksLikeMinutes ? Math.round(n * 60) : Math.round(n);

  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongCard({ song, showActions = true, onAddToPlaylist, songList }) {
  const { play, currentTrack, isPlaying, togglePlayPause, durationsById } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showComments, setShowComments] = useState(false);
  const isCurrent = currentTrack?._id === song._id;
  const showPlaying = isCurrent && isPlaying;
  const durationValue = durationsById?.[song._id] ?? song.duration;
  const nextUrl = useMemo(() => `${location.pathname}${location.search}`, [location.pathname, location.search]);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
      return;
    }
    const list = Array.isArray(songList) && songList.length > 0 ? songList : [song];
    const idx = list.findIndex((s) => s && s._id === song._id);
    play(list, idx >= 0 ? idx : 0);
  };

  return (
    <>
      <div className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
        <button
          type="button"
          onClick={handlePlay}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-surface-800 transition-transform duration-200 active:scale-95 hover:scale-[1.02]"
        >
          <img src={song.coverUrl || `/sound.gif`} alt="" className="w-full h-full object-cover" />
          <span className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${showPlaying ? 'opacity-100' : ''}`}>
            <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${showPlaying ? 'bg-brand-500 scale-110 animate-pulse-soft' : 'bg-white/90 text-black'}`}>
              {showPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm8 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" /></svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
              )}
            </span>
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate">{song.title}</p>
          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
          {(song.album || song.genre) && (
            <p className="text-xs text-gray-500 truncate">{[song.album, song.genre].filter(Boolean).join(' · ')}</p>
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-300 shrink-0 tabular-nums">{formatDuration(durationValue)}</div>
        {showActions && (
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <LikeButton targetType="song" targetId={song._id} likeCount={song.likeCount} />
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate(`/login?next=${encodeURIComponent(nextUrl)}`);
                  return;
                }
                setShowComments(true);
              }}
              className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-90"
              title={user ? 'Comments' : 'Log in to comment'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <ShareButtons url={window.location.href} title={song.title} text={`${song.title} by ${song.artist}`} />
            <a
              href={`${apiBaseUrl}/songs/${song._id}/download`}
              download={`${(song.title || 'song').replace(/[^a-zA-Z0-9-_]/g, '_')}.mp3`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-90"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
            {onAddToPlaylist && (
              <button
                type="button"
                onClick={() => onAddToPlaylist(song)}
                className="p-2 text-gray-500 hover:text-white hover:text-brand-400 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-90 hover:scale-110"
                title="Add to playlist"
              >
                <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
        )}
      </div>
      {showComments && (
        <CommentModal targetType="song" targetId={song._id} title={song.title} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}
