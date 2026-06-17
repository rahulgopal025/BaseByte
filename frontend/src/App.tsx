import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Layouts
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Guards
import ProtectedRoute from "./components/guards/ProtectedRoute";
import AdminRoute from "./components/guards/AdminRoute";
import GuestRoute from "./components/guards/GuestRoute";

// User Pages
import Home from "./pages/user/Home";
import Auth from "./pages/user/Auth";
import About from "./pages/user/About";
import Practice from "./pages/user/Practice";
import Compiler from "./pages/user/Compiler";
import PracticePathDetails from "./pages/user/PracticePathDetails";
import ProblemSolve from "./pages/user/ProblemSolve";
import Topics from "./pages/user/Topics";
import QuizPage from "./pages/user/QuizPage";
import ProfilePage from "./pages/user/ProfilePage";
import Courses from "./pages/user/Courses";
import CourseDetails from "./pages/user/CourseDetails";
import CourseLearning from "./pages/user/CourseLearning";
import Notes from "./pages/user/Notes";
import Checkout from "./pages/user/Checkout";
import Feedback from "./pages/user/Feedback";
import NotFound from "./components/common/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLectures from "./pages/admin/AdminLectures";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminProblems from "./pages/admin/AdminProblems";
import AdminQuiz from "./pages/admin/AdminQuiz";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminPracticePaths from "./pages/admin/AdminPracticePaths";
import AdminNotifications from "./pages/admin/AdminNotifications";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <NotificationProvider>
            <ToastProvider>
              <Routes>

              {/* USER ROUTES — with Navbar and Footer */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/compiler" element={<Compiler />} />
                <Route path="/courses" element={<Courses />} />

                <Route element={<GuestRoute />}>
                  <Route path="/auth" element={<Auth />} />
                </Route>
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/practice/:id" element={<PracticePathDetails />} />
                  <Route path="/solve/:id" element={<ProblemSolve />} />
                  <Route path="/topics/:lang" element={<Topics />} />
                  <Route path="/quiz/:lang/:topic" element={<QuizPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/courses/:id" element={<CourseDetails />} />
                  <Route path="/courses/:id/learn" element={<CourseLearning />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/feedback" element={<Feedback />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ADMIN ROUTES — OUTSIDE UserLayout, no Navbar/Footer */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/courses" element={<AdminCourses />} />
                  <Route path="/admin/lectures" element={<AdminLectures />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                  <Route path="/admin/problems" element={<AdminProblems />} />
                  <Route path="/admin/practice-paths" element={<AdminPracticePaths />} />
                  <Route path="/admin/quiz" element={<AdminQuiz />} />
                  <Route path="/admin/feedback" element={<AdminFeedback />} />
                  <Route path="/admin/notes" element={<AdminNotes />} />
                  <Route path="/admin/notifications" element={<AdminNotifications />} />
                </Route>
              </Route>

              </Routes>
            </ToastProvider>
          </NotificationProvider>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}