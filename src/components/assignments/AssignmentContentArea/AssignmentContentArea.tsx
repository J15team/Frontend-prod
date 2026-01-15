/**
 * Assignment ContentArea Component
 * 課題コンテンツ表示エリア
 */
import React, { useState } from 'react';
import type { AssignmentSectionDetail, SubmissionHistoryItem, SubmissionDetail, Verdict } from '@/models/Assignment';
import { useMarkdownContent } from '@/hooks/useMarkdownContent';
import './AssignmentContentArea.css';

interface AssignmentContentAreaProps {
  section: AssignmentSectionDetail;
  submissions: SubmissionHistoryItem[];
  currentSubmission: SubmissionDetail | null;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const VerdictBadge: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
  const labels: Record<Verdict, { text: string; class: string }> = {
    AC: { text: '正解', class: 'verdict-ac' },
    WA: { text: '不正解', class: 'verdict-wa' },
    TLE: { text: '時間超過', class: 'verdict-tle' },
    MLE: { text: 'メモリ超過', class: 'verdict-mle' },
    RE: { text: '実行時エラー', class: 'verdict-re' },
    CE: { text: 'コンパイルエラー', class: 'verdict-ce' },
  };
  const { text, class: className } = labels[verdict] || { text: verdict, class: '' };
  return <span className={`verdict-badge ${className}`}>{text}</span>;
};

export const AssignmentContentArea: React.FC<AssignmentContentAreaProps> = ({
  section,
  submissions,
  currentSubmission,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  const { contentRef, containerRef } = useMarkdownContent({
    content: section.description || '',
  });
  const [showHistory, setShowHistory] = useState(false);

  const visibleTestCases = section.testCases?.filter(tc => tc.visible) || [];

  return (
    <div className="assignment-content-area" ref={containerRef}>
      <header className="content-header">
        <p className="content-section-id">セクション #{section.sectionId}</p>
        <h2>{section.title}</h2>
        {section.hasAssignment && (
          <div className="section-limits">
            <span>⏱️ {section.timeLimit}ms</span>
            <span>💾 {section.memoryLimit}MB</span>
          </div>
        )}
      </header>

      <div className="content-body" ref={contentRef} />

      {/* 課題ありの場合 */}
      {section.hasAssignment && (
        <>
          {/* テストケース */}
          {visibleTestCases.length > 0 && (
            <div className="test-cases-section">
              <h3>📋 テストケース</h3>
              <div className="test-cases-list">
                {visibleTestCases.map((tc, index) => (
                  <div key={index} className="test-case-item">
                    <div className="test-case-header">テストケース {index + 1}</div>
                    <div className="test-case-row">
                      <div className="test-case-label">入力</div>
                      <pre className="test-case-content">{tc.input || '(なし)'}</pre>
                    </div>
                    <div className="test-case-row">
                      <div className="test-case-label">期待出力</div>
                      <pre className="test-case-content">{tc.expected}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 判定結果 */}
          {currentSubmission && currentSubmission.status === 'COMPLETED' && (
            <div className="submission-result">
              <h3>📊 判定結果</h3>
              <div className="result-summary">
                <div className="result-score">
                  <span className="score-value">{currentSubmission.score}</span>
                  <span className="score-label">点</span>
                </div>
                <div className="result-stats">
                  <span>通過: {currentSubmission.passedTestCases} / {currentSubmission.totalTestCases}</span>
                </div>
              </div>
              {currentSubmission.results && (
                <div className="result-details">
                  {currentSubmission.results.map((result, index) => (
                    <div key={index} className="result-item">
                      <span className="result-index">#{result.index + 1}</span>
                      <VerdictBadge verdict={result.verdict} />
                      <span className="result-time">{result.executionTime}ms</span>
                      {result.visible && result.actualOutput && (
                        <pre className="result-output">{result.actualOutput}</pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 提出履歴 */}
          <div className="submission-history-section">
            <button className="btn-toggle-history" onClick={() => setShowHistory(!showHistory)}>
              📜 提出履歴 {showHistory ? '▲' : '▼'}
            </button>
            {showHistory && submissions.length > 0 && (
              <ul className="history-list">
                {submissions.map((sub) => (
                  <li key={sub.submissionId} className="history-item">
                    <span className="history-date">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </span>
                    <span className={`history-score ${sub.score === 100 ? 'perfect' : ''}`}>
                      {sub.score !== undefined ? `${sub.score}点` : sub.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {showHistory && submissions.length === 0 && (
              <p className="no-history">まだ提出がありません</p>
            )}
          </div>
        </>
      )}

      {/* ナビゲーション */}
      <div className="content-actions">
        <div className="content-actions-left">
          {hasPrev && (
            <button className="btn-prev-section" onClick={onPrev}>
              ← 前のセクション
            </button>
          )}
        </div>
        <div className="content-actions-right">
          {hasNext && (
            <button className="btn-next-section" onClick={onNext}>
              次のセクションへ →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
