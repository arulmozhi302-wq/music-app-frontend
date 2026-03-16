import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import LikeButton from './LikeButton';
import ShareButtons from './ShareButtons';
import CommentModal from './CommentModal';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongCard({ song, showActions = true, onAddToPlaylist }) {
  const { play, currentTrack } = usePlayer();
  const [showComments, setShowComments] = useState(false);
  const isPlaying = currentTrack?._id === song._id;

  return (
    <>
      <div className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
        <button
          type="button"
          onClick={() => play(song)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-surface-800 transition-transform duration-200 active:scale-95 hover:scale-[1.02]"
        >
          <img src={song.coverUrl || `/cover.gif`} alt="" className="w-full h-full object-cover" />
          <span className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isPlaying ? 'opacity-100' : ''}`}>
            <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isPlaying ? 'bg-brand-500 scale-110 animate-pulse-soft' : 'bg-white/90 text-black'}`}>
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
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
        <div className="text-xs sm:text-sm text-gray-500 shrink-0">{formatDuration(song.duration || 0)}</div>
        {showActions && (
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <LikeButton targetType="song" targetId={song._id} likeCount={song.likeCount} />
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-90"
              title="Comments"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <ShareButtons url={window.location.href} title={song.title} text={`${song.title} by ${song.artist}`} />
            <a
              href={`/api/songs/${song._id}/download`}
              download
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
