/**
 * Loading Spinner Component
 * Pathlyブランドのローディング表示
 */
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '読み込み中...' 
}) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="sonar-sweep"></div>
        <img src="/icon.PNG" alt="Loading" className="spinner-icon" />
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};
