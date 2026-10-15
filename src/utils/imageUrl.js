// /storage is proxied to the Laravel API by the Vite dev server, so files are
// loaded from the same origin as the page. That works on localhost, a LAN IP
// and a public ngrok URL alike.
const LEGACY_BACKEND = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::(?:80|8000|8001))?(?=\/)/;

export function getStorageUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;

  // Backend URLs built for localhost -> same-origin path
  if (LEGACY_BACKEND.test(path)) {
    return path.replace(LEGACY_BACKEND, '');
  }

  // Already a full external URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative storage path
  if (path.startsWith('/storage/')) {
    return path;
  }
  if (path.startsWith('storage/')) {
    return `/${path}`;
  }

  return `/storage/${path.replace(/^\/+/, '')}`;
}
