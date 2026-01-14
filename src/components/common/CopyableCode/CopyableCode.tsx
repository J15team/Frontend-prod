/**
 * Copyable Code Component
 * コピーボタン付きのコードブロック
 */
import React, { useState } from 'react';
import './CopyableCode.css';

interface CopyableCodeProps {
  children: React.ReactNode;
  className?: string;
}

export const CopyableCode: React.FC<CopyableCodeProps> = ({ children, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = typeof children === 'string' ? children : String(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <span className={`copyable-code-wrapper ${className}`}>
      <code className="copyable-code">{children}</code>
      <button
        className={`copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title={copied ? 'コピーしました！' : 'コピー'}
        aria-label={copied ? 'コピーしました' : 'コードをコピー'}
      >
        {copied ? '✓' : '📋'}
      </button>
    </span>
  );
};
