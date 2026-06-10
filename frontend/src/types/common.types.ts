export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
