import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const createPaymentOrder = (courseId: string) => axiosInstance.post(`${API_ENDPOINTS.PAYMENT}/create`, { courseId });
export const verifyPayment = (data: Record<string, unknown>) => axiosInstance.post(`${API_ENDPOINTS.PAYMENT}/verify`, data);
