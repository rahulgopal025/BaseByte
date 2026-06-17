import axiosInstance from './axios.instance';

const BASE = '/api/submissions';

export const saveSubmission = (data: any) => axiosInstance.post(`${BASE}`, data);
export const getMySubmissions = (problemId: string) => axiosInstance.get(`${BASE}/${problemId}`);
export const getAllMySubmissions = () => axiosInstance.get(`${BASE}`);
