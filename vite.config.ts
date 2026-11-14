import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { tracklistEditor } from './tracklist-editor'

// https://vitejs.dev/config/
export default defineConfig({
  // tracklistEditor: the tracklist's edit mode saves into tracks.ts (dev server only)
  plugins: [svelte(), tracklistEditor()],
  server: {
    // data.wearedogs.net is referer-gated to wearedogs.net/captainbrando.com only,
    // so localhost can't hit it directly. In dev the app requests same-origin /music/*
    // and this proxy forwards it with an allowed referer. No CORS involved.
    proxy: {
      '/music': {
        target: 'https://data.wearedogs.net',
        changeOrigin: true,
        headers: { Referer: 'https://wearedogs.net/' },
      },
    },
  },
})
