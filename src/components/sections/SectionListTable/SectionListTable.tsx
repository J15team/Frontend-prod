/**
 * SectionListTable
 * セクション一覧テーブルコンポーネント
 * SectionTableRowに行を分離（Single Responsibility原則）
 */
import React from 'react';
import { type Section } from '@/models/Section';
import { SectionTableRow } from './SectionTableRow';

interface SectionListTableProps {
  sections: Section[];
}

const TABLE_HEADERS = ['ID', 'タイトル', '説明', '画像'];

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
            {TABLE_HEADERS.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {sections.map((section) => (
            <SectionTableRow key={section.sectionId} section={section} />
          ))}
        </div>
      )}
    </section>
  );
};
