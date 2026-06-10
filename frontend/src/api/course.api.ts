import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getAllCourses = () => axiosInstance.get(API_ENDPOINTS.COURSES);
export const getCourseById = (id: string) => axiosInstance.get(`${API_ENDPOINTS.COURSES}/${id}`);
