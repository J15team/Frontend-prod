/**
 * ProgressSummary
 * 進捗サマリー表示コンポーネント
 */
import React from 'react';
import { type ProgressData } from '@/models/Progress';
import { isGitHubConnected } from '@/utils/storage/githubStorage';

interface ProgressSummaryProps {
  progressData: ProgressData;
  onExportClick: () => void;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  progressData,
  onExportClick,
}) => {
  return (
    <div className="progress-summary">
      <div>
        <strong>進捗率:</strong> {progressData.progressPercentage}%
      </div>
      <div>
        <strong>完了:</strong> {progressData.clearedCount} / {progressData.totalSections}
      </div>
      <div>
        <strong>残り:</strong> {progressData.remainingCount}
      </div>
      <div>
        <strong>次のセクション:</strong>{' '}
        {progressData.nextSectionId !== null ? `#${progressData.nextSectionId}` : '全て完了'}
      </div>
      <button
        className="btn-github-export-small"
        onClick={onExportClick}
        title={isGitHubConnected() ? 'GitHubにエクスポート' : 'GitHub連携が必要です'}
      >
        🐙 GitHubに保存
      </button>
    </div>
  );
};
