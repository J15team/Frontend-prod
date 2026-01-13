/**
 * Ranking ViewModel
 * ランキングページ用のViewModel
 */
import { useState, useEffect, useCallback } from 'react';
import { type SubjectRanking, type TagRanking } from '@/models/Ranking';
import { getSubjectRankings, getTagRankings } from '@/services/ranking/RankingService';

export const useRankingViewModel = () => {
  const [subjectRankings, setSubjectRankings] = useState<SubjectRanking[]>([]);
  const [tagRankings, setTagRankings] = useState<TagRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjects, tags] = await Promise.all([
        getSubjectRankings(10),
        getTagRankings(10),
      ]);
      setSubjectRankings(subjects);
      setTagRankings(tags);
    } catch (err) {
      console.error('ランキング取得エラー:', err);
      setError('ランキングの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return {
    subjectRankings,
    tagRankings,
    loading,
    error,
    refresh: fetchRankings,
  };
};
