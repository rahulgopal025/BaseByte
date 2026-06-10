export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
