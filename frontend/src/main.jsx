import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA functionality (skip on local dev servers unless in dev mode)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isDevMode = window.location.search.includes('dev=true') || localStorage.getItem('starkDevMode') === 'true';

    if (isLocal && !isDevMode) {
      // Avoid service worker registration during local Live Server sessions (unless in dev mode)
      console.log('Service Worker registration skipped on local host. Use ?dev=true to enable PWA features in development.');
      return;
    }

    // In dev mode, register the dev-specific service worker to keep caches separate from GitHub-published SW
    const swToRegister = (isLocal && isDevMode) ? './sw.dev.js' : './sw.js';

    navigator.serviceWorker.register(swToRegister)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope, 'using', swToRegister);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}