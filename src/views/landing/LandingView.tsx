/**
 * Landing View
 * ランディングページ（トップページ）
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // アニメーション開始
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleSignIn = () => {
    navigate('/auth/signin');
  };

  const handleAdminSignIn = () => {
    navigate('/auth/admin-signin');
  };

  return (
    <div className="landing-page">
      {/* ヘッダー */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <span className="logo-icon">🛤️</span>
            <span className="logo-text">Pathly</span>
          </div>
          <nav className="landing-nav">
            <button className="btn-nav-admin" onClick={handleAdminSignIn}>
              管理者ログイン
            </button>
            <div className="nav-divider" />
            <button className="btn-nav" onClick={handleSignIn}>
              ログイン
            </button>
            <button className="btn-nav-primary" onClick={handleGetStarted}>
              無料で始める
            </button>
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className={`landing-hero ${isVisible ? 'visible' : ''}`}>
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line">プログラミングを</span>
            <span className="title-line highlight">楽しく、着実に。</span>
          </h1>
          <p className="hero-subtitle">
            初心者でも安心。ステップバイステップで学べる<br />
            プログラミング学習プラットフォーム
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={handleGetStarted}>
              無料で始める
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={handleSignIn}>
              ログインはこちら
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-window">
            <div className="window-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="window-content">
              <pre>
                <code>
{`function greet() {
  console.log("Hello!");
  console.log("Welcome to");
  console.log("Pathly! 🛤️");
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="landing-features">
        <div className="features-inner">
          <h2 className="section-title">
            <span className="title-accent">Features</span>
            CodeSproutの特徴
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>豊富な題材</h3>
              <p>ToDoリスト、カウンターアプリ、ゲームなど、実践的なプロジェクトで学べます</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>進捗管理</h3>
              <p>学習の進み具合を可視化。モチベーションを維持しながら学習できます</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>目標設定</h3>
              <p>締め切りを設定してGoogleカレンダーと連携。計画的に学習を進められます</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>初心者向け</h3>
              <p>ステップバイステップで丁寧に解説。プログラミング未経験でも安心です</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学習フローセクション */}
      <section className="landing-flow">
        <div className="flow-inner">
          <h2 className="section-title">
            <span className="title-accent">How it works</span>
            学習の流れ
          </h2>
          <div className="flow-steps">
            <div className="flow-step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>アカウント作成</h3>
                <p>メールアドレスで簡単登録。Googleアカウントでもログインできます</p>
              </div>
            </div>
            <div className="flow-connector" />
            <div className="flow-step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>題材を選ぶ</h3>
                <p>興味のあるプロジェクトを選んで学習スタート</p>
              </div>
            </div>
            <div className="flow-connector" />
            <div className="flow-step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>セクションを進める</h3>
                <p>各セクションをクリアしながら着実にスキルアップ</p>
              </div>
            </div>
            <div className="flow-connector" />
            <div className="flow-step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>完成！</h3>
                <p>プロジェクト完成で達成感を味わおう</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="landing-cta">
        <div className="cta-inner">
          <h2>今すぐ始めよう</h2>
          <p>プログラミングの第一歩を踏み出そう</p>
          <button className="btn-cta" onClick={handleGetStarted}>
            無料でアカウント作成
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* フッター */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-icon">🛤️</span>
            <span className="logo-text">Pathly</span>
          </div>
          <p className="footer-copy">© 2026 Pathly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
