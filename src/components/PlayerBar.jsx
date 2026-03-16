import { useRef, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerBar() {
  const { currentTrack, playNext, playPrev, shuffle, repeat, toggleShuffle, toggleRepeat } = usePlayer();
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current?.audio?.current) return;
    const el = playerRef.current.audio.current;
    const handler = () => {
      if (repeat === 'one') {
        el.currentTime = 0;
        el.play();
      } else {
        playNext();
      }
    };
    el.addEventListener('ended', handler);
    return () => el.removeEventListener('ended', handler);
  }, [repeat, playNext, currentTrack?._id]);

  useEffect(() => {
    const t = setTimeout(() => {
      playerRef.current?.audio?.current?.play?.();
    }, 200);
    return () => clearTimeout(t);
  }, [currentTrack?._id]);

  if (!currentTrack) {
    return (
      <div className="hidden md:flex h-20 border-t border-white/10 bg-surface-900 items-center justify-center text-gray-500 text-sm">
        Select a song to play
      </div>
    );
  }

  const src = currentTrack.audioUrl.startsWith('http') ? currentTrack.audioUrl : `${currentTrack.audioUrl}`;

  return (
    <div className="h-20 md:h-24 border-t border-white/10 bg-surface-900 flex items-center px-2 sm:px-4 gap-2 sm:gap-4 fixed md:relative bottom-14 md:bottom-auto left-0 right-0 z-20 md:z-auto">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial md:min-w-[140px]">
        <img
          src="/cover.gif"
          alt=""
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate text-sm md:text-base">{currentTrack.title}</p>
          <p className="text-xs md:text-sm text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0 max-w-2xl">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0 md:mb-1">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`p-1 rounded ${shuffle ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
            title="Shuffle"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-1 1v1H3a2 2 0 00-2 2v6a2 2 0 002 2h1v1a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-1h1a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a1 1 0 00-1-1H5z"/></svg>
          </button>
          <button type="button" onClick={playPrev} className="p-1 text-gray-400 hover:text-white" title="Previous">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/></svg>
          </button>
        <AudioPlayer
            key={currentTrack._id}
            ref={playerRef}
            src={src}
            showJumpControls={false}
            customAdditionalControls={[]}
            customVolumeControls={[]}
            layout="horizontal-reverse"
            className="player-bar-mini"
            style={{ background: 'transparent', boxShadow: 'none' }}
            onEnded={() => {
              if (repeat === 'one' && playerRef.current?.audio?.current) {
                playerRef.current.audio.current.currentTime = 0;
                playerRef.current.audio.current.play();
              } else {
                playNext();
              }
            }}
          />
          <button type="button" onClick={playNext} className="p-1 text-gray-400 hover:text-white" title="Next">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/></svg>
          </button>
          <button
            type="button"
            onClick={toggleRepeat}
            className={`p-1 rounded ${repeat !== 'off' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
            title={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat off'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885 5.002 5.002 0 00-8.716-.676A5 5 0 005 6V3a1 1 0 011-1zm8 12a5 5 0 10-10 0 1 1 0 011 1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd"/></svg>
            {repeat === 'one' && <span className="absolute text-[10px] font-bold">1</span>}
          </button>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 min-w-[120px]">
        <span className="text-xs text-gray-500">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="0.7"
          className="w-20 h-1.5 rounded-full appearance-none bg-gray-600 accent-brand-500"
          onChange={(e) => {
            const el = document.querySelector('.rhap_audio');
            if (el) el.volume = e.target.value;
          }}
        />
      </div>
    </div>
  );
}
