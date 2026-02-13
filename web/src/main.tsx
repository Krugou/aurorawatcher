import './index.css';
import './i18n';
import './firebase'; // Initialize Firebase

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

console.warn(
  `%c AURORA WATCHER %c Build: ${__BUILD_TIME__} `,
  'background: #00FF9D; color: #000; font-weight: bold;',
  'background: #000; color: #fff;',
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
