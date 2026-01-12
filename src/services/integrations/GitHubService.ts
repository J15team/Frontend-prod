/**
 * GitHub API Service
 * リポジトリ作成などのGitHub操作
 */
import { getGitHubToken } from '@/utils/storage/githubStorage';

const GITHUB_API_BASE = 'https://api.github.com';

interface CreateRepoOptions {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

interface RepoFile {
  path: string;
  content: string;
}

/**
 * リポジトリを作成
 */
export const createRepository = async (options: CreateRepoOptions): Promise<{ html_url: string; full_name: string }> => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub連携が必要です');
  }

  console.log('Creating repository with token:', token.substring(0, 10) + '...');

  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: options.name,
      description: options.description || '',
      private: options.isPrivate || false,
      auto_init: true, // 最初のコミットを作成（READMEで初期化）
    }),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub API error:', errorText);
    let errorMessage = 'リポジトリの作成に失敗しました';
    try {
      const error = JSON.parse(errorText);
      // 同名リポジトリが存在する場合
      if (error.errors?.some((e: { field: string; message: string }) => 
        e.field === 'name' && e.message.includes('already exists'))) {
        errorMessage = '同じ名前のリポジトリが既に存在します。別の名前を入力してください。';
      } else {
        errorMessage = error.message || errorMessage;
      }
    } catch {
      // テキストのまま使用
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * ファイルをリポジトリに追加
 */
export const addFileToRepo = async (
  owner: string,
  repo: string,
  file: RepoFile
): Promise<void> => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub連携が必要です');
  }

  // Base64エンコード
  const content = btoa(unescape(encodeURIComponent(file.content)));

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file.path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add ${file.path}`,
        content,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'ファイルの追加に失敗しました');
  }
};

/**
 * 既存ファイルを更新（SHAを取得して上書き）
 */
export const updateFileInRepo = async (
  owner: string,
  repo: string,
  file: RepoFile
): Promise<void> => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub連携が必要です');
  }

  // 既存ファイルのSHAを取得
  const getResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file.path}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  let sha: string | undefined;
  if (getResponse.ok) {
    const existingFile = await getResponse.json();
    sha = existingFile.sha;
  }

  // Base64エンコード
  const content = btoa(unescape(encodeURIComponent(file.content)));

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file.path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update ${file.path}`,
        content,
        ...(sha && { sha }),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'ファイルの更新に失敗しました');
  }
};

/**
 * 複数ファイルをリポジトリに追加
 */
export const addFilesToRepo = async (
  owner: string,
  repo: string,
  files: RepoFile[]
): Promise<void> => {
  for (const file of files) {
    await addFileToRepo(owner, repo, file);
  }
};
