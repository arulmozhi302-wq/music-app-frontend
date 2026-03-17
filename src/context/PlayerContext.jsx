import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // 0..1
  const [durationsById, setDurationsById] = useState({});
  const prefetchInFlightRef = useRef(new Set());

  const currentTrack = queue[currentIndex] ?? null;

  const play = useCallback((trackOrTracks, index = 0) => {
    if (Array.isArray(trackOrTracks)) {
      setQueue(trackOrTracks);
      setCurrentIndex(Math.min(index, trackOrTracks.length - 1));
    } else {
      setQueue([trackOrTracks]);
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((q) => (q.some((t) => t._id === track._id) ? q : [...q, track]));
  }, []);

  const getNextIndex = useCallback(
    (i) => {
      const len = queue.length;
      if (!len) return 0;
      if (shuffle) {
        if (len === 1) return i;
        let next = i;
        // Avoid repeating the same track when possible
        while (next === i) next = Math.floor(Math.random() * len);
        return next;
      }
      return i + 1;
    },
    [queue.length, shuffle]
  );

  const playNext = useCallback(
    (opts = {}) => {
      const { fromEnded = false } = opts;
      setCurrentIndex((i) => {
        const len = queue.length;
        if (!len) return 0;

        if (!shuffle && i >= len - 1) {
          // End of queue
          if (repeat === 'all') return 0;
          if (fromEnded && repeat === 'off') {
            // Let the UI stop at end (no wrap)
            setIsPlaying(false);
            return i;
          }
          // User clicked Next: wrap for UX even if repeat is off
          return 0;
        }

        return getNextIndex(i) % len;
      });
      if (fromEnded && repeat === 'off') return;
      setIsPlaying(true);
    },
    [queue.length, repeat, shuffle, getNextIndex]
  );

  const playPrev = useCallback(() => {
    setCurrentIndex((i) => {
      const len = queue.length;
      if (!len) return 0;
      if (shuffle) return getNextIndex(i);
      return i <= 0 ? len - 1 : i - 1;
    });
    setIsPlaying(true);
  }, [queue.length, shuffle, getNextIndex]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const pause = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => {
    if (currentTrack) setIsPlaying(true);
  }, [currentTrack?._id]);
  const togglePlayPause = useCallback(() => {
    setIsPlaying((p) => {
      if (!currentTrack) return false;
      return !p;
    });
  }, [currentTrack?._id]);

  const setDurationForTrack = useCallback((id, seconds) => {
    if (!id) return;
    const n = Number(seconds);
    if (!Number.isFinite(n) || n <= 0) return;
    setDurationsById((prev) => (prev[id] === n ? prev : { ...prev, [id]: n }));
  }, []);

  const prefetchDurations = useCallback(
    async (tracks, opts = {}) => {
      const { limit = 6 } = opts;
      const list = Array.isArray(tracks) ? tracks : [];
      if (!list.length) return;

      const candidates = list
        .filter((t) => t && t._id && t.audioUrl)
        .filter((t) => durationsById[t._id] == null)
        .filter((t) => !prefetchInFlightRef.current.has(t._id))
        .slice(0, Math.max(0, limit));

      if (!candidates.length) return;

      const loadOne = (track) =>
        new Promise((resolve) => {
          prefetchInFlightRef.current.add(track._id);

          const audio = document.createElement('audio');
          audio.preload = 'metadata';

          const src = String(track.audioUrl || '');
          audio.src = src;

          const cleanup = () => {
            try {
              audio.removeAttribute('src');
              audio.load();
            } catch {}
            prefetchInFlightRef.current.delete(track._id);
          };

          const onMeta = () => {
            const d = audio.duration;
            if (Number.isFinite(d) && d > 0) setDurationForTrack(track._id, d);
            cleanup();
            resolve();
          };
          const onErr = () => {
            cleanup();
            resolve();
          };

          const timeout = setTimeout(() => {
            cleanup();
            resolve();
          }, 6000);

          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            onMeta();
          });
          audio.addEventListener('error', () => {
            clearTimeout(timeout);
            onErr();
          });
        });

      // Simple sequential prefetch to avoid hammering network
      for (const t of candidates) {
        // eslint-disable-next-line no-await-in-loop
        await loadOne(t);
      }
    },
    [durationsById, setDurationForTrack]
  );

  const value = useMemo(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      shuffle,
      repeat,
      isPlaying,
      volume,
      durationsById,
      play,
      addToQueue,
      playNext,
      playPrev,
      setCurrentIndex,
      toggleShuffle,
      toggleRepeat,
      setVolume,
      pause,
      resume,
      togglePlayPause,
      setIsPlaying,
      setDurationForTrack,
      prefetchDurations,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      shuffle,
      repeat,
      isPlaying,
      volume,
      durationsById,
      play,
      addToQueue,
      playNext,
      playPrev,
      setCurrentIndex,
      toggleShuffle,
      toggleRepeat,
      pause,
      resume,
      togglePlayPause,
      setDurationForTrack,
      prefetchDurations,
    ]
  );

  return (
    <PlayerContext.Provider
      value={value}
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
