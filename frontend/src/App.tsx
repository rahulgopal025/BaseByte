import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes.constants";

// Layouts & Common
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NotFound from "./components/common/NotFound";

// Guards
import ProtectedRoute from "./components/guards/ProtectedRoute";
import AdminRoute from "./components/guards/AdminRoute";
import GuestRoute from "./components/guards/GuestRoute";

// Providers
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";

// User Pages
import Home from "./pages/user/Home";
import Practice from "./pages/user/Practice";
import Compiler from "./pages/user/Compiler";
import About from "./pages/user/About";
import Auth from "./pages/user/Auth";
import ProblemDetails from "./pages/user/ProblemDetails";
import ProblemSolve from "./pages/user/ProblemSolve";
import ProfilePage from "./pages/user/ProfilePage";
import QuizPage from "./pages/user/QuizPage";
import Topics from "./pages/user/Topics";
import Courses from "./pages/user/Courses";
import CourseDetails from "./pages/user/CourseDetails";
import CourseLearning from "./pages/user/CourseLearning";
import Notes from "./pages/user/Notes";
import Checkout from "./pages/user/Checkout";
import Feedback from "./pages/user/Feedback";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLectures from "./pages/admin/AdminLectures";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminProblems from "./pages/admin/AdminProblems";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminNotes from "./pages/admin/AdminNotes";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <div className="flex flex-col min-h-screen bg-[#050505]">
            <Routes>
              {/* ADMIN ROUTES */}
              <Route path={ROUTES.ADMIN} element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="lectures" element={<AdminLectures />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="problems" element={<AdminProblems />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="notes" element={<AdminNotes />} />
              </Route>

              {/* USER ROUTES (with Navbar & Footer) */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1 pt-16">
                      <Routes>
                        {/* Public Routes */}
                        <Route path={ROUTES.HOME} element={<Home />} />
                        <Route path={ROUTES.ABOUT} element={<About />} />
                        <Route path={ROUTES.PRACTICE} element={<Practice />} />
                        <Route path={ROUTES.COMPILER} element={<Compiler />} />
                        <Route path={ROUTES.COURSES} element={<Courses />} />
                        <Route path={ROUTES.COURSE_DETAILS} element={<CourseDetails />} />
                        
                        {/* Guest Only (Login/Signup) */}
                        <Route path={ROUTES.AUTH} element={<GuestRoute><Auth /></GuestRoute>} />

                        {/* Protected Routes */}
                        <Route path={ROUTES.PROBLEM_DETAILS} element={<ProtectedRoute><ProblemDetails /></ProtectedRoute>} />
                        <Route path={ROUTES.PROBLEM_SOLVE} element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />
                        <Route path={ROUTES.TOPICS} element={<ProtectedRoute><Topics /></ProtectedRoute>} />
                        <Route path={ROUTES.QUIZ} element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path={ROUTES.COURSE_LEARNING} element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
                        <Route path={ROUTES.NOTES} element={<ProtectedRoute><Notes /></ProtectedRoute>} />
                        <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path={ROUTES.FEEDBACK} element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

                        {/* Redirect /login and /signup to /auth */}
                        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.AUTH} replace />} />
                        <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.AUTH} replace />} />

                        {/* 404 Not Found */}
                        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}