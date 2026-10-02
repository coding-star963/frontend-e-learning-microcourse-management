# Frontend — Web Admin / Teacher Portal

React 19 + Vite + Tailwind CSS portal for administrators and teachers. Students use the mobile app instead.

See the [project README](../README.md) for full setup and demo accounts.

```bash
npm install
npm run dev     # http://localhost:5173 (proxies /api and /storage to http://127.0.0.1:8000)
npm run lint
npm run build
```

- Pages: `src/pages/`, API calls: `src/services/` (axios client in `src/services/api.js`), auth state: `src/contexts/AuthContext.jsx`.
- Set `VITE_API_TARGET` to proxy to a different API address.
