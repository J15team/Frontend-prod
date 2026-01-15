/**
 * Code Preview Component
 * HTML/CSS/JSのライブプレビュー
 * ロジックはuseCodePreviewフックに分離（Single Responsibility原則）
 */
import React, { useState } from 'react';
import { useCodePreview } from '@/hooks/useCodePreview';
import { getProject } from '@/utils/storage/codeStorage';
import { previewCode, type CodePreviewResponse } from '@/services/assignments/AssignmentService';

interface CodePreviewProps {
  subjectId: number;
  currentSectionId: number;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ subjectId, currentSectionId }) => {
  const { iframeRef, error, presetId, updatePreview } = useCodePreview({
    subjectId,
    currentSectionId,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [stdinInput, setStdinInput] = useState('');
  const [cResult, setCResult] = useState<CodePreviewResponse | null>(null);

  // C言語の実行（API経由）
  const handleRunC = async () => {
    const project = getProject(subjectId, currentSectionId);
    if (!project) return;

    const code = project.files['main.c']?.content || '';
    setIsRunning(true);
    setCResult(null);

    try {
      const result = await previewCode({
        code,
        language: 'c',
        input: stdinInput,
        timeLimit: 2000,
      });
      setCResult(result);
    } catch (err) {
      setCResult({
        output: null,
        executionTime: null,
        status: 'ERROR',
        errorMessage: '通信エラーが発生しました',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 手動実行が必要なプリセット
  const needsManualRun = presetId === 'c' || presetId === 'python' || presetId === 'typescript-basics';

  return (
    <div className="code-preview-container">
      <div className="preview-header">
        <span>👁️ プレビュー</span>
        <div className="preview-actions">
          {presetId === 'c' && (
            <button 
              className="btn-run-preview" 
              onClick={handleRunC}
              disabled={isRunning}
            >
              {isRunning ? '⏳ 実行中...' : '▶️ 実行'}
            </button>
          )}
          {!needsManualRun && (
            <button className="btn-refresh-preview" onClick={updatePreview}>
              🔄 更新
            </button>
          )}
          {needsManualRun && presetId !== 'c' && (
            <button className="btn-refresh-preview" onClick={updatePreview}>
              ▶️ 実行
            </button>
          )}
        </div>
      </div>
      {presetId === 'c' && (
        <div className="stdin-input-section">
          <label>📥 入力（改行区切り）</label>
          <textarea
            className="stdin-input"
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            placeholder="例: 5&#10;10"
            rows={2}
          />
        </div>
      )}
      {error && <div className="preview-error">{error}</div>}
      
      {/* C言語の場合はAPI結果を表示 */}
      {presetId === 'c' ? (
        <div className="c-preview-result">
          {isRunning && (
            <div className="c-loading">
              <img src="/icon.PNG" alt="Loading" className="loading-icon spinning" />
              <span>実行中...</span>
            </div>
          )}
          {!isRunning && cResult && (
            <div className={`c-result ${cResult.status === 'SUCCESS' ? 'success' : 'error'}`}>
              <div className="c-result-status">
                <span className={`status-badge ${cResult.status.toLowerCase()}`}>
                  {cResult.status === 'SUCCESS' && '✅ 成功'}
                  {cResult.status === 'COMPILE_ERROR' && '❌ コンパイルエラー'}
                  {cResult.status === 'RUNTIME_ERROR' && '💥 実行時エラー'}
                  {cResult.status === 'TIMEOUT' && '⏱️ タイムアウト'}
                  {cResult.status === 'ERROR' && '⚠️ エラー'}
                </span>
                {cResult.executionTime !== null && (
                  <span className="execution-time">⏱️ {cResult.executionTime}ms</span>
                )}
              </div>
              {cResult.status === 'SUCCESS' && (
                <div className="c-output">
                  <label>📤 出力</label>
                  <pre>{cResult.output || '(出力なし)'}</pre>
                </div>
              )}
              {cResult.errorMessage && (
                <div className="c-error">
                  <label>❌ エラー内容</label>
                  <pre>{cResult.errorMessage}</pre>
                </div>
              )}
            </div>
          )}
          {!isRunning && !cResult && (
            <div className="c-placeholder">
              <p>▶️ 「実行」ボタンを押してコードを実行</p>
            </div>
          )}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          title="Code Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
        />
      )}
    </div>
  );
};
