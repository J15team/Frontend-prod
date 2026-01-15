/**
 * GitHub Export Modal
 * 学習コードをGitHubリポジトリにエクスポートするモーダル
 * プリセット選択機能付き
 */
import React, { useState, useEffect } from 'react';
import { useGitHubExport, generateRepoName } from '@/hooks/useGitHubExport';

interface GitHubExportModalProps {
  subjectId: number;
  subjectTitle: string;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  subjectId,
  subjectTitle,
  onClose,
}) => {
  const [repoName, setRepoName] = useState(generateRepoName());
  const [description, setDescription] = useState(`Pathlyで学習: ${subjectTitle}`);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const {
    githubUser,
    isConnected,
    hasCode,
    availablePresets,
    loading,
    error,
    success,
    exportToGitHub,
  } = useGitHubExport(subjectId, subjectTitle);

  // 初期選択: 最新のプリセットを選択
  useEffect(() => {
    if (availablePresets.length > 0 && !selectedPreset) {
      setSelectedPreset(availablePresets[0].presetId);
    }
  }, [availablePresets, selectedPreset]);

  const handleExport = () => {
    exportToGitHub({ repoName, description, isPrivate, presetId: selectedPreset });
  };

  const selectedPresetInfo = availablePresets.find(p => p.presetId === selectedPreset);

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content github-export-modal" onClick={(e) => e.stopPropagation()}>
          <div className="export-success">
            <span className="success-icon">🎉</span>
            <h3>エクスポート完了！</h3>
            <p>GitHubリポジトリが作成されました</p>
            <a
              href={success.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-repo"
            >
              🐙 リポジトリを見る
            </a>
            <button className="btn-secondary" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content github-export-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🐙 GitHubにエクスポート</h3>

        {!isConnected ? (
          <div className="export-warning">
            <p>GitHubと連携してからエクスポートしてください</p>
            <a href="/profile" className="btn-primary">
              プロフィールで連携する
            </a>
          </div>
        ) : (
          <>
            <div className="export-info">
              <p className="export-user">
                エクスポート先: <strong>@{githubUser?.login}</strong>
              </p>
            </div>

            {/* プリセット選択 */}
            {availablePresets.length > 0 && (
              <div className="form-group">
                <label>エクスポートするプリセット</label>
                <div className="preset-select-buttons">
                  {availablePresets.map((preset) => (
                    <button
                      key={preset.presetId}
                      type="button"
                      className={`preset-select-btn ${selectedPreset === preset.presetId ? 'active' : ''}`}
                      onClick={() => setSelectedPreset(preset.presetId)}
                    >
                      <span className="preset-icon">{preset.icon}</span>
                      <span className="preset-label">{preset.label}</span>
                    </button>
                  ))}
                </div>
                {selectedPresetInfo && (
                  <small className="input-hint">
                    {selectedPresetInfo.icon} {selectedPresetInfo.label} のコードをエクスポートします
                  </small>
                )}
              </div>
            )}

            {availablePresets.length === 0 && (
              <div className="export-warning">
                <p>エクスポートするコードがありません</p>
              </div>
            )}

            <div className="form-group">
              <label>リポジトリ名</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-project"
              />
              <small className="input-hint">※ 英数字とハイフンのみ使用可能</small>
            </div>

            <div className="form-group">
              <label>説明</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="プロジェクトの説明"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                プライベートリポジトリにする
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose} disabled={loading}>
                キャンセル
              </button>
              <button
                className="btn-github-export"
                onClick={handleExport}
                disabled={loading || !hasCode || !selectedPreset}
              >
                {loading ? 'エクスポート中...' : 'エクスポート'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};