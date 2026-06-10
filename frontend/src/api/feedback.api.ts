import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const submitFeedback = (data: { type: string; rating: number; comment: string; courseId?: string }) => {
  return axiosInstance.post(API_ENDPOINTS.FEEDBACK, data);
};
