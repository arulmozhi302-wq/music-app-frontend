import { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'

  const currentTrack = queue[currentIndex] ?? null;

  const play = useCallback((trackOrTracks, index = 0) => {
    if (Array.isArray(trackOrTracks)) {
      setQueue(trackOrTracks);
      setCurrentIndex(Math.min(index, trackOrTracks.length - 1));
    } else {
      setQueue([trackOrTracks]);
      setCurrentIndex(0);
    }
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((q) => (q.some((t) => t._id === track._id) ? q : [...q, track]));
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (shuffle) return Math.floor(Math.random() * queue.length);
      return i >= queue.length - 1 ? 0 : i + 1;
    });
  }, [queue.length, shuffle]);

  const playPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? queue.length - 1 : i - 1));
  }, [queue.length]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        shuffle,
        repeat,
        play,
        addToQueue,
        playNext,
        playPrev,
        setCurrentIndex,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
