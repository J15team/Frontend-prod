/**
 * PresetSelector Component
 * プリセット（言語/フレームワーク）を選択するドロップダウン
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  getPresetsByCategory,
  type PresetDefinition,
} from '@/config/languageConfig';

interface PresetSelectorProps {
  selected: PresetDefinition;
  onChange: (preset: PresetDefinition) => void;
  disabled?: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (preset: PresetDefinition) => {
    onChange(preset);
    setIsOpen(false);
  };

  const basicsPresets = getPresetsByCategory('basics');
  const frameworkPresets = getPresetsByCategory('framework');
  const otherPresets = getPresetsByCategory('other');

  return (
    <div className="preset-selector" ref={dropdownRef}>
      <button
        className="preset-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="preset-icon">{selected.icon}</span>
        <span className="preset-label">{selected.label}</span>
        <span className="preset-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="preset-dropdown" role="listbox">
          {/* 基礎 */}
          <div className="preset-category">
            <div className="preset-category-title">基礎</div>
            {basicsPresets.map((preset) => (
              <button
                key={preset.id}
                className={`preset-option ${selected.id === preset.id ? 'active' : ''}`}
                onClick={() => handleSelect(preset)}
                role="option"
                aria-selected={selected.id === preset.id}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-info">
                  <span className="preset-name">{preset.label}</span>
                  <span className="preset-desc">{preset.description}</span>
                </span>
              </button>
            ))}
          </div>

          {/* フレームワーク */}
          <div className="preset-category">
            <div className="preset-category-title">フレームワーク</div>
            {frameworkPresets.map((preset) => (
              <button
                key={preset.id}
                className={`preset-option ${selected.id === preset.id ? 'active' : ''}`}
                onClick={() => handleSelect(preset)}
                role="option"
                aria-selected={selected.id === preset.id}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-info">
                  <span className="preset-name">{preset.label}</span>
                  <span className="preset-desc">{preset.description}</span>
                </span>
              </button>
            ))}
          </div>

          {/* その他 */}
          {otherPresets.length > 0 && (
            <div className="preset-category">
              <div className="preset-category-title">その他</div>
              {otherPresets.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-option ${selected.id === preset.id ? 'active' : ''}`}
                  onClick={() => handleSelect(preset)}
                  role="option"
                  aria-selected={selected.id === preset.id}
                >
                  <span className="preset-icon">{preset.icon}</span>
                  <span className="preset-info">
                    <span className="preset-name">{preset.label}</span>
                    <span className="preset-desc">{preset.description}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
