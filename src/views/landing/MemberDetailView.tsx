/**
 * Member Detail View
 * チームメンバー個人紹介ページ
 */
import React from 'react';
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
  links: { label: string; url: string }[];
}> = {
  'member-1': {
    name: '吉田 力輝',
    nameEn: 'RIKI YOSHIDA',
    role: 'Tech Lead',
    title: '開発責任者（Frontend & Backend）',
    image: '/images/team/member-1.jpg',
    bio: [
      'Pathlyの開発責任者として、フロントエンドとバックエンドの両方を担当。',
      '紹介文をここに追加できます。',
    ],
    skills: ['React', 'TypeScript', 'AWS', 'Python'],
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
    ],
  },
  'member-2': {
    name: 'メンバー2',
    nameEn: 'Member Two',
    role: 'Backend Engineer',
    title: 'バックエンド担当',
    image: '/images/team/member-2.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
      'Pathlyではバックエンド開発を担当しました。',
    ],
    skills: ['Python', 'AWS', 'DynamoDB'],
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
    ],
  },
  'member-3': {
    name: 'メンバー3',
    nameEn: 'Member Three',
    role: 'Designer',
    title: 'デザイン担当',
    image: '/images/team/member-3.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
      'PathlyではUI/UXデザインを担当しました。',
    ],
    skills: ['Figma', 'UI/UX', 'Illustration'],
    links: [],
  },
  'member-4': {
    name: 'メンバー4',
    nameEn: 'Member Four',
    role: 'Frontend Engineer',
    title: 'フロントエンド担当',
    image: '/images/team/member-4.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
    ],
    skills: ['React', 'JavaScript'],
    links: [],
  },
  'member-5': {
    name: 'メンバー5',
    nameEn: 'Member Five',
    role: 'Backend Engineer',
    title: 'バックエンド担当',
    image: '/images/team/member-5.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
    ],
    skills: ['Node.js', 'AWS'],
    links: [],
  },
  'member-6': {
    name: 'メンバー6',
    nameEn: 'Member Six',
    role: 'Project Manager',
    title: 'PM担当',
    image: '/images/team/member-6.jpg',
    bio: [
      'ここに経歴や紹介文を書きます。',
      'Pathlyではプロジェクト管理を担当しました。',
    ],
    skills: ['Scrum', 'Communication'],
    links: [],
  },
};

export const MemberDetailView: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  
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
        <button className="btn-back" onClick={() => navigate('/')}>
          ← トップに戻る
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
