/**
 * TerminalPanel Component
 * コンソール出力を表示するターミナルパネル
 */
import React, { useRef, useEffect } from 'react';

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info' | 'result';
  content: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  messages: ConsoleMessage[];
  onRun: () => void;
  onClear: () => void;
  isRunning: boolean;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  messages,
  onRun,
  onClear,
  isRunning,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageClass = (type: ConsoleMessage['type']): string => {
    switch (type) {
      case 'error':
        return 'console-error';
      case 'warn':
        return 'console-warn';
      case 'info':
        return 'console-info';
      case 'result':
        return 'console-result';
      default:
        return 'console-log';
    }
  };

  const getMessagePrefix = (type: ConsoleMessage['type']): string => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'result':
        return '←';
      default:
        return '>';
    }
  };

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span className="terminal-title">💻 コンソール</span>
        <div className="terminal-actions">
          <button
            className="btn-terminal-run"
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? '⏳ 実行中...' : '▶️ 実行'}
          </button>
          <button
            className="btn-terminal-clear"
            onClick={onClear}
          >
            🗑️ クリア
          </button>
        </div>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {messages.length === 0 ? (
          <div className="terminal-placeholder">
            <span className="placeholder-icon">💡</span>
            <span>コードを実行すると、ここに出力が表示されます</span>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`console-line ${getMessageClass(msg.type)}`}
            >
              <span className="console-prefix">{getMessagePrefix(msg.type)}</span>
              <span className="console-content">{msg.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
