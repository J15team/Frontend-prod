/**
 * Member Detail View
 * チームメンバー個人紹介ページ
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// メンバーデータ（後で実際の情報に更新）
const membersData: Record<string, {
  name: string;
  nameEn: string;
  role: string;
  title: string;
  image: string;
  bio: string[];
  skills: string[];
  hobbies: string[];
  links: { label: string; url: string }[];
}> = {
  'member-1': {
    name: 'RIKI YOSHIDA',
    nameEn: 'RIKI YOSHIDA',
    role: 'Tech Lead',
    title: 'Tech Lead (Frontend & Backend)',
    image: '/images/team/member-1-detail.png',
    bio: [
      '徳島県出身。',
      'この作品における大体なんでもやったなんでも屋さんです。',
      '最近の趣味は、お酒と小説を読むことらしい。(森博嗣って人の"S&Mシリーズ"面白いよ。)',
      '一緒に遊んでくれる方(お酒飲める方)募集してます。なんか適当にご連絡ください。'
    ],
    skills: ['Kotlin(一番好き)', 'Go', 'TypeScript(勉強中)', 'AWS(ECSとかRDSとかそこら)', ],
    hobbies: ['阪神ファン(10年近く)'],
    links: [
      { label: 'GitHub', url: 'https://github.com/S4AK4N' },
      { label: 'Qiita', url: 'https://qiita.com/nanashi39' },
    ],

  },
  'member-2': {
    name: 'HARUYA NAKATA',
    nameEn: 'HARUYA NAKATA',
    role: 'Team Leader',
    title: 'Team Leader(Frontend & Designer)',
    image: '/images/team/member-2-detail.jpg',
    bio: [
      'チームリーダーさせてもらってます。',
      'フロントエンドとデザイン触ってます。'
    ],
    skills: [],
    hobbies: [],
    links: [],
  },
  'member-3': {
    name: 'Member 3',
    nameEn: 'Member Three',
    role: 'Designer',
    title: 'Designer',
    image: '/images/team/member-3.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
      'PathlyではUI/UXデザインを担当しました。',
    ],
    skills: ['Figma', 'UI/UX', 'Illustration'],
    hobbies: [],
    links: [],
  },
  'member-4': {
    name: 'Member 4',
    nameEn: 'Member Four',
    role: 'Frontend Engineer',
    title: 'Frontend Engineer',
    image: '/images/team/member-4.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
    ],
    skills: ['React', 'JavaScript'],
    hobbies: [],
    links: [],
  },
  'member-5': {
    name: 'Member 5',
    nameEn: 'Member Five',
    role: 'Backend Engineer',
    title: 'Backend Engineer',
    image: '/images/team/member-5.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
    ],
    skills: ['Node.js', 'AWS'],
    hobbies: [],
    links: [],
  },
  'member-6': {
    name: 'Member 6',
    nameEn: 'Member Six',
    role: 'Project Manager',
    title: 'Project Manager',
    image: '/images/team/member-6.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
      'Pathlyではプロジェクト管理を担当しました。',
    ],
    skills: ['Scrum', 'Communication'],
    hobbies: [],
    links: [],
  },
};

export const MemberDetailView: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  
  // ページ遷移時にトップにスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [memberId]);
  
  const member = memberId ? membersData[memberId] : null;

  if (!member) {
    return (
      <div className="member-not-found">
        <p>メンバーが見つかりません</p>
        <button onClick={() => navigate('/')}>トップに戻る</button>
      </div>
    );
  }

  return (
    <div className="member-detail-page">
      {/* ヘッダー */}
      <header className="member-header">
        <button className="btn-back" onClick={() => navigate('/#team')}>
          ← チーム一覧に戻る
        </button>
        <span className="header-title">Team Member</span>
      </header>

      {/* メインコンテンツ */}
      <main className="member-main">
        <div className="member-hero">
          <div className="member-image-wrapper">
            <div className="member-image">
              <img 
                src={member.image} 
                alt={member.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.add('show');
                }}
              />
              <div className="image-placeholder">
                <span>{member.name.charAt(0)}</span>
              </div>
            </div>
          </div>
          
          <div className="member-intro">
            <span className="member-role-badge">{member.role}</span>
            <h1 className="member-name">{member.name}</h1>
            <p className="member-name-en">{member.nameEn}</p>
            <p className="member-title">{member.title}</p>
          </div>
        </div>

        <div className="member-content">
          <section className="member-section">
            <h2>Profile</h2>
            <div className="member-bio">
              {member.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {member.skills.length > 0 && (
            <section className="member-section">
              <h2>Skills</h2>
              <div className="member-skills">
                {member.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {member.hobbies.length > 0 && (
            <section className="member-section">
              <h2>Hobbies</h2>
              <div className="member-hobbies">
                {member.hobbies.map((hobby, i) => (
                  <span key={i} className="skill-tag">{hobby}</span>
                ))}
              </div>
            </section>
          )}

          {member.links.length > 0 && (
            <section className="member-section">
              <h2>Links</h2>
              <div className="member-links">
                {member.links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="member-link"
                  >
                    {link.label}
                    <span>→</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="member-footer">
        <p>© 2026 Pathly Team</p>
      </footer>
    </div>
  );
};
