/**
 * Section Management View
 * セクション一覧、作成、更新、削除
 */
import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import Editor from '@monaco-editor/react';
import { useSectionManagementViewModel } from '@/viewmodels/sections/useSectionManagementViewModel';
import { type Section } from '@/models/Section';

interface SectionFormState {
  sectionId: string;
  title: string;
  description: string;
  image: File | null;
}

interface SectionUpdateFormState {
  title: string;
  description: string;
  image: File | null;
}

export const SectionManagementView: React.FC = () => {
  const {
    subjects,
    sections,
    loading,
    error,
    success,
    fetchSubjects,
    fetchSections,
    loadSectionDetail,
    createSectionItem,
    updateSectionItem,
    deleteSectionItem,
    removeSectionImage,
  } = useSectionManagementViewModel();

  const [subjectId, setSubjectId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [createForm, setCreateForm] = useState<SectionFormState>({
    sectionId: '',
    title: '',
    description: '',
    image: null,
  });
  const [updateForm, setUpdateForm] = useState<SectionUpdateFormState>({
    title: '',
    description: '',
    image: null,
  });
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'markdown' | 'code'>('markdown');
  
  // コードエディター用state
  const [codeTab, setCodeTab] = useState<'html' | 'css' | 'javascript'>('html');
  const [codes, setCodes] = useState({ html: '', css: '', javascript: '' });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const DEFAULT_CODE = {
    html: `<div class="container">
  <h1>Hello, World!</h1>
  <button id="btn">クリック</button>
</div>`,
    css: `.container {
  text-align: center;
  padding: 20px;
}
h1 { color: #22c55e; }
button {
  padding: 10px 20px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}`,
    javascript: `const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  alert('ボタンがクリックされました！');
});`,
  };

  const updateCodePreview = () => {
    if (!iframeRef.current) return;
    const html = codes.html || DEFAULT_CODE.html;
    const css = codes.css || DEFAULT_CODE.css;
    const js = codes.javascript || DEFAULT_CODE.javascript;
    
    iframeRef.current.srcdoc = `<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body>${html}<script>try{${js}}catch(e){console.error(e)}</script></body></html>`;
  };

  // 初期ロード時に題材一覧を取得
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;
    const latestSection = sections.find(
      (section) => section.sectionId === Number(selectedSectionId)
    );
    if (latestSection) {
      setSelectedSection(latestSection);
    }
  }, [sections, selectedSectionId]);

  const handleSubjectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubjectId = event.target.value;
    setSubjectId(newSubjectId);
    setSelectedSectionId('');
    setSelectedSection(null);
    if (newSubjectId) {
      await fetchSections(Number(newSubjectId));
    }
  };

  const handleSectionSelect = async (sectionIdValue: string) => {
    setSelectedSectionId(sectionIdValue);
    if (!subjectId || !sectionIdValue) {
      setUpdateForm({ title: '', description: '', image: null });
      setSelectedSection(null);
      return;
    }
    const detail = await loadSectionDetail(Number(subjectId), Number(sectionIdValue));
    if (detail) {
      setUpdateForm({
        title: detail.title,
        description: detail.description,
        image: null,
      });
      setSelectedSection(detail);
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId) return;
    await createSectionItem(Number(subjectId), {
      sectionId: Number(createForm.sectionId),
      title: createForm.title,
      description: createForm.description,
      image: createForm.image,
    });
    setCreateForm({ sectionId: '', title: '', description: '', image: null });
  };

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectId || !selectedSectionId) return;
    await updateSectionItem(Number(subjectId), Number(selectedSectionId), {
      title: updateForm.title,
      description: updateForm.description,
      image: updateForm.image,
    });
    setUpdateForm({ ...updateForm, image: null });
  };

  const handleDelete = async () => {
    if (!subjectId || !selectedSectionId) return;
    await deleteSectionItem(Number(subjectId), Number(selectedSectionId));
    setSelectedSectionId('');
    setSelectedSection(null);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!subjectId || !selectedSectionId) return;
    await removeSectionImage(Number(subjectId), Number(selectedSectionId), imageId);
    // 削除後、セクション詳細を再取得して表示を更新
    await handleSectionSelect(selectedSectionId);
  };

  const handleCopyLink = async (imageUrl: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = imageUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alert('画像URLをコピーしました');
    } catch (error) {
      console.error('コピーに失敗しました', error);
      alert('コピーに失敗しました');
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  return (
    <div className="management-container">
      <h1>セクション管理</h1>
      <p>
        multipart/form-dataで画像をアップロード可能な <code>/api/subjects/{'{'}subjectId{'}'}/sections</code> 系エンドポイントを操作できます。
      </p>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="management-form inline-form">
        <label>
          題材を選択
          <select
            value={subjectId}
            onChange={handleSubjectChange}
            disabled={loading}
          >
            <option value="">題材を選択してください</option>
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.subjectId}: {subject.title}
              </option>
            ))}
          </select>
        </label>
        {loading && <span className="loading-indicator">読み込み中...</span>}
      </div>

      <div className="management-grid">
        <div className="management-card">
          <h2>セクション作成 (POST)</h2>
          <form className="management-form" onSubmit={handleCreateSubmit}>
            <label>
              セクションID
              <input
                type="number"
                min="0"
                max="100"
                value={createForm.sectionId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, sectionId: e.target.value })
                }
                required
              />
            </label>
            <label>
              タイトル
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
              />
            </label>
            <label>
              説明 (Markdown可)
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
              <button
                type="button"
                className="btn-preview"
                onClick={() => handlePreview(createForm.description)}
                disabled={!createForm.description}
              >
                👁️ プレビュー
              </button>
            </label>
            <label>
              画像ファイル (任意)
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCreateForm({ ...createForm, image: e.target.files?.[0] ?? null })
                }
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading || !subjectId}>
              {loading ? '送信中...' : '作成'}
            </button>
          </form>
        </div>

        <div className="management-card">
          <h2>セクション更新/削除</h2>
          <form className="management-form" onSubmit={handleUpdateSubmit}>
            <label>
              編集するセクション
              <select
                value={selectedSectionId}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">選択してください</option>
                {sections.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    #{section.sectionId} {section.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              タイトル
              <input
                type="text"
                value={updateForm.title}
                onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                required
              />
            </label>
            <label>
              説明
              <textarea
                value={updateForm.description}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, description: e.target.value })
                }
              />
              <button
                type="button"
                className="btn-preview"
                onClick={() => handlePreview(updateForm.description)}
                disabled={!updateForm.description}
              >
                👁️ プレビュー
              </button>
            </label>
            <label>
              画像ファイル (任意)
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, image: e.target.files?.[0] ?? null })
                }
              />
            </label>
            {selectedSection && (
              <div className="image-status">
                <p>現在の画像: {selectedSection.images?.length ?? 0}件</p>
                {selectedSection.images && selectedSection.images.length > 0 ? (
                  <ul className="image-list">
                    {selectedSection.images.map((image) => (
                      <li key={image.imageId}>
                        <div className="image-list-row">
                          <span className="image-label">画像ID: {image.imageId}</span>
                          <a href={image.imageUrl} target="_blank" rel="noreferrer">
                            新しいタブで開く
                          </a>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleCopyLink(image.imageUrl)}
                          >
                            リンクをコピー
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            disabled={loading}
                            onClick={() => handleDeleteImage(image.imageId)}
                          >
                            画像を削除
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>画像は登録されていません</p>
                )}
              </div>
            )}
            <div className="management-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !selectedSectionId}
              >
                {loading ? '更新中...' : '更新'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || !selectedSectionId}
                onClick={handleDelete}
              >
                削除
              </button>
            </div>
          </form>
        </div>
      </div>

      <section className="data-section">
        <h2>セクション一覧 (GET)</h2>
        {sections.length === 0 ? (
          <p>セクションが読み込まれていません。</p>
        ) : (
          <div className="data-table">
            <div className="data-table-header">
              <span>ID</span>
              <span>タイトル</span>
              <span>説明</span>
              <span>画像</span>
            </div>
            {sections.map((section) => (
              <div key={section.sectionId} className="data-table-row">
                <span>#{section.sectionId}</span>
                <span>{section.title}</span>
                <span className="table-description">{section.description}</span>
                <span>
                  {section.images && section.images.length > 0
                    ? `${section.images.length}件`
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Markdownプレビューモーダル */}
      {showPreview && (
        <div className={`preview-modal-overlay ${showPreview ? 'show' : ''}`} onClick={() => setShowPreview(false)}>
          <div className="preview-modal slide-in-left" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div className="preview-modal-tabs">
                <button 
                  className={`preview-tab-btn ${previewTab === 'markdown' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('markdown')}
                >
                  📄 Markdown
                </button>
                <button 
                  className={`preview-tab-btn ${previewTab === 'code' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('code')}
                >
                  💻 コードエディター
                </button>
              </div>
              <button className="preview-close-btn" onClick={() => setShowPreview(false)}>×</button>
            </div>
            
            {previewTab === 'markdown' ? (
              <div 
                className="preview-modal-content markdown-body"
                dangerouslySetInnerHTML={{ __html: marked(previewContent) as string }}
              />
            ) : (
              <div className="preview-modal-code">
                <div className="code-editor-section">
                  <div className="code-tabs">
                    <button 
                      className={`code-tab ${codeTab === 'html' ? 'active' : ''}`}
                      onClick={() => setCodeTab('html')}
                    >🌐 HTML</button>
                    <button 
                      className={`code-tab ${codeTab === 'css' ? 'active' : ''}`}
                      onClick={() => setCodeTab('css')}
                    >🎨 CSS</button>
                    <button 
                      className={`code-tab ${codeTab === 'javascript' ? 'active' : ''}`}
                      onClick={() => setCodeTab('javascript')}
                    >⚡ JS</button>
                  </div>
                  <Editor
                    height="300px"
                    language={codeTab}
                    theme="vs-dark"
                    value={codes[codeTab] || DEFAULT_CODE[codeTab]}
                    onChange={(value) => setCodes(prev => ({ ...prev, [codeTab]: value || '' }))}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </div>
                <div className="code-preview-section">
                  <div className="code-preview-header">
                    <span>👁️ プレビュー</span>
                    <button className="btn-run-code" onClick={updateCodePreview}>▶ 実行</button>
                  </div>
                  <iframe
                    ref={iframeRef}
                    className="code-preview-iframe"
                    title="Code Preview"
                    sandbox="allow-scripts allow-modals"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
