/**
 * ProgressBar Component
 * 進捗バーコンポーネント
 */
import React from 'react';
import { type ProgressData } from '@/models/Progress';

interface ProgressBarProps {
  progressData: ProgressData;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressData }) => {
  return (
    <div className="progress-info">
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progressData.progressPercentage}%` }}
        />
      </div>
      <div className="progress-text">
        <span className="progress-percentage">{progressData.progressPercentage}%</span>
        <span>
          {progressData.clearedCount} / {progressData.totalSections} 完了
        </span>
      </div>
    </div>
  );
};
