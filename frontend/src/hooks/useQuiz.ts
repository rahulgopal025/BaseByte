import { useState, useCallback } from 'react';
import { getQuizByTopic } from '../api/quiz.api';
import type { Quiz } from '../types/quiz.types';

export const useQuiz = () => {
  const [questions, setQuestions] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuiz = useCallback(async (lang: string, topic: string) => {
    setLoading(true);
    try {
      const res = await getQuizByTopic(lang, topic);
      setQuestions(res.data.data || []);
    } catch { setQuestions([]); }
    finally { setLoading(false); }
  }, []);

  return { questions, loading, fetchQuiz };
};
