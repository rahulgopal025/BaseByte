import axiosInstance from './axios.instance';

const BASE = '/api/admin';

// Stats
export const getAdminStats = () => axiosInstance.get(`${BASE}/stats`);

// Students
export const getStudents = () => axiosInstance.get(`${BASE}/students`);
export const deleteStudent = (id: string) => axiosInstance.delete(`${BASE}/students/${id}`);

// Enrollments
export const getAllEnrollments = () => axiosInstance.get(`${BASE}/enrollments`);
export const getPendingEnrollments = () => axiosInstance.get(`${BASE}/enrollments/pending`);
export const updateEnrollmentStatus = (enrollmentId: string, status: 'approved' | 'rejected') =>
  axiosInstance.put(`${BASE}/enrollments/status`, { enrollmentId, status });

// Courses
export const getAdminCourses = () => axiosInstance.get(`${BASE}/courses`);
export const createCourse = (data: any) => axiosInstance.post(`${BASE}/courses`, data);
export const updateCourse = (id: string, data: any) => axiosInstance.put(`${BASE}/courses/${id}`, data);
export const deleteCourse = (id: string) => axiosInstance.delete(`${BASE}/courses/${id}`);

// Lectures
export const getAdminLectures = () => axiosInstance.get(`${BASE}/lectures`);
export const createLecture = (data: any) => axiosInstance.post(`${BASE}/lectures`, data);
export const updateLecture = (id: string, data: any) => axiosInstance.put(`${BASE}/lectures/${id}`, data);
export const deleteLecture = (id: string) => axiosInstance.delete(`${BASE}/lectures/${id}`);

// Problems
export const getAdminProblems = () => axiosInstance.get(`${BASE}/problems`);
export const createProblem = (data: any) => axiosInstance.post(`${BASE}/problems`, data);
export const updateProblem = (id: string, data: any) => axiosInstance.put(`${BASE}/problems/${id}`, data);
export const deleteProblem = (id: string) => axiosInstance.delete(`${BASE}/problems/${id}`);

// Bulk Quiz Upload
export const bulkUploadQuiz = (questions: any[]) =>
  axiosInstance.post(`${BASE}/quiz/bulk`, { questions });
export const deleteQuizQuestion = (id: string) => axiosInstance.delete(`${BASE}/quiz/${id}`);

// Notes
export const getAdminNotes = () => axiosInstance.get(`${BASE}/notes`);
export const uploadAdminNotes = (data: any) => axiosInstance.post(`${BASE}/notes`, data);
export const approveNotes = (id: string) => axiosInstance.put(`${BASE}/notes/approve/${id}`);
export const deleteNotes = (id: string) => axiosInstance.delete(`${BASE}/notes/${id}`);

// Feedback
export const getAdminFeedback = () => axiosInstance.get(`${BASE}/feedback`);
export const deleteFeedback = (id: string) => axiosInstance.delete(`${BASE}/feedback/${id}`);

// Notifications
export const getAdminNotifications = () => axiosInstance.get('/api/notifications/admin');
export const createAdminNotification = (data: any) => axiosInstance.post('/api/notifications', data);
export const updateAdminNotification = (id: string, data: any) => axiosInstance.put(`/api/notifications/${id}`, data);
export const deleteAdminNotification = (id: string) => axiosInstance.delete(`/api/notifications/${id}`);
