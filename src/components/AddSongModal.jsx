import { useState } from 'react';

export default function AddSongModal({ onClose, onAdded }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Tamil');
  const GENRE_OPTIONS = ['Tamil', 'Melody', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'R&B', 'Jazz', 'Classical', 'Indie'];
  const [movieName, setMovieName] = useState('');
  const [duration, setDuration] = useState(180);
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !artist.trim()) {
      setError('Title and artist are required');
      return;
    }
    if (!file) {
      setError('Please select an audio file (MP3)');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);
      if (coverFile) formData.append('cover', coverFile, coverFile.name);
      formData.append('title', title.trim());
      formData.append('artist', artist.trim());
      formData.append('album', album.trim());
      formData.append('genre', genre.trim());
      formData.append('movieName', movieName.trim());
      formData.append('duration', String(duration));
      const { songsApi } = await import('../api');
      await songsApi.upload(formData);
      onAdded?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-surface-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Add Tamil Song</h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Audio file (MP3) *</label>
            <input
              type="file"
              accept=".mp3,.m4a,.wav,.ogg,audio/*"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cover image (optional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0])}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white"
            />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title *"
            required
            className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist *"
            required
            className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album"
            className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            placeholder="Movie name"
            className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-surface-800">{g}</option>
              ))}
            </select>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 180)}
              placeholder="Duration (sec)"
              min={1}
              className="w-24 px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium">
              {loading ? 'Uploading...' : 'Add Song'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
