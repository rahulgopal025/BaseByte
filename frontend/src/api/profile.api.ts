import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getProfile = () => {
  return axiosInstance.get(`${API_ENDPOINTS.PROFILE}/me`);
};

export const saveProfile = (data: Record<string, unknown>) => {
  return axiosInstance.post(`${API_ENDPOINTS.PROFILE}/save`, data);
};
