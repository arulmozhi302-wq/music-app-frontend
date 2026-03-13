import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsApi } from '../api';

export default function CommentModal({ targetType, targetId, title, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commentsApi.list(targetType, targetId).then(({ data }) => { setComments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [targetType, targetId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    try {
      const { data } = await commentsApi.add({ targetType, targetId, text: text.trim() });
      setComments((c) => [data, ...c]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      await commentsApi.remove(id);
      setComments((c) => c.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-surface-900 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Comments — {title}</h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-medium shrink-0">
                  {c.user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400">{c.user?.username}</p>
                  <p className="text-white text-sm">{c.text}</p>
                </div>
                {user?._id === c.user?._id && (
                  <button type="button" onClick={() => remove(c._id)} className="text-gray-500 hover:text-red-400 text-xs">Delete</button>
                )}
              </div>
            ))
          )}
        </div>
        {user && (
          <form onSubmit={submit} className="p-4 border-t border-white/10">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" className="mt-2 w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm">
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
