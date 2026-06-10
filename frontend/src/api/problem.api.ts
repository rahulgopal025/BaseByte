import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getAllProblems = () => {
  return axiosInstance.get(API_ENDPOINTS.PROBLEMS);
};

export const getProblemById = (id: string) => {
  return axiosInstance.get(`${API_ENDPOINTS.PROBLEMS}/${id}`);
};
