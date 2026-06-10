import { useState, useCallback } from 'react';
import axiosInstance from '../api/axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const useSubmission = () => {
  const [loading, setLoading] = useState(false);

  const saveSubmission = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.SUBMISSIONS, data);
      return res.data.data;
    } catch { return null; }
    finally { setLoading(false); }
  }, []);

  const getSubmissions = useCallback(async (problemId: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.SUBMISSIONS}/${problemId}`);
      return res.data.data || [];
    } catch { return []; }
    finally { setLoading(false); }
  }, []);

  return { loading, saveSubmission, getSubmissions };
};
