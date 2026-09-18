const BACKEND_URL = (import.meta.env.VITE_API_TARGET || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export function getStorageUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;

  // Handle localhost/legacy backend URLs
  if (path.startsWith('http://localhost/') || path.startsWith('http://localhost:80/')) {
    return path.replace(/^http:\/\/localhost(?::80)?/, BACKEND_URL);
  }
  if (path.startsWith('http://127.0.0.1:8001/')) {
    return path.replace('http://127.0.0.1:8001', BACKEND_URL);
  }
  if (path.startsWith('http://127.0.0.1:8000/')) {
    return path.replace('http://127.0.0.1:8000', BACKEND_URL);
  }

  // Already a full external URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative storage path
  if (path.startsWith('/storage/')) {
    return `${BACKEND_URL}${path}`;
  }
  if (path.startsWith('storage/')) {
    return `${BACKEND_URL}/${path}`;
  }

  return `${BACKEND_URL}/storage/${path.replace(/^\/+/, '')}`;
}
