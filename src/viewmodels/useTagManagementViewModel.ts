/**
 * Tag Management ViewModel
 * タグ管理のロジックを管理するViewModel
 */
import { useState, useEffect, useCallback } from 'react';
import { type Tag, type CreateTagRequest } from '@/models/Tag';
import { type Subject } from '@/models/Subject';
import * as TagService from '@/services/TagService';
import { getAllSubjects } from '@/services/SubjectService';

interface TagManagementViewModelReturn {
  tags: Tag[];
  subjects: Subject[];
  subjectTags: Record<number, Tag[]>;
  loading: boolean;
  error: string | null;
  success: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchTags: () => Promise<void>;
  createTag: (payload: CreateTagRequest) => Promise<void>;
  deleteTag: (tagId: number) => Promise<void>;
  addTagToSubject: (subjectId: number, tagName: string) => Promise<void>;
  removeTagFromSubject: (subjectId: number, tagName: string) => Promise<void>;
  fetchSubjectTags: (subjectId: number) => Promise<void>;
}

export const useTagManagementViewModel = (): TagManagementViewModelReturn => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectTags, setSubjectTags] = useState<Record<number, Tag[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const fetchTags = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const data = await TagService.getAllTags(searchQuery || undefined);
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  }, []);

  const fetchSubjectTags = useCallback(async (subjectId: number) => {
    try {
      const tags = await TagService.getSubjectTags(subjectId);
      setSubjectTags(prev => ({ ...prev, [subjectId]: tags }));
    } catch (err) {
      console.error(`Failed to fetch tags for subject ${subjectId}:`, err);
    }
  }, []);

  const createTag = useCallback(async (payload: CreateTagRequest) => {
    setLoading(true);
    clearMessages();
    try {
      await TagService.createTag(payload);
      setSuccess(`タグ「${payload.name}」を作成しました`);
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchTags]);

  const deleteTag = useCallback(async (tagId: number) => {
    setLoading(true);
    clearMessages();
    try {
      const tag = tags.find(t => t.id === tagId);
      await TagService.deleteTag(tagId);
      setSuccess(`タグ「${tag?.name || tagId}」を削除しました`);
      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [tags, fetchTags]);

  const addTagToSubject = useCallback(async (subjectId: number, tagName: string) => {
    setLoading(true);
    clearMessages();
    try {
      await TagService.addTagToSubject(subjectId, tagName);
      setSuccess(`タグ「${tagName}」を題材に追加しました`);
      await fetchSubjectTags(subjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchSubjectTags]);

  const removeTagFromSubject = useCallback(async (subjectId: number, tagName: string) => {
    setLoading(true);
    clearMessages();
    try {
      await TagService.removeTagFromSubject(subjectId, tagName);
      setSuccess(`タグ「${tagName}」を題材から削除しました`);
      await fetchSubjectTags(subjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タグの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchSubjectTags]);

  useEffect(() => {
    fetchTags();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return {
    tags,
    subjects,
    subjectTags,
    loading,
    error,
    success,
    searchQuery,
    setSearchQuery,
    fetchTags,
    createTag,
    deleteTag,
    addTagToSubject,
    removeTagFromSubject,
    fetchSubjectTags,
  };
};
