/**
 * Landing View
 * ランディングページ（トップページ）- モダンデザイン
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // アクティブセクションの検出
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => navigate('/auth/signup');
  const handleSignIn = () => navigate('/auth/signin');
  const handleAdminSignIn = () => navigate('/auth/admin-signin');

  const scrollToSection = (index: number) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page-v2">
      {/* 固定ヘッダー */}
      <header className={`landing-header-v2 ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Pathly</span>
          </div>
          <nav className="header-nav">
            <button onClick={() => scrollToSection(1)}>特徴</button>
            <button onClick={() => scrollToSection(2)}>学習の流れ</button>
            <button onClick={() => scrollToSection(3)}>始め方</button>
          </nav>
          <div className="header-actions">
            <button className="btn-text" onClick={handleAdminSignIn}>管理者</button>
            <button className="btn-outline" onClick={handleSignIn}>ログイン</button>
            <button className="btn-primary" onClick={handleGetStarted}>無料で始める</button>
          </div>
        </div>
      </header>

      {/* サイドナビゲーション */}
      <nav className="side-nav">
        {['TOP', '特徴', '流れ', '始める'].map((label, i) => (
          <button
            key={i}
            className={activeSection === i ? 'active' : ''}
            onClick={() => scrollToSection(i)}
          >
            <span className="dot" />
            <span className="label">{label}</span>
          </button>
        ))}
      </nav>

      {/* ヒーローセクション - フルスクリーン */}
      <section 
        ref={el => { sectionsRef.current[0] = el; }}
        className={`hero-section ${isVisible ? 'visible' : ''}`}
      >
        <div className="hero-bg">
          <div className="hero-image" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            <img src="/images/landing/hero.jpg" alt="Pathly - プログラミング学習" />
          </div>
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <p className="hero-label">Programming Learning Platform</p>
          <h1 className="hero-title">
            <span className="line-1">プログラミングを</span>
            <span className="line-2">楽しく、着実に。</span>
          </h1>
          <p className="hero-description">
            初心者でも安心。ステップバイステップで学べる<br />
            プログラミング学習プラットフォーム
          </p>
          <div className="hero-buttons">
            <button className="btn-hero" onClick={handleGetStarted}>
              無料で始める
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* 特徴セクション */}
      <section 
        ref={el => { sectionsRef.current[1] = el; }}
        className="features-section"
      >
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Features</span>
            <h2 className="section-title">Pathlyの特徴</h2>
            <p className="section-subtitle">
              学習を楽しく、効率的に進めるための機能を揃えています
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card large">
              <div className="feature-image">
                <div className="placeholder-image">
                  <span className="placeholder-icon">📚</span>
                </div>
              </div>
              <div className="feature-content">
                <h3>豊富な題材</h3>
                <p>ToDoリスト、カウンターアプリ、ゲームなど、実践的なプロジェクトで学べます。作りながら学ぶことで、確実にスキルが身につきます。</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>進捗管理</h3>
              <p>学習の進み具合を可視化。モチベーションを維持しながら学習できます。</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>目標設定</h3>
              <p>締め切りを設定してGoogleカレンダーと連携。計画的に学習を進められます。</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>初心者向け</h3>
              <p>ステップバイステップで丁寧に解説。プログラミング未経験でも安心です。</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>GitHub連携</h3>
              <p>作成したコードをGitHubにエクスポート。ポートフォリオとして活用できます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学習フローセクション */}
      <section 
        ref={el => { sectionsRef.current[2] = el; }}
        className="flow-section"
      >
        <div className="section-inner">
          <div className="section-header light">
            <span className="section-label">How it works</span>
            <h2 className="section-title">学習の流れ</h2>
          </div>

          <div className="flow-timeline">
            <div className="flow-item">
              <div className="flow-number">01</div>
              <div className="flow-content">
                <div className="flow-image">
                  <div className="placeholder-image">
                    <span className="placeholder-icon">👤</span>
                  </div>
                </div>
                <h3>アカウント作成</h3>
                <p>メールアドレスで簡単登録。<br />Googleアカウントでもログインできます。</p>
              </div>
            </div>

            <div className="flow-item">
              <div className="flow-number">02</div>
              <div className="flow-content">
                <div className="flow-image">
                  <div className="placeholder-image">
                    <span className="placeholder-icon">📖</span>
                  </div>
                </div>
                <h3>題材を選ぶ</h3>
                <p>興味のあるプロジェクトを選んで<br />学習スタート。</p>
              </div>
            </div>

            <div className="flow-item">
              <div className="flow-number">03</div>
              <div className="flow-content">
                <div className="flow-image">
                  <div className="placeholder-image">
                    <span className="placeholder-icon">✏️</span>
                  </div>
                </div>
                <h3>セクションを進める</h3>
                <p>各セクションをクリアしながら<br />着実にスキルアップ。</p>
              </div>
            </div>

            <div className="flow-item">
              <div className="flow-number">04</div>
              <div className="flow-content">
                <div className="flow-image">
                  <div className="placeholder-image">
                    <span className="placeholder-icon">🎉</span>
                  </div>
                </div>
                <h3>完成！</h3>
                <p>プロジェクト完成で達成感を味わおう。<br />GitHubにエクスポートも可能。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section 
        ref={el => { sectionsRef.current[3] = el; }}
        className="cta-section"
      >
        <div className="cta-bg">
          <div className="placeholder-image">
            <div className="placeholder-content">
              <span className="placeholder-icon">🚀</span>
            </div>
          </div>
          <div className="cta-overlay" />
        </div>
        <div className="cta-content">
          <span className="cta-label">Get Started</span>
          <h2>今すぐ始めよう</h2>
          <p>プログラミングの第一歩を踏み出そう。<br />無料でアカウント作成できます。</p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={handleGetStarted}>
              無料でアカウント作成
              <span className="arrow">→</span>
            </button>
            <button className="btn-cta-secondary" onClick={handleSignIn}>
              ログインはこちら
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="landing-footer-v2">
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🌿</span>
                <span className="logo-text">Pathly</span>
              </div>
              <p>Path + -ly: 学習の道筋</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>サービス</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection(1); }}>特徴</a>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection(2); }}>学習の流れ</a>
              </div>
              <div className="link-group">
                <h4>アカウント</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); handleSignIn(); }}>ログイン</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>新規登録</a>
              </div>
              <div className="link-group">
                <h4>サポート</h4>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScxw4sQcRCVQ5e8bHqe0Fl_G5e0PHER_fdWazzTR1aBqR6zZA/viewform" target="_blank" rel="noopener noreferrer">お問い合わせ</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Pathly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
