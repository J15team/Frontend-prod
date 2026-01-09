/**
 * ContentArea Component
 * コンテンツ表示エリアコンポーネント
 */
import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { type Section } from '@/models/Section';

interface ContentAreaProps {
  section: Section;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ section }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Markdownをパースして表示
      contentRef.current.innerHTML = marked.parse(section.description) as string;
    }
  }, [section.description]);

  return (
    <div className="content-area">
      <header className="content-header">
        <p className="content-section-id">セクション #{section.sectionId}</p>
        <h2>{section.title}</h2>
      </header>
      <div className="content-body" ref={contentRef} />
    </div>
  );
};
