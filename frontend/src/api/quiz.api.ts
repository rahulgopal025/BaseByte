import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getQuizByTopic = (lang: string, topic: string) => {
  return axiosInstance.get(`${API_ENDPOINTS.QUIZZES}/${lang}/${topic}`);
};
