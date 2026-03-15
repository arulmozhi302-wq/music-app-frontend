import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';
import ShareButtons from './ShareButtons';
import CommentModal from './CommentModal';
import { useState } from 'react';

export default function PlaylistCard({ playlist }) {
  const [showComments, setShowComments] = useState(false);
  const coverUrl = playlist.coverUrl || (playlist.songs?.[0]?.coverUrl) || `https://picsum.photos/seed/${playlist._id}/200/200`;
  const songCount = playlist.songs?.length ?? 0;

  return (
    <>
      <Link
        to={`/playlist/${playlist._id}`}
        className="block p-2 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
      >
        <div className="aspect-square rounded-lg overflow-hidden bg-surface-800 mb-2 sm:mb-3">
          <img src={coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
        <h3 className="font-medium text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-500">{songCount} song{songCount !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1 mt-2" onClick={(e) => e.preventDefault()}>
          <LikeButton targetType="playlist" targetId={playlist._id} likeCount={playlist.likeCount} />
          <button type="button" onClick={() => setShowComments(true)} className="p-2 text-gray-500 hover:text-white rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </button>
          <ShareButtons url={typeof window !== 'undefined' ? `${window.location.origin}/playlist/${playlist._id}` : ''} title={playlist.name} />
        </div>
      </Link>
      {showComments && (
        <CommentModal targetType="playlist" targetId={playlist._id} title={playlist.name} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}
