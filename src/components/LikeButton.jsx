import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { likesApi } from '../api';

export default function LikeButton({ targetType, targetId, likeCount: initialCount }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialCount || 0);

  useEffect(() => {
    if (!user) return;
    likesApi.check(targetType, targetId).then(({ data }) => setLiked(data.liked)).catch(() => {});
  }, [user, targetType, targetId]);

  useEffect(() => {
    setLikeCount(initialCount || 0);
  }, [initialCount]);

  const handleClick = async () => {
    if (!user) return;
    try {
      const { data } = await likesApi.toggle(targetType, targetId);
      setLiked(data.liked);
      setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-2 rounded-lg hover:bg-white/10 flex items-center gap-1 transition-all duration-200 active:scale-90 ${liked ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}
      title={liked ? 'Unlike' : 'Like'}
    >
      <span key={liked ? 'liked' : 'unliked'} className="inline-flex">
        <svg
          className={`w-5 h-5 transition-transform duration-200 hover:scale-110 ${liked ? 'animate-pop' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </span>
      {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
    </button>
  );
}
