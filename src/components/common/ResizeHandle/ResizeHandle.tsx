/**
 * ResizeHandle
 * リサイズハンドルコンポーネント
 */
import React from 'react';

interface ResizeHandleProps {
  className?: string;
  onMouseDown: () => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  className = 'resize-handle',
  onMouseDown,
}) => {
  return (
    <div
      className={className}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
};
