import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' supaya sama-sama jalan di GitHub Pages (sub-path) maupun localhost.
export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/mark.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Jhâr-Ajhârân — Latihan CAT CPNS & BUMN',
        short_name: 'Jhâr-Ajhârân',
        description:
          'Latihan soal CAT CPNS dan BUMN yang bisa dipakai offline, dengan hint taktik penyelesaian bertingkat.',
        lang: 'id',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f2f4f7',
        theme_color: '#141414',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: { target: 'es2020', sourcemap: false },
});
