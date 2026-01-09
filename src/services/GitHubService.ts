/**
 * GitHub API Service
 * リポジトリ作成などのGitHub操作
 */
import { getGitHubToken } from '@/utils/githubStorage';

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
      auto_init: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'リポジトリの作成に失敗しました');
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
