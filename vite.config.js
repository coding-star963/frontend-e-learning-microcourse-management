import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:8000'

// Tell Laravel which public host/scheme the browser or phone used (localhost:5173,
// a LAN IP, or an ngrok https URL) so the file URLs it returns point back here.
const backendProxy = {
  target: apiTarget,
  changeOrigin: true,
  configure: (proxy) => {
    // Set on the incoming request ('start' runs before the upstream request is
    // built), not in 'proxyReq': with "Expect: 100-continue" uploads the upstream
    // headers are already sent by then.
    proxy.on('start', (req) => {
      const host = req.headers['x-forwarded-host'] || req.headers.host
      const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')
      if (host) req.headers['x-forwarded-host'] = String(host).split(',')[0].trim()
      req.headers['x-forwarded-proto'] = String(proto).split(',')[0].trim()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow the public ngrok URL (see ngrok.bat) to reach the dev server.
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev', '.ngrok.io'],
    proxy: {
      '/api': backendProxy,
      '/storage': backendProxy,
    },
  },
})
