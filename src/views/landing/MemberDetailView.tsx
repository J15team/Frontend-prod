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
  from: string[];
  links: { label: string; url: string }[];
  rainbowFrom?: boolean;
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
      '一緒に遊んでくれる方(お酒飲める方)募集してます。なんか適当にご連絡ください。',
      '画像の拡張子が「.webp」じゃないんでメモリ容量食います。ごめんなさい'
    ],
    skills: ['Kotlin(一番好き)', 'Go', 'TypeScript(勉強中)', 'AWS(ECSとかRDSとかそこら)', ],
    hobbies: ['阪神ファン(10年近く)'],
    links: [
      { label: 'GitHub', url: 'https://github.com/S4AK4N' },
      { label: 'Qiita', url: 'https://qiita.com/nanashi39' },
    ],
    from:[]

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
    from:[]
  },
  'member-3': {
    name: 'TAKUMA ARAKI',
    nameEn: 'TAKUMA ARAKI',
    role: 'Backend',
    title: 'Backend',
    image: '/images/team/member-3.jpg',
    bio: [
      '鳥取県出身。',
      '鳥取の読み方は取鳥の方が自然だろと他県の方に言われますが僕もそう思います。',
      '最近の趣味は友達の影響で温泉めぐりとパチンコと映画鑑賞。',
      '初詣のおみくじは大吉。',
      '旅行先で旅費を稼ぐことができてホクホクです。'
    ],
    skills: [],
    hobbies: [],
    links: [],
    from:['鳥取'],
    rainbowFrom: true
  },
  'member-4': {
    name: 'DAIKI MORIKAWA',
    nameEn: 'DAIKI MORIKAWA',
    role: 'Frontend',
    title: 'Frontend',
    image: '/images/team/member-4.jpg',
    bio: [
      '麻雀が好きな自堕落専門学生です',
      '眠気を抑えながら日々生活しています'
    ],
    skills: [],
    hobbies: ['二度寝'],
    links: [],
    from:[]
  },
  'member-5': {
    name: 'SEIYA HIROHATA',
    nameEn: 'SEIYA HIROHATA',
    role: "Leader's pet(frontend)",
    title: "Leader's pet(frontend)",
    image: '/images/team/member-5.jpg',
    bio: [
      '来年から社会人になる淡路島出身のペットです',
      '観光スポットのおいしいもの食べるのが好きです',
      '最近倉敷に観光に行きました',
      'あと、淡路島は自然豊かでおいしいものがたくさんあります！',
      '田舎でスローライフをしたい人はぜひ淡路島に住みましょう'

    ],
    skills: ['運転'],
    hobbies: ['ドライブ'],
    links: [],
    from:['淡路島']
  },
  'member-6': {
    name: 'KOUKI TANAKA',
    nameEn: 'KOUKI TANAKA',
    role: 'material',
    title: 'material',
    image: '/images/team/member-6.jpg',
    bio: [
      'どうも、当て馬で発表した人です。',
      'パワポのセンスが壊滅的らしいんですがセンスって何なんでしょうね。',
      '趣味はゲームと小説です。個人で書いてる小説が最近伸び始めて嬉しいですね。コミケ出たい。',
      'どうせこんなとこ誰も見てないしガチの性癖書くんですけど、苦痛に歪む麗人の顔が好きです。'
    ],
    skills: [],
    hobbies: [],
    links: [],
    from:['大阪生まれの尼崎育ち']
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

          {member.from.length > 0 && (
            <section className="member-section">
              <h2>From</h2>
              <div className={`member-from ${member.rainbowFrom ? 'rainbow' : ''}`}>
                {member.from.map((from, i) => (
                  <span key={i} className="skill-tag">{from}</span>
                ))}
              </div>
            </section>
          )}


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
