/**
 * useResizableLayout
 * パネルのリサイズロジックを管理するカスタムフック
 */
import { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableLayoutConfig {
  initialSidebarWidth?: number;
  initialContentWidth?: number;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  minContentWidth?: number;
  maxContentWidth?: number;
}

interface UseResizableLayoutReturn {
  sidebarWidth: number;
  contentWidth: number;
  mainContainerRef: React.RefObject<HTMLDivElement>;
  contentContainerRef: React.RefObject<HTMLDivElement>;
  handleSidebarMouseDown: () => void;
  handleContentMouseDown: () => void;
}

export const useResizableLayout = (config: ResizableLayoutConfig = {}): UseResizableLayoutReturn => {
  const {
    initialSidebarWidth = 280,
    initialContentWidth = 50,
    minSidebarWidth = 150,
    maxSidebarWidth = 400,
    minContentWidth = 10,
    maxContentWidth = 85,
  } = config;

  const [sidebarWidth, setSidebarWidth] = useState(initialSidebarWidth);
  const [contentWidth, setContentWidth] = useState(initialContentWidth);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const draggingSidebar = useRef(false);
  const draggingContent = useRef(false);

  const handleSidebarMouseDown = useCallback(() => {
    draggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleContentMouseDown = useCallback(() => {
    draggingContent.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingSidebar.current && mainContainerRef.current) {
      const containerRect = mainContainerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
        setSidebarWidth(newWidth);
      }
    }

    if (draggingContent.current && contentContainerRef.current) {
      const containerRect = contentContainerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= minContentWidth && newWidth <= maxContentWidth) {
        setContentWidth(newWidth);
      }
    }
  }, [minSidebarWidth, maxSidebarWidth, minContentWidth, maxContentWidth]);

  const handleMouseUp = useCallback(() => {
    draggingSidebar.current = false;
    draggingContent.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    sidebarWidth,
    contentWidth,
    mainContainerRef,
    contentContainerRef,
    handleSidebarMouseDown,
    handleContentMouseDown,
  };
};
