/**
 * SectionsHeader
 * セクションページのヘッダーコンポーネント
 * formatDateをutilsに分離（Single Responsibility原則）
 */
import React from 'react';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { type Subject } from '@/models/Subject';
import { type ProgressData } from '@/models/Progress';
import { formatDate } from '@/utils/formatDate';

interface SectionsHeaderProps {
  subject: Subject;
  progressData: ProgressData;
  onBackClick: () => void;
}

export const SectionsHeader: React.FC<SectionsHeaderProps> = ({
  subject,
  progressData,
  onBackClick,
}) => {
  return (
    <header className="sections-header">
      <button onClick={onBackClick} className="btn-back">
        ← 題材一覧に戻る
      </button>
      <div className="sections-header-content">
        <div className="subject-info">
          <h1 id="projectTitle">{subject.title}</h1>
          <p className="subject-description">{subject.description}</p>
          <div className="subject-meta">
            <span>最大 {subject.maxSections} セクション</span>
            <span>作成日: {formatDate(subject.createdAt)}</span>
          </div>
        </div>
        <ProgressBar progressData={progressData} />
      </div>
    </header>
  );
};
