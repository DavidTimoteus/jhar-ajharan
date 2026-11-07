import { render } from 'preact';
import './index.css';
import App from './App';

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}

// Registrasi service worker PWA — hanya di production (VitePWA inject virtual module).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {
      /* module tidak tersedia di dev — abaikan */
    });
}
