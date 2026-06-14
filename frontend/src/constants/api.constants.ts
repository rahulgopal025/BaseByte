export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  PROBLEMS: '/api/problems',
  QUIZZES: '/api/quizzes',
  PROFILE: '/api/profile',
  COURSES: '/api/courses',
  LECTURES: '/api/lectures',
  ENROLLMENTS: '/api/enrollments',
  PAYMENT: '/api/payment',
  NOTES: '/api/notes',
  FEEDBACK: '/api/feedback',
  SUBMISSIONS: '/api/submissions',
  RUN: '/api/compiler/run',
} as const;
