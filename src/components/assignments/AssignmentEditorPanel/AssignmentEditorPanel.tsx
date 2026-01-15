/**
 * Assignment EditorPanel
 * 課題用エディターパネル（C言語専用）
 * エディタ/プレビュー/メモ タブ切り替え
 */
import React, { useState, useEffect } from 'react';
import { TabButton } from '@/components/common/TabButton/TabButton';
import { previewCode, type CodePreviewResponse } from '@/services/assignments/AssignmentService';
import type { AssignmentSubmission } from '@/models/Assignment';
import './AssignmentEditorPanel.css';

interface AssignmentEditorPanelProps {
  subjectId: number;
  sectionId: number;
  hasAssignment: boolean;
  onSubmit: (code: string) => void;
  isSubmitting: boolean;
  lastSubmission?: AssignmentSubmission | null;
}

type TabType = 'editor' | 'preview' | 'memo';

const TABS: { type: TabType; label: string; icon: string }[] = [
  { type: 'editor', label: 'エディタ', icon: '📝' },
  { type: 'preview', label: 'プレビュー', icon: '👁️' },
  { type: 'memo', label: 'メモ帳', icon: '📒' },
];

export const AssignmentEditorPanel: React.FC<AssignmentEditorPanelProps> = ({
  subjectId,
  sectionId,
  hasAssignment,
  onSubmit,
  isSubmitting,
  lastSubmission,
}) => {
  const defaultCode = `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\\n", n * 2);
    return 0;
}`;

  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [code, setCode] = useState<string>(defaultCode);
  const [memo, setMemo] = useState<string>('');
  const [stdinInput, setStdinInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [previewResult, setPreviewResult] = useState<CodePreviewResponse | null>(null);
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);

  // Monaco Editorを動的インポート
  useEffect(() => {
    import('@monaco-editor/react').then((module) => {
      setEditor(() => module.default);
    });
  }, []);

  // セクション切り替え時にコードを復元
  useEffect(() => {
    const savedCode = localStorage.getItem(`assignment_code_${subjectId}_${sectionId}`);
    setCode(savedCode || defaultCode);
    setStdinInput('');
    setPreviewResult(null);
  }, [subjectId, sectionId]);

  // コード変更時に保存
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    localStorage.setItem(`assignment_code_${subjectId}_${sectionId}`, newCode);
  };

  // メモをローカルストレージから読み込み
  useEffect(() => {
    const savedMemo = localStorage.getItem(`assignment_memo_${subjectId}_${sectionId}`);
    if (savedMemo) setMemo(savedMemo);
    else setMemo('');
  }, [subjectId, sectionId]);

  // メモを保存
  const saveMemo = (value: string) => {
    setMemo(value);
    localStorage.setItem(`assignment_memo_${subjectId}_${sectionId}`, value);
  };

  // コードを実行（API経由）
  const handleRun = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setPreviewResult(null);
    
    try {
      const result = await previewCode({
        code,
        language: 'c',
        input: stdinInput,
        timeLimit: 2000,
      });
      setPreviewResult(result);
    } catch (error) {
      setPreviewResult({
        output: null,
        executionTime: null,
        status: 'ERROR',
        errorMessage: '通信エラーが発生しました',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 提出
  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div className="assignment-editor-panel">
      {/* タブ */}
      <div className="editor-panel-tabs">
        {TABS.map((tab) => (
          <TabButton
            key={tab.type}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.type}
            onClick={() => setActiveTab(tab.type)}
          />
        ))}
      </div>

      {/* エディタタブ */}
      {activeTab === 'editor' && (
        <div className="editor-content">
          <div className="editor-header">
            <div className="editor-file-tab">
              <span className="tab-icon">⚙️</span>
              main.c
            </div>
            <div className="editor-actions">
              {hasAssignment && (
                <button 
                  className="btn-submit" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !code.trim()}
                >
                  {isSubmitting ? '⏳ 採点中...' : '🚀 提出'}
                </button>
              )}
            </div>
          </div>
          
          {/* 提出結果表示 */}
          {lastSubmission && lastSubmission.status === 'COMPLETED' && !isSubmitting && (
            <div className={`submission-result ${lastSubmission.passedTestCases === lastSubmission.totalTestCases ? 'success' : 'failed'}`}>
              <div className="result-header">
                <span className="result-icon">
                  {lastSubmission.passedTestCases === lastSubmission.totalTestCases ? '✅' : '❌'}
                </span>
                <span className="result-status">
                  {lastSubmission.passedTestCases === lastSubmission.totalTestCases 
                    ? '正解 (Accepted)' 
                    : '不正解 (Wrong Answer)'}
                </span>
              </div>
              <div className="result-details">
                <span>テストケース: {lastSubmission.passedTestCases ?? 0} / {lastSubmission.totalTestCases ?? 0} 通過</span>
              </div>
            </div>
          )}
          
          <div className="editor-wrapper">
            {Editor ? (
              <Editor
                height={lastSubmission && !isSubmitting ? "calc(100vh - 350px)" : "calc(100vh - 280px)"}
                language="c"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                }}
              />
            ) : (
              <div className="editor-loading">エディタを読み込み中...</div>
            )}
          </div>
        </div>
      )}

      {/* プレビュータブ */}
      {activeTab === 'preview' && (
        <div className="preview-content">
          <div className="preview-header">
            <span>👁️ 実行結果</span>
            <button className="btn-run" onClick={handleRun} disabled={isRunning || !code.trim()}>
              {isRunning ? '⏳ 実行中...' : '▶️ 実行'}
            </button>
          </div>
          <div className="stdin-input-area">
            <label>📥 標準入力（改行区切り）</label>
            <textarea
              className="stdin-textarea"
              value={stdinInput}
              onChange={(e) => setStdinInput(e.target.value)}
              placeholder="例: 5&#10;10&#10;20"
              rows={3}
            />
          </div>
          <div className="preview-result-area">
            {isRunning && (
              <div className="preview-loading">
                <img src="/icon.PNG" alt="Loading" className="loading-icon spinning" />
                <span>実行中...</span>
              </div>
            )}
            {!isRunning && previewResult && (
              <div className={`preview-result ${previewResult.status === 'SUCCESS' ? 'success' : 'error'}`}>
                <div className="result-status-bar">
                  <span className={`status-badge ${previewResult.status.toLowerCase()}`}>
                    {previewResult.status === 'SUCCESS' && '✅ 成功'}
                    {previewResult.status === 'COMPILE_ERROR' && '❌ コンパイルエラー'}
                    {previewResult.status === 'RUNTIME_ERROR' && '💥 実行時エラー'}
                    {previewResult.status === 'TIMEOUT' && '⏱️ タイムアウト'}
                    {previewResult.status === 'ERROR' && '⚠️ エラー'}
                  </span>
                  {previewResult.executionTime !== null && (
                    <span className="execution-time">⏱️ {previewResult.executionTime}ms</span>
                  )}
                </div>
                {previewResult.status === 'SUCCESS' && (
                  <div className="output-section">
                    <label>📤 出力</label>
                    <pre className="output-content">{previewResult.output || '(出力なし)'}</pre>
                  </div>
                )}
                {previewResult.errorMessage && (
                  <div className="error-section">
                    <label>❌ エラー内容</label>
                    <pre className="error-content">{previewResult.errorMessage}</pre>
                  </div>
                )}
              </div>
            )}
            {!isRunning && !previewResult && (
              <div className="preview-placeholder">
                <p>▶️ 「実行」ボタンを押してコードを実行</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* メモ帳タブ */}
      {activeTab === 'memo' && (
        <div className="memo-content">
          <div className="memo-header">
            <span>📒 メモ帳</span>
            <span className="memo-autosave">💾 自動保存</span>
          </div>
          <textarea
            className="memo-textarea"
            value={memo}
            onChange={(e) => saveMemo(e.target.value)}
            placeholder="メモを入力..."
          />
        </div>
      )}
    </div>
  );
};
