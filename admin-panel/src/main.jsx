import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './admin.css';

const BASE = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASE}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(BASE + 'service-worker.js', { scope: BASE })
      .then(function (reg) { console.log('SW registered:', reg.scope); })
      .catch(function (err) { console.log('SW registration failed:', err); });
  });
}
