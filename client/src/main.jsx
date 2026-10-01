import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (err) {
  console.error('Fatal initialization error:', err);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;">
        <div style="max-width:500px;background:#1e293b;padding:2rem;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          <h2 style="color:#ef4444;margin-bottom:1rem;">Application Launch Error</h2>
          <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;">${err.message || 'An error occurred during initial load.'}</p>
          <button onclick="localStorage.clear();sessionStorage.clear();window.location.hash='';window.location.reload();" style="padding:0.6rem 1.2rem;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Clear Cache & Reload</button>
        </div>
      </div>
    `;
  }
}
