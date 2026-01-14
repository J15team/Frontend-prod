/**
 * Main Entry Point
 * アプリケーションのエントリーポイント
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/variables/variables.css';
import './styles/global/global.css';
import './styles/admin/admin.css';
import './styles/animations/animations.css';
import './styles/auth/auth.css';
// Profile
import './styles/profile/hero.css';
import './styles/profile/stats.css';
import './styles/profile/cards.css';
import './styles/profile/settings.css';
import './styles/profile/dark.css';
import './styles/profile/responsive.css';
// Subjects
import './styles/subjects/layout.css';
import './styles/subjects/cards.css';
import './styles/subjects/filters.css';
import './styles/subjects/dark.css';
// Sections
import './styles/sections/layout.css';
import './styles/sections/sidebar.css';
import './styles/sections/content.css';
import './styles/sections/editor.css';
import './styles/sections/responsive.css';
// Landing
import './styles/landing/landing.css';
import './styles/landing/header.css';
import './styles/landing/hero.css';
import './styles/landing/features.css';
import './styles/landing/flow.css';
import './styles/landing/cta.css';
import './styles/landing/footer.css';
import './styles/landing/team.css';
import './styles/landing/member.css';
import './styles/landing/effects.css';
import './styles/landing/responsive.css';
// Components
import './styles/components/auth.css';
import './styles/components/deadline.css';
import './styles/components/sidebar.css';
import './styles/components/filters.css';
import './styles/components/github.css';
import './styles/components/tutorial.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
