import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'katex/dist/katex.min.css';
import './globals.css';

import App from './App.tsx';

// Apply saved theme before first paint
const stored = localStorage.getItem('ai101-theme');
if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
