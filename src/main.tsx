/**
 * Main Entry Point
 * アプリケーションのエントリーポイント
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';
import './styles/index.css';
import './styles/subjects.css';
import './styles/landing.css';
import './styles/auth.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
