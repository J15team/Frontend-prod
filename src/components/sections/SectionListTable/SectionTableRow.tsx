/**
 * SectionTableRow
 * セクション一覧テーブルの行コンポーネント
 * Single Responsibility: 単一セクション行の表示のみを担当
 */
import React from 'react';
import { type Section } from '@/models/Section';

interface SectionTableRowProps {
  section: Section;
}

export const SectionTableRow: React.FC<SectionTableRowProps> = ({ section }) => (
  <div className="data-table-row">
    <span>#{section.sectionId}</span>
    <span>{section.title}</span>
    <span className="table-description">{section.description}</span>
    <span>
      {section.images && section.images.length > 0
        ? `${section.images.length}件`
        : '-'}
    </span>
  </div>
);
