export function getStorageUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;

  // Handle localhost/legacy backend URLs
  if (path.startsWith('http://localhost/') || path.startsWith('http://localhost:80/')) {
    return path.replace(/^http:\/\/localhost(?::80)?/, 'http://127.0.0.1:8001');
  }
  if (path.startsWith('http://127.0.0.1:8000/')) {
    return path.replace('http://127.0.0.1:8000', 'http://127.0.0.1:8001');
  }

  // Already a full external URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative storage path
  if (path.startsWith('/storage/')) {
    return `http://127.0.0.1:8001${path}`;
  }
  if (path.startsWith('storage/')) {
    return `http://127.0.0.1:8001/${path}`;
  }

  return `http://127.0.0.1:8001/storage/${path.replace(/^\/+/, '')}`;
}
