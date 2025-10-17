import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA functionality (skip on local dev servers)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocal) {
    }

      // During local development and dev mode, avoid registering any Service Worker so builds load fresh
      if (isLocal || isDevMode) {
        console.log('Service Worker registration skipped during local/dev mode to avoid cache interference.');
        return;
      }

      // In production, register the stable service worker
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope, 'using ./sw.js');
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
  });
}