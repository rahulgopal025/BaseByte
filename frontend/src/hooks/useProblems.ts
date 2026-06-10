import { useState, useCallback } from 'react';
import { getAllProblems, getProblemById } from '../api/problem.api';
import type { Problem } from '../types/problem.types';

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      setProblems(res.data.data || []);
    } catch { /* handled by axios interceptor */ }
    finally { setLoading(false); }
  }, []);

  const fetchProblem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getProblemById(id);
      return res.data.data;
    } catch { return null; }
    finally { setLoading(false); }
  }, []);

  return { problems, loading, fetchProblems, fetchProblem };
};
