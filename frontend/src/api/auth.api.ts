import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../constants/api.constants';

export const sendOtpApi = (email: string, type: 'register' | 'reset') => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, { email, type });
};

export const verifyOtpApi = (email: string, otp: string, type: 'register' | 'reset') => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp, type });
};

export const completeSignupApi = (email: string, otp: string, name: string, password: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.COMPLETE_SIGNUP, { email, otp, name, password });
};

export const resetPasswordApi = (email: string, otp: string, newPassword: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, newPassword });
};

export const loginApi = (email: string, password: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
};

export const googleAuthApi = (token: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.GOOGLE, { token });
};

export const githubAuthApi = (code: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.GITHUB, { code });
};

export const logoutApi = (refreshToken: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
};

export const refreshTokenApi = (refreshToken: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
};
