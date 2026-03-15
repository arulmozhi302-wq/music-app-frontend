import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
};

export const songsApi = {
  list: (params) => api.get('/songs', { params }),
  search: (q) => api.get('/songs/search', { params: { q } }),
  genres: () => api.get('/songs/genres'),
  albums: () => api.get('/songs/albums'),
  recommended: () => api.get('/songs/recommended'),
  getById: (id) => api.get(`/songs/${id}`),
  upload: (formData) => api.post('/songs/upload', formData, { timeout: 60000 }),
};

export const playlistsApi = {
  mine: () => api.get('/playlists'),
  public: () => api.get('/playlists/public'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.patch(`/playlists/${id}`, data),
  addSong: (playlistId, songId) => api.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSong: (playlistId, songId) => api.delete(`/playlists/${playlistId}/songs/${songId}`),
  delete: (id) => api.delete(`/playlists/${id}`),
};

export const commentsApi = {
  list: (targetType, targetId) => api.get('/comments', { params: { targetType, targetId } }),
  add: (data) => api.post('/comments', data),
  remove: (id) => api.delete(`/comments/${id}`),
};

export const likesApi = {
  toggle: (targetType, targetId) => api.post('/likes/toggle', { targetType, targetId }),
  check: (targetType, targetId) => api.get('/likes/check', { params: { targetType, targetId } }),
  userLikes: () => api.get('/likes/user'),
};

export default api;
