# BaseByte — Complete Admin Panel Build Prompt
# For Antigravity IDE
# Read every word carefully. Build exactly what is described.
# All existing code has been analyzed. Do not touch anything not mentioned.

---

## PROJECT CONTEXT

BaseByte is a MERN stack coding education platform.
- Backend: Node.js + Express + MongoDB (ES Modules "type":"module")
- Frontend: React 19 + TypeScript + Tailwind CSS
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Admin login: admin@basebyte.com / adminpassword123
- Admin routes are at /admin/* — separate from UserLayout (no Navbar/Footer)

---

## WHAT ALREADY EXISTS — DO NOT TOUCH

Backend models already created and working:
- User.js (has role: student/admin)
- Course.js (title, description, thumbnail, price, isFree, instructor, category, tags, isPublished)
- Lecture.js (courseId, title, videoUrl, notes, order, duration, isLive, liveLink)
- Enrollment.js (userId, userEmail, courseId, status: pending/approved/rejected, paymentId)
- Notes.js (uploadedBy, uploaderEmail, title, fileUrl, subject, price, isFree, isApproved, downloads)
- Problem.js (title, description, difficulty, language, tags, sampleInput, sampleOutput, testCases)
- Quiz.js (language, topic, question, options, correctAnswer, explanation)
- Feedback.js (userId, userEmail, courseId, type, rating, comment)

Backend routes already working:
- GET /api/admin/students — returns all students
- GET /api/admin/enrollments/pending — returns pending enrollments
- PUT /api/admin/enrollments/status — approve/reject enrollment
- POST /api/admin/lectures/add — add lecture
- GET /api/admin/lectures/all — get all lectures
- GET /api/courses — get all courses
- POST /api/courses — create course (admin)
- PUT /api/courses/:id — update course (admin)
- DELETE /api/courses/:id — delete course (admin)
- GET /api/problems — get all problems
- GET /api/quizzes/:lang/:topic — get quiz by topic
- POST /api/notes/upload — upload notes
- GET /api/notes — get all notes
- PUT /api/notes/approve/:id — approve notes (admin)
- GET /api/feedback — get all feedback (admin)
- POST /api/feedback — submit feedback

Frontend admin pages currently exist as placeholders:
- frontend/src/pages/admin/AdminDashboard.tsx (has stat cards but data is "—")
- frontend/src/pages/admin/AdminCourses.tsx (placeholder)
- frontend/src/pages/admin/AdminLectures.tsx (placeholder)
- frontend/src/pages/admin/AdminStudents.tsx (placeholder)
- frontend/src/pages/admin/AdminEnrollments.tsx (placeholder)
- frontend/src/pages/admin/AdminProblems.tsx (placeholder)
- frontend/src/pages/admin/AdminFeedback.tsx (placeholder)
- frontend/src/pages/admin/AdminNotes.tsx (placeholder)

AdminLayout currently has a placeholder sidebar.
AdminSidebar is a placeholder component.

---

## DESIGN SYSTEM — APPLY TO ALL ADMIN FILES

Background: #050505
Sidebar bg: #08080A
Card bg: #0d0d0e
Border: border-white/5 or border-white/10 on hover
Primary: indigo-600 / indigo-500
Text primary: white
Text secondary: zinc-400 or zinc-500
Text muted: zinc-600
Accent colors per section:
  - Dashboard: indigo
  - Students: blue
  - Courses: purple
  - Lectures: violet
  - Problems: emerald
  - Quiz: yellow
  - Notes: pink
  - Enrollments: orange
  - Feedback: rose

Fonts: font-black for headings, font-bold for labels, font-medium for body
Rounded: rounded-[24px] or rounded-[32px] for cards, rounded-2xl for buttons
Buttons: px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest
All transitions: transition-all duration-300
Active nav: bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500
Inactive nav: text-zinc-500 hover:text-white hover:bg-white/5

---

## PART 1 — BACKEND: ADD MISSING API ENDPOINTS

### FILE: backend/routes/admin.routes.js
REPLACE the entire file with this complete version:

```js
import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';
import Notes from '../models/Notes.js';
import Feedback from '../models/Feedback.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();
router.use(verifyToken, verifyAdmin);

// ─── DASHBOARD STATS ─────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    totalProblems,
    totalQuizzes,
    totalFeedback,
    totalNotes,
    pendingEnrollments,
    recentStudents
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Problem.countDocuments(),
    Quiz.countDocuments(),
    Feedback.countDocuments(),
    Notes.countDocuments({ isApproved: true }),
    Enrollment.countDocuments({ status: 'pending' }),
    User.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  res.json(new ApiResponse(200, {
    totalStudents,
    totalCourses,
    totalProblems,
    totalQuizzes,
    totalFeedback,
    totalNotes,
    pendingEnrollments,
    recentStudents
  }, 'Stats fetched.'));
}));

// ─── STUDENT MANAGEMENT ──────────────────────────────────────────
router.get('/students', asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, students, 'Students fetched.'));
}));

router.delete('/students/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Student deleted.'));
}));

// ─── ENROLLMENT MANAGEMENT ───────────────────────────────────────
router.get('/enrollments', asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, enrollments, 'Enrollments fetched.'));
}));

router.get('/enrollments/pending', asyncHandler(async (req, res) => {
  const pending = await Enrollment.find({ status: 'pending' })
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, pending, 'Pending enrollments fetched.'));
}));

router.put('/enrollments/status', asyncHandler(async (req, res) => {
  const { enrollmentId, status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Use approved or rejected.');
  }
  const updated = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status },
    { new: true }
  );
  if (!updated) throw new ApiError(404, 'Enrollment not found.');
  res.json(new ApiResponse(200, updated, `Enrollment ${status}.`));
}));

// ─── COURSE MANAGEMENT ───────────────────────────────────────────
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, courses, 'Courses fetched.'));
}));

router.post('/courses', asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(new ApiResponse(201, course, 'Course created.'));
}));

router.put('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course updated.'));
}));

router.delete('/courses/:id', asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Course deleted.'));
}));

// ─── LECTURE MANAGEMENT ──────────────────────────────────────────
router.get('/lectures', asyncHandler(async (req, res) => {
  const lectures = await Lecture.find()
    .populate('courseId', 'title')
    .sort({ order: 1 });
  res.json(new ApiResponse(200, lectures, 'Lectures fetched.'));
}));

router.post('/lectures', asyncHandler(async (req, res) => {
  const lecture = await Lecture.create(req.body);
  res.status(201).json(new ApiResponse(201, lecture, 'Lecture added.'));
}));

router.put('/lectures/:id', asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lecture) throw new ApiError(404, 'Lecture not found.');
  res.json(new ApiResponse(200, lecture, 'Lecture updated.'));
}));

router.delete('/lectures/:id', asyncHandler(async (req, res) => {
  await Lecture.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Lecture deleted.'));
}));

// ─── PROBLEM MANAGEMENT ──────────────────────────────────────────
router.get('/problems', asyncHandler(async (req, res) => {
  const problems = await Problem.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, problems, 'Problems fetched.'));
}));

router.post('/problems', asyncHandler(async (req, res) => {
  const problem = await Problem.create(req.body);
  res.status(201).json(new ApiResponse(201, problem, 'Problem created.'));
}));

router.put('/problems/:id', asyncHandler(async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!problem) throw new ApiError(404, 'Problem not found.');
  res.json(new ApiResponse(200, problem, 'Problem updated.'));
}));

router.delete('/problems/:id', asyncHandler(async (req, res) => {
  await Problem.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Problem deleted.'));
}));

// ─── BULK QUIZ UPLOAD ─────────────────────────────────────────────
router.post('/quiz/bulk', asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, 'questions must be a non-empty array.');
  }
  const inserted = await Quiz.insertMany(questions);
  res.status(201).json(new ApiResponse(201, {
    count: inserted.length
  }, `${inserted.length} quiz questions uploaded successfully.`));
}));

router.delete('/quiz/:id', asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Quiz question deleted.'));
}));

// ─── NOTES MANAGEMENT ────────────────────────────────────────────
router.get('/notes', asyncHandler(async (req, res) => {
  const notes = await Notes.find()
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
}));

router.post('/notes', asyncHandler(async (req, res) => {
  const note = await Notes.create({
    ...req.body,
    uploadedBy: req.user.id,
    uploaderEmail: req.user.email,
    isApproved: true
  });
  res.status(201).json(new ApiResponse(201, note, 'Notes uploaded.'));
}));

router.put('/notes/approve/:id', asyncHandler(async (req, res) => {
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notes not found.');
  res.json(new ApiResponse(200, note, 'Notes approved.'));
}));

router.delete('/notes/:id', asyncHandler(async (req, res) => {
  await Notes.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Notes deleted.'));
}));

// ─── FEEDBACK MANAGEMENT ─────────────────────────────────────────
router.get('/feedback', asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, feedbacks, 'Feedback fetched.'));
}));

router.delete('/feedback/:id', asyncHandler(async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Feedback deleted.'));
}));

export default router;
```

---

## PART 2 — FRONTEND: ADMIN API LAYER

### FILE: frontend/src/api/admin.api.ts
CREATE this new file:

```ts
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
```

---

## PART 3 — FRONTEND: ADMIN LAYOUT WITH PROPER SIDEBAR

### FILE: frontend/src/components/layout/AdminLayout.tsx
REPLACE entire file:

```tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
```

### FILE: frontend/src/components/admin/AdminSidebar.tsx
REPLACE entire file with this complete sidebar:

```tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, Users, BookOpen, Video,
  Code2, FileQuestion, FileText, ClipboardList,
  MessageSquare, LogOut, Code, ChevronLeft,
  ChevronRight, Zap
} from "lucide-react";

const navItems = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard, color: "text-indigo-400" },
    ]
  },
  {
    section: "Users",
    items: [
      { label: "Students", path: "/admin/students", icon: Users, color: "text-blue-400" },
      { label: "Enrollments", path: "/admin/enrollments", icon: ClipboardList, color: "text-orange-400" },
    ]
  },
  {
    section: "Content",
    items: [
      { label: "Courses", path: "/admin/courses", icon: BookOpen, color: "text-purple-400" },
      { label: "Lectures", path: "/admin/lectures", icon: Video, color: "text-violet-400" },
      { label: "Problems", path: "/admin/problems", icon: Code2, color: "text-emerald-400" },
      { label: "Quiz", path: "/admin/quiz", icon: FileQuestion, color: "text-yellow-400" },
      { label: "Notes", path: "/admin/notes", icon: FileText, color: "text-pink-400" },
    ]
  },
  {
    section: "Reports",
    items: [
      { label: "Feedback", path: "/admin/feedback", icon: MessageSquare, color: "text-rose-400" },
    ]
  }
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} min-h-screen bg-[#08080A] border-r border-white/5 flex flex-col transition-all duration-300 relative flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Code size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-white font-black text-base leading-tight">BaseByte</h1>
            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#08080A] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 mt-2">
        {navItems.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest px-3 mb-2">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${active
                        ? "bg-indigo-600/10 border border-indigo-500/20 text-white"
                        : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={active ? item.color : ""}
                    />
                    {!collapsed && (
                      <span className="text-sm font-bold">{item.label}</span>
                    )}
                    {!collapsed && active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white/[0.03] rounded-2xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-black truncate">{user?.name || "Admin"}</p>
              <p className="text-zinc-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
```

---

## PART 4 — ADMIN DASHBOARD WITH LIVE STATS

### FILE: frontend/src/pages/admin/AdminDashboard.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, BarChart3, FileText,
  FileQuestion, ClipboardList, MessageSquare,
  Zap, ArrowRight, Clock
} from "lucide-react";
import { getAdminStats } from "../../api/admin.api";

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalProblems: number;
  totalQuizzes: number;
  totalFeedback: number;
  totalNotes: number;
  pendingEnrollments: number;
  recentStudents: { _id: string; name: string; email: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", path: "/admin/students" },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", path: "/admin/courses" },
    { label: "Total Problems", value: stats.totalProblems, icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", path: "/admin/problems" },
    { label: "Quiz Questions", value: stats.totalQuizzes, icon: FileQuestion, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", path: "/admin/quiz" },
    { label: "Feedback", value: stats.totalFeedback, icon: MessageSquare, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", path: "/admin/feedback" },
    { label: "Approved Notes", value: stats.totalNotes, icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", path: "/admin/notes" },
  ] : [];

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
          <Zap size={18} className="text-indigo-400" fill="currentColor" />
        </div>
        <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Overview</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Dashboard</h1>
      <p className="text-zinc-500 font-medium mb-10">Welcome back, Admin. Here's your live overview.</p>

      {/* Pending Enrollments Alert */}
      {stats && stats.pendingEnrollments > 0 && (
        <div
          onClick={() => navigate("/admin/enrollments")}
          className="mb-8 flex items-center justify-between p-5 bg-orange-500/5 border border-orange-500/20 rounded-[20px] cursor-pointer hover:bg-orange-500/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <ClipboardList size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-white font-black">
                {stats.pendingEnrollments} Pending Enrollment{stats.pendingEnrollments > 1 ? "s" : ""}
              </p>
              <p className="text-zinc-500 text-sm">Waiting for your approval</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 cursor-pointer hover:border-white/10 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`inline-flex p-3 rounded-2xl border mb-4 ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className="text-4xl font-black mb-1">{card.value}</div>
              <div className="text-zinc-500 text-sm font-bold flex items-center justify-between">
                {card.label}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Students */}
      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Recent Signups</h2>
          <button
            onClick={() => navigate("/admin/students")}
            className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : stats?.recentStudents.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">No students yet.</p>
        ) : (
          <div className="space-y-2">
            {stats?.recentStudents.map((student) => (
              <div key={student._id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <span className="text-indigo-400 text-sm font-black">{student.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{student.name}</p>
                    <p className="text-zinc-500 text-xs">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-zinc-600 text-xs">
                  <Clock size={11} />
                  {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## PART 5 — ADMIN STUDENTS PAGE

### FILE: frontend/src/pages/admin/AdminStudents.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { Users, Search, Trash2, Mail, Calendar } from "lucide-react";
import { getStudents, deleteStudent } from "../../api/admin.api";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getStudents()
      .then((res) => setStudents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this student?")) return;
    setDeleting(id);
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch { alert("Failed to delete."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Users size={18} className="text-blue-400" />
        </div>
        <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Management</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Students</h1>
      <p className="text-zinc-500 font-medium mb-8">
        {students.length} total registered students
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-3 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Users size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No students found</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-4">Student</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Joined</div>
            <div className="col-span-1">Action</div>
          </div>
          {/* Rows */}
          {filtered.map((student, i) => (
            <div
              key={student._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-sm font-black">{student.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-bold text-sm truncate">{student.name}</span>
              </div>
              <div className="col-span-4 flex items-center gap-2 text-zinc-400 text-sm">
                <Mail size={12} className="flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="col-span-3 flex items-center gap-2 text-zinc-500 text-xs">
                <Calendar size={11} />
                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => handleDelete(student._id)}
                  disabled={deleting === student._id}
                  className="p-2 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 6 — ADMIN COURSES PAGE

### FILE: frontend/src/pages/admin/AdminCourses.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Edit, Eye, EyeOff, X } from "lucide-react";
import { getAdminCourses, createCourse, updateCourse, deleteCourse } from "../../api/admin.api";

const emptyForm = {
  title: "", description: "", thumbnail: "", price: 0,
  isFree: false, instructor: "", category: "", tags: "", isPublished: false
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getAdminCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editId) {
        await updateCourse(editId, payload);
      } else {
        await createCourse(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch { alert("Failed to save course."); }
    finally { setSaving(false); }
  };

  const handleEdit = (course: any) => {
    setForm({ ...course, tags: course.tags?.join(", ") || "" });
    setEditId(course._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    await deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c._id !== id));
  };

  const togglePublish = async (course: any) => {
    const updated = await updateCourse(course._id, { isPublished: !course.isPublished });
    setCourses((prev) => prev.map((c) => c._id === course._id ? updated.data.data : c));
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <BookOpen size={18} className="text-purple-400" />
            </div>
            <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Courses</h1>
          <p className="text-zinc-500 font-medium">{courses.length} total courses</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Course" : "New Course"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
              <input placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Instructor Name" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} />
                <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <input type="checkbox" id="isFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                  <label htmlFor="isFree" className="text-sm text-zinc-400 font-bold">Free Course</label>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                <label htmlFor="isPublished" className="text-sm text-zinc-400 font-bold">Publish immediately</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-48 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <BookOpen size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No courses yet. Create your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${course.isPublished ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-500 border-white/5"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <span className="text-indigo-400 font-black text-lg">
                  {course.isFree ? "Free" : `₹${course.price}`}
                </span>
              </div>
              <h3 className="font-black text-lg mb-1 leading-tight">{course.title}</h3>
              <p className="text-zinc-500 text-sm mb-1">{course.instructor}</p>
              <p className="text-zinc-600 text-sm line-clamp-2 mb-6">{course.description}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(course)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => togglePublish(course)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                  {course.isPublished ? <><EyeOff size={12} /> Unpublish</> : <><Eye size={12} /> Publish</>}
                </button>
                <button onClick={() => handleDelete(course._id)} className="p-2.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 7 — ADMIN ENROLLMENTS PAGE

### FILE: frontend/src/pages/admin/AdminEnrollments.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { ClipboardList, Check, X, Clock } from "lucide-react";
import { getAllEnrollments, updateEnrollmentStatus } from "../../api/admin.api";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getAllEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      await updateEnrollmentStatus(id, status);
      setEnrollments((prev) => prev.map((e) => e._id === id ? { ...e, status } : e));
    } catch { alert("Failed to update."); }
    finally { setUpdating(null); }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      approved: "bg-green-500/10 text-green-400 border-green-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return `text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${map[status] || ""}`;
  };

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    approved: enrollments.filter((e) => e.status === "approved").length,
    rejected: enrollments.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <ClipboardList size={18} className="text-orange-400" />
        </div>
        <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Management</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Enrollments</h1>
      <p className="text-zinc-500 font-medium mb-8">Manage student course access requests.</p>

      {/* Filter Tabs */}
      <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl w-fit mb-8 gap-1">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            {f} <span className={`${filter === f ? "bg-white/20" : "bg-white/5"} px-1.5 py-0.5 rounded-md text-[9px]`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <ClipboardList size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No {filter === "all" ? "" : filter} enrollments found.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-3">Student</div>
            <div className="col-span-3">Course</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filtered.map((enr, i) => (
            <div key={enr._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="col-span-3">
                <p className="text-white text-sm font-bold truncate">{enr.userId?.name || "—"}</p>
                <p className="text-zinc-500 text-xs truncate">{enr.userId?.email || enr.userEmail}</p>
              </div>
              <div className="col-span-3">
                <p className="text-white text-sm font-bold truncate">{enr.courseId?.title || "—"}</p>
                <p className="text-zinc-500 text-xs">{enr.courseId?.price === 0 ? "Free" : `₹${enr.courseId?.price}`}</p>
              </div>
              <div className="col-span-2"><span className={statusBadge(enr.status)}>{enr.status}</span></div>
              <div className="col-span-2 text-zinc-500 text-xs flex items-center gap-1">
                <Clock size={11} />{new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div className="col-span-2 flex gap-2">
                {enr.status === "pending" && (
                  <>
                    <button onClick={() => handleStatus(enr._id, "approved")} disabled={updating === enr._id} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                      <Check size={11} /> Approve
                    </button>
                    <button onClick={() => handleStatus(enr._id, "rejected")} disabled={updating === enr._id} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-50">
                      <X size={11} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 8 — ADMIN PROBLEMS PAGE WITH BULK UPLOAD

### FILE: frontend/src/pages/admin/AdminProblems.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { Code2, Plus, Trash2, Edit, X } from "lucide-react";
import { getAdminProblems, createProblem, updateProblem, deleteProblem } from "../../api/admin.api";

const emptyForm = {
  title: "", description: "", difficulty: "Easy",
  language: "c", tags: "", sampleInput: "", sampleOutput: ""
};

export default function AdminProblems() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getAdminProblems()
      .then((res) => setProblems(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editId) { await updateProblem(editId, payload); }
      else { await createProblem(payload); }
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } catch { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: any) => {
    setForm({ ...p, tags: p.tags?.join(", ") || "" });
    setEditId(p._id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this problem?")) return;
    await deleteProblem(id);
    setProblems((prev) => prev.filter((p) => p._id !== id));
  };

  const difficultyColor = (d: string) => ({
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  }[d] || "");

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Code2 size={18} className="text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Problems</h1>
          <p className="text-zinc-500 font-medium">{problems.length} total coding problems</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Add Problem
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Problem" : "New Problem"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Problem Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <textarea required placeholder="Problem Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={selectClass}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <textarea placeholder="Sample Input" rows={3} value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} className={inputClass + " resize-none font-mono text-xs"} />
                <textarea required placeholder="Sample Output" rows={3} value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} className={inputClass + " resize-none font-mono text-xs"} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60">
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problems List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />)}</div>
      ) : problems.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Code2 size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No problems yet.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-3">Actions</div>
          </div>
          {problems.map((p, i) => (
            <div key={p._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== problems.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="col-span-5 font-bold text-sm">{p.title}</div>
              <div className="col-span-2"><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor(p.difficulty)}`}>{p.difficulty}</span></div>
              <div className="col-span-2 text-zinc-400 text-sm uppercase font-bold">{p.language}</div>
              <div className="col-span-3 flex gap-2">
                <button onClick={() => handleEdit(p)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><Edit size={11} /> Edit</button>
                <button onClick={() => handleDelete(p._id)} className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 9 — ADMIN QUIZ PAGE (BULK UPLOAD)

### FILE: frontend/src/pages/admin/AdminQuiz.tsx
CREATE this new file:

```tsx
import { useState } from "react";
import { FileQuestion, Upload, CheckCircle2, AlertCircle, X, Plus, Trash2 } from "lucide-react";
import { bulkUploadQuiz } from "../../api/admin.api";

const emptyQuestion = {
  language: "c", topic: "", question: "",
  options: ["", "", "", ""], correctAnswer: 1, explanation: ""
};

export default function AdminQuiz() {
  const [questions, setQuestions] = useState<any[]>([{ ...emptyQuestion, options: ["", "", "", ""] }]);
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const addQuestion = () => setQuestions([...questions, { ...emptyQuestion, options: ["", "", "", ""] }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const updateQuestion = (i: number, field: string, value: any) => {
    setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions(questions.map((q, idx) => {
      if (idx !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  };

  const handleFormUpload = async () => {
    const valid = questions.every((q) => q.topic && q.question && q.options.every((o: string) => o) && q.explanation);
    if (!valid) { alert("Please fill all fields for every question."); return; }
    setUploading(true);
    try {
      const res = await bulkUploadQuiz(questions);
      setResult({ success: true, message: res.data.message });
      setQuestions([{ ...emptyQuestion, options: ["", "", "", ""] }]);
    } catch (err: any) {
      setResult({ success: false, message: err?.response?.data?.message || "Upload failed." });
    } finally { setUploading(false); }
  };

  const handleJsonUpload = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setUploading(true);
      const res = await bulkUploadQuiz(arr);
      setResult({ success: true, message: res.data.message });
      setJsonInput("");
    } catch (err: any) {
      setResult({ success: false, message: err?.response?.data?.message || "Invalid JSON or upload failed." });
    } finally { setUploading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <FileQuestion size={18} className="text-yellow-400" />
        </div>
        <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Content</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Quiz Manager</h1>
      <p className="text-zinc-500 font-medium mb-8">Bulk upload quiz questions for any language and topic.</p>

      {/* Result Banner */}
      {result && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-6 ${result.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-3">
            {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-bold text-sm">{result.message}</span>
          </div>
          <button onClick={() => setResult(null)} className="opacity-60 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl w-fit mb-8 gap-1">
        {(["form", "json"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === m ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>
            {m === "form" ? "Form Builder" : "JSON Upload"}
          </button>
        ))}
      </div>

      {mode === "json" ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
          <h2 className="text-lg font-black mb-2">Paste JSON Array</h2>
          <p className="text-zinc-500 text-sm mb-4">Format: Array of objects with language, topic, question, options (array of 4), correctAnswer (1-4), explanation</p>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 mb-4 text-xs font-mono text-zinc-400">
            {`[{\n  "language": "c",\n  "topic": "intro of c",\n  "question": "Your question here?",\n  "options": ["Option A", "Option B", "Option C", "Option D"],\n  "correctAnswer": 2,\n  "explanation": "Explanation here"\n}]`}
          </div>
          <textarea
            rows={12}
            placeholder="Paste your JSON array here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className={inputClass + " font-mono text-xs resize-none mb-4"}
          />
          <button onClick={handleJsonUpload} disabled={uploading || !jsonInput.trim()} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-60">
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload Questions"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-zinc-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select value={q.language} onChange={(e) => updateQuestion(qi, "language", e.target.value)} className={inputClass + " cursor-pointer"}>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
                <input placeholder="Topic (e.g. intro of c)" value={q.topic} onChange={(e) => updateQuestion(qi, "topic", e.target.value)} className={inputClass} />
              </div>
              <textarea rows={2} placeholder="Question text" value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} className={inputClass + " resize-none mb-4"} />
              <div className="grid grid-cols-2 gap-3 mb-4">
                {q.options.map((opt: string, oi: number) => (
                  <div key={oi} className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">{oi + 1}.</span>
                    <input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className={inputClass + " pl-8"} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2 block">Correct Answer</label>
                  <select value={q.correctAnswer} onChange={(e) => updateQuestion(qi, "correctAnswer", Number(e.target.value))} className={inputClass + " cursor-pointer"}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Option {n}</option>)}
                  </select>
                </div>
              </div>
              <textarea rows={2} placeholder="Explanation (shown after answering)" value={q.explanation} onChange={(e) => updateQuestion(qi, "explanation", e.target.value)} className={inputClass + " resize-none"} />
            </div>
          ))}

          <div className="flex gap-4">
            <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              <Plus size={16} /> Add Another
            </button>
            <button onClick={handleFormUpload} disabled={uploading} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20">
              <Upload size={16} /> {uploading ? "Uploading..." : `Upload ${questions.length} Question${questions.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## PART 10 — ADMIN NOTES PAGE

### FILE: frontend/src/pages/admin/AdminNotes.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Check, X } from "lucide-react";
import { getAdminNotes, uploadAdminNotes, approveNotes, deleteNotes } from "../../api/admin.api";

const emptyForm = { title: "", fileUrl: "", subject: "", price: 0, isFree: true };

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    getAdminNotes()
      .then((res) => setNotes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await uploadAdminNotes(form); setShowForm(false); setForm(emptyForm); load(); }
    catch { alert("Failed to upload."); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    await approveNotes(id);
    setNotes((prev) => prev.map((n) => n._id === id ? { ...n, isApproved: true } : n));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete these notes?")) return;
    await deleteNotes(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
              <FileText size={18} className="text-pink-400" />
            </div>
            <span className="text-pink-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Notes</h1>
          <p className="text-zinc-500 font-medium">{notes.length} total notes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> Upload Notes
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Upload Notes</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Notes Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <input required placeholder="File URL (Google Drive / Cloudinary)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className={inputClass} />
              <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <input type="checkbox" id="notesFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                  <label htmlFor="notesFree" className="text-sm text-zinc-400 font-bold">Free</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white disabled:opacity-60">
                  {saving ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map((i) => <div key={i} className="h-40 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <FileText size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No notes uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${note.isApproved ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                  {note.isApproved ? "Approved" : "Pending"}
                </span>
                <span className="text-indigo-400 font-black">{note.isFree ? "Free" : `₹${note.price}`}</span>
              </div>
              <h3 className="font-black mb-1">{note.title}</h3>
              <p className="text-zinc-500 text-sm mb-1">{note.subject}</p>
              <p className="text-zinc-600 text-xs mb-6">{note.uploaderEmail}</p>
              <div className="flex gap-2">
                {!note.isApproved && (
                  <button onClick={() => handleApprove(note._id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                    <Check size={12} /> Approve
                  </button>
                )}
                <a href={note.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">View</a>
                <button onClick={() => handleDelete(note._id)} className="p-2.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 11 — ADMIN FEEDBACK PAGE

### FILE: frontend/src/pages/admin/AdminFeedback.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Star } from "lucide-react";
import { getAdminFeedback, deleteFeedback } from "../../api/admin.api";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminFeedback()
      .then((res) => setFeedbacks(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    await deleteFeedback(id);
    setFeedbacks((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <MessageSquare size={18} className="text-rose-400" />
        </div>
        <span className="text-rose-400 text-xs font-black uppercase tracking-widest">Reports</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Feedback</h1>
      <p className="text-zinc-500 font-medium mb-8">{feedbacks.length} total feedback submissions</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-32 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <MessageSquare size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">No feedback yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">{fb.userId?.name || "Anonymous"}</p>
                  <p className="text-zinc-500 text-xs">{fb.userId?.email || fb.userEmail}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} />
                  ))}
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">{fb.comment}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${fb.type === "course" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                  {fb.type}
                </span>
                <button onClick={() => handleDelete(fb._id)} className="text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PART 12 — ADD QUIZ ROUTE TO APP.TSX AND ADMIN ROUTES

### FILE: frontend/src/App.tsx
Find the admin routes block and ADD the quiz route:
```tsx
<Route path="/admin/quiz" element={<AdminQuiz />} />
```
Add it after AdminProblems route. Also add the import at the top:
```tsx
import AdminQuiz from "./pages/admin/AdminQuiz";
```

### FILE: backend/routes/admin.routes.js
This is already updated in Part 1 above with the bulk quiz upload endpoint.
Make sure it is saved correctly.

---

## FINAL CHECKLIST

Backend:
- [ ] admin.routes.js has GET /stats endpoint
- [ ] admin.routes.js has bulk quiz POST /quiz/bulk endpoint
- [ ] admin.routes.js has full CRUD for courses, lectures, problems, notes, feedback
- [ ] admin.routes.js has student management with DELETE

Frontend:
- [ ] frontend/src/api/admin.api.ts created
- [ ] AdminLayout.tsx uses AdminSidebar properly
- [ ] AdminSidebar.tsx — full sidebar with collapse, all nav items, user info, logout
- [ ] AdminDashboard.tsx — fetches live stats, shows pending enrollments alert, recent students
- [ ] AdminStudents.tsx — list with search and delete
- [ ] AdminCourses.tsx — full CRUD with modal form, publish/unpublish toggle
- [ ] AdminEnrollments.tsx — all enrollments, filter tabs, approve/reject buttons
- [ ] AdminProblems.tsx — full CRUD with modal form
- [ ] AdminQuiz.tsx (NEW) — form builder + JSON bulk upload
- [ ] AdminNotes.tsx — upload, approve, delete
- [ ] AdminFeedback.tsx — view with star ratings, delete
- [ ] AdminLayout.tsx imports AdminSidebar (not placeholder)
- [ ] App.tsx imports AdminQuiz and adds /admin/quiz route
