/**
 * SectionListTable
 * セクション一覧テーブルコンポーネント
 */
import React from 'react';
import { type Section } from '@/models/Section';

interface SectionListTableProps {
  sections: Section[];
}

export const SectionListTable: React.FC<SectionListTableProps> = ({
  sections,
}) => {
  return (
    <section className="data-section">
      <h2>セクション一覧 (GET)</h2>
      {sections.length === 0 ? (
        <p>セクションが読み込まれていません。</p>
      ) : (
        <div className="data-table">
          <div className="data-table-header">
            <span>ID</span>
            <span>タイトル</span>
            <span>説明</span>
            <span>画像</span>
          </div>
          {sections.map((section) => (
            <div key={section.sectionId} className="data-table-row">
              <span>#{section.sectionId}</span>
              <span>{section.title}</span>
              <span className="table-description">{section.description}</span>
              <span>
                {section.images && section.images.length > 0
                  ? `${section.images.length}件`
                  : '-'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
