/**
 * Main Entry Point
 * アプリケーションのエントリーポイント
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';
import './styles/subjects.css';
import './styles/sections.css';
import './styles/profile.css';
import './styles/admin.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/landing.css';
import './styles/auth.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
