import axiosInstance from './axios.instance';

const BASE = '/api/practice';

// Public/User
export const getAllPracticePaths = () => axiosInstance.get(`${BASE}`);
export const getPracticePathById = (id: string) => axiosInstance.get(`${BASE}/${id}`);

// Admin
export const createPracticePath = (data: any) => axiosInstance.post(`${BASE}`, data);
export const updatePracticePath = (id: string, data: any) => axiosInstance.put(`${BASE}/${id}`, data);
export const deletePracticePath = (id: string) => axiosInstance.delete(`${BASE}/${id}`);
