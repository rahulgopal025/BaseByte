import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getAllCourses = () => axiosInstance.get(API_ENDPOINTS.COURSES);
export const getCourseById = (id: string) => axiosInstance.get(`${API_ENDPOINTS.COURSES}/${id}`);
export const requestEnrollment = (courseId: string) =>
  axiosInstance.post('/api/enrollments/request', { courseId });
export const getMyEnrollments = () => axiosInstance.get('/api/enrollments/my');
export const checkEnrollment = (courseId: string) =>
  axiosInstance.get(`/api/enrollments/check/${courseId}`);
