import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const getAllNotes = () => axiosInstance.get(API_ENDPOINTS.NOTES);
export const uploadNotes = (data: FormData) => axiosInstance.post(`${API_ENDPOINTS.NOTES}/upload`, data);
