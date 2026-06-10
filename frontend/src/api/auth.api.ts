import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const signupApi = (name: string, email: string, password: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.SIGNUP, { name, email, password });
};

export const loginApi = (email: string, password: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
};

export const logoutApi = (refreshToken: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
};

export const refreshTokenApi = (refreshToken: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
};
