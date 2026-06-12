# BaseByte — Complete Remaining Phases Prompt for Antigravity IDE
# Generated after reading EVERY file in the dev branch line by line.
# This covers Phase 0 remaining + Phase 2 complete + Phase 3 complete.
# Execute changes in the exact order listed. Do not skip any step.

---

## PROJECT CONTEXT

- Backend: Node.js + Express + MongoDB, ES Modules ("type":"module"), port 5000
- Frontend: React 19 + TypeScript + Tailwind CSS + Vite, port 5173
- Backend deployed on Render: https://basebyte-sl12.onrender.com
- Frontend deployed on Vercel: https://basebyte.vercel.app
- Admin credentials: admin@basebyte.com / adminpassword123

---

## WHAT IS 100% WORKING — DO NOT TOUCH THESE FILES

- backend/index.js — all middleware, routes, health check — correct
- backend/middleware/* — all 5 middleware files — correct
- backend/utils/* — ApiResponse, ApiError, asyncHandler, generateToken, logger — correct
- backend/models/* — all 12 models — correct
- backend/routes/auth.routes.js — correct
- backend/routes/problem.routes.js — correct
- backend/routes/quiz.routes.js — correct
- backend/routes/profile.routes.js — correct
- backend/routes/submission.routes.js — correct
- backend/routes/feedback.routes.js — correct
- backend/controllers/auth.controller.js — correct
- backend/controllers/problem.controller.js — correct
- backend/controllers/quiz.controller.js — correct
- backend/controllers/profile.controller.js — correct
- backend/controllers/submission.controller.js — correct
- backend/controllers/feedback.controller.js — correct
- frontend/src/App.tsx — all routes correct
- frontend/src/context/AuthContext.tsx — correct
- frontend/src/context/ProfileContext.tsx — correct
- frontend/src/context/ToastContext.tsx — correct
- frontend/src/api/axios.instance.ts — correct
- frontend/src/api/auth.api.ts — correct
- frontend/src/api/problem.api.ts — correct
- frontend/src/api/quiz.api.ts — correct
- frontend/src/api/admin.api.ts — correct
- frontend/src/components/guards/* — all 3 guards correct
- frontend/src/components/layout/Navbar.tsx — correct
- frontend/src/components/layout/UserLayout.tsx — correct
- frontend/src/components/layout/AdminLayout.tsx — correct
- frontend/src/components/admin/AdminSidebar.tsx — correct
- frontend/src/pages/admin/AdminDashboard.tsx — correct
- frontend/src/pages/admin/AdminStudents.tsx — correct
- frontend/src/pages/admin/AdminCourses.tsx — correct
- frontend/src/pages/admin/AdminEnrollments.tsx — correct
- frontend/src/pages/admin/AdminProblems.tsx — correct
- frontend/src/pages/admin/AdminQuiz.tsx — correct
- frontend/src/pages/admin/AdminNotes.tsx — correct
- frontend/src/pages/admin/AdminFeedback.tsx — correct
- frontend/src/pages/user/Auth.tsx — correct
- frontend/src/pages/user/Home.tsx — correct
- frontend/src/pages/user/Practice.tsx — correct
- frontend/src/pages/user/Compiler.tsx — correct
- frontend/src/pages/user/Topics.tsx — correct
- frontend/src/pages/user/QuizPage.tsx — correct
- frontend/src/pages/user/ProfilePage.tsx — correct
- frontend/src/pages/user/ProblemDetails.tsx — correct
- frontend/src/pages/user/ProblemSolve.tsx — correct
- frontend/src/pages/user/About.tsx — correct

---

## PART A — PHASE 0 REMAINING (2 fixes — do these first)

---

### A1 — REMOVE debug console.logs from admin stats route

FILE: backend/routes/admin.routes.js

Find and DELETE these exact 6 lines from the /stats route handler:
```
const totalUsers = await User.countDocuments();
const totalStudentsOnly = await User.countDocuments({ role: "student" });
const totalAdmins = await User.countDocuments({ role: "admin" });

console.log("TOTAL USERS:", totalUsers);
console.log("TOTAL STUDENTS:", totalStudentsOnly);
console.log("TOTAL ADMINS:", totalAdmins);
```

Do not change anything else in admin.routes.js.
The Promise.all block below these lines stays exactly as is.

---

### A2 — BUILD AdminLectures.tsx (currently a placeholder)

FILE: frontend/src/pages/admin/AdminLectures.tsx

REPLACE entire file with this complete implementation:

```tsx
import { useEffect, useState } from "react";
import { Video, Plus, Trash2, Edit, X, Wifi, WifiOff } from "lucide-react";
import { getAdminLectures, createLecture, updateLecture, deleteLecture } from "../../api/admin.api";
import { getAdminCourses } from "../../api/admin.api";

interface LectureForm {
  courseId: string;
  title: string;
  videoUrl: string;
  notes: string;
  order: number;
  duration: string;
  isLive: boolean;
  liveLink: string;
}

const emptyForm: LectureForm = {
  courseId: "", title: "", videoUrl: "", notes: "",
  order: 1, duration: "", isLive: false, liveLink: ""
};

export default function AdminLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LectureForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCourse, setFilterCourse] = useState("all");

  const load = async () => {
    try {
      const [lectRes, courseRes] = await Promise.all([
        getAdminLectures(),
        getAdminCourses()
      ]);
      setLectures(lectRes.data.data || []);
      setCourses(courseRes.data.data || []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) { alert("Please select a course."); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateLecture(editId, form);
      } else {
        await createLecture(form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    } catch { alert("Failed to save lecture."); }
    finally { setSaving(false); }
  };

  const handleEdit = (lecture: any) => {
    setForm({
      courseId: lecture.courseId?._id || lecture.courseId || "",
      title: lecture.title || "",
      videoUrl: lecture.videoUrl || "",
      notes: lecture.notes || "",
      order: lecture.order || 1,
      duration: lecture.duration || "",
      isLive: lecture.isLive || false,
      liveLink: lecture.liveLink || ""
    });
    setEditId(lecture._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lecture?")) return;
    await deleteLecture(id);
    setLectures(prev => prev.filter(l => l._id !== id));
  };

  const filtered = filterCourse === "all"
    ? lectures
    : lectures.filter(l => (l.courseId?._id || l.courseId) === filterCourse);

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";
  const selectClass = inputClass + " cursor-pointer";

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Video size={18} className="text-violet-400" />
            </div>
            <span className="text-violet-400 text-xs font-black uppercase tracking-widest">Content</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">Lectures</h1>
          <p className="text-zinc-500 font-medium">{lectures.length} total lectures</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Add Lecture
        </button>
      </div>

      {/* Course Filter */}
      {courses.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilterCourse("all")}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCourse === "all" ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
          >
            All Courses
          </button>
          {courses.map(c => (
            <button
              key={c._id}
              onClick={() => setFilterCourse(c._id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCourse === c._id ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{editId ? "Edit Lecture" : "New Lecture"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selector */}
              <div>
                <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-2">Select Course *</label>
                <select
                  required
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className={selectClass}
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <input
                required
                placeholder="Lecture Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Order (1, 2, 3...)"
                  min={1}
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className={inputClass}
                />
                <input
                  placeholder="Duration (e.g. 45 mins)"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Live toggle */}
              <div
                onClick={() => setForm({ ...form, isLive: !form.isLive })}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${form.isLive ? "bg-green-500/10 border-green-500/20" : "bg-white/[0.03] border-white/5"}`}
              >
                {form.isLive ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} className="text-zinc-500" />}
                <span className={`text-sm font-bold ${form.isLive ? "text-green-400" : "text-zinc-400"}`}>
                  {form.isLive ? "Live Lecture" : "Recorded Lecture"}
                </span>
              </div>

              {form.isLive ? (
                <input
                  placeholder="Live Link (Zoom / Google Meet URL)"
                  value={form.liveLink}
                  onChange={e => setForm({ ...form, liveLink: e.target.value })}
                  className={inputClass}
                />
              ) : (
                <>
                  <input
                    placeholder="Video URL (Cloudinary / YouTube embed)"
                    value={form.videoUrl}
                    onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Notes PDF URL (Google Drive / Cloudinary)"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className={inputClass}
                  />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Add Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lectures List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center">
          <Video size={32} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">
            {lectures.length === 0 ? "No lectures yet. Add your first lecture." : "No lectures for this course."}
          </p>
        </div>
      ) : (
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Course</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filtered.map((lecture, i) => (
            <div
              key={lecture._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== filtered.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div className="col-span-1 text-zinc-600 font-black text-sm">{lecture.order}</div>
              <div className="col-span-4">
                <p className="font-bold text-sm truncate">{lecture.title}</p>
                <p className="text-zinc-600 text-xs">{lecture.duration}</p>
              </div>
              <div className="col-span-3 text-zinc-400 text-sm truncate">
                {lecture.courseId?.title || "—"}
              </div>
              <div className="col-span-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${lecture.isLive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"}`}>
                  {lecture.isLive ? "Live" : "Recorded"}
                </span>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={() => handleEdit(lecture)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(lecture._id)}
                  className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
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

## PART B — PHASE 2: BACKEND CONTROLLERS (currently placeholders)

These 4 controllers are all "Phase 2 — To be implemented" stubs. Replace all of them.

---

### B1 — course.controller.js

FILE: backend/controllers/course.controller.js
REPLACE entire file:

```js
import Course from '../models/Course.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, courses, 'Courses fetched.'));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course fetched.'));
});

export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(new ApiResponse(201, course, 'Course created.'));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json(new ApiResponse(200, course, 'Course updated.'));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Course deleted.'));
});
```

---

### B2 — enrollment.controller.js

FILE: backend/controllers/enrollment.controller.js
REPLACE entire file:

```js
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requestEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError(400, 'courseId is required.');

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');

  const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
  if (existing) throw new ApiError(400, 'Already enrolled or request pending.');

  const status = course.isFree ? 'approved' : 'pending';

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    userEmail: req.user.email,
    courseId,
    status
  });

  res.status(201).json(new ApiResponse(201, enrollment,
    course.isFree ? 'Enrolled successfully.' : 'Enrollment request submitted.'
  ));
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userId: req.user.id, status: 'approved' })
    .populate('courseId', 'title description thumbnail instructor price isFree')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, enrollments, 'Enrollments fetched.'));
});

export const checkEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.courseId
  });
  res.json(new ApiResponse(200, {
    enrolled: !!enrollment,
    status: enrollment?.status || null
  }, 'Enrollment status fetched.'));
});

export const getPendingEnrollments = asyncHandler(async (req, res) => {
  const pending = await Enrollment.find({ status: 'pending' })
    .populate('userId', 'name email')
    .populate('courseId', 'title price')
    .sort({ enrolledAt: -1 });
  res.json(new ApiResponse(200, pending, 'Pending enrollments fetched.'));
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { enrollmentId, status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status.');
  }
  const updated = await Enrollment.findByIdAndUpdate(enrollmentId, { status }, { new: true });
  if (!updated) throw new ApiError(404, 'Enrollment not found.');
  res.json(new ApiResponse(200, updated, `Enrollment ${status}.`));
});
```

---

### B3 — notes.controller.js

FILE: backend/controllers/notes.controller.js
REPLACE entire file:

```js
import Notes from '../models/Notes.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Notes.find({ isApproved: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, notes, 'Notes fetched.'));
});

export const uploadNotes = asyncHandler(async (req, res) => {
  const { title, fileUrl, subject, price, isFree } = req.body;
  if (!title || !fileUrl) throw new ApiError(400, 'Title and fileUrl are required.');

  const note = await Notes.create({
    title, fileUrl, subject, price, isFree,
    uploadedBy: req.user.id,
    uploaderEmail: req.user.email,
    isApproved: false
  });

  res.status(201).json(new ApiResponse(201, note, 'Notes uploaded. Pending admin approval.'));
});

export const approveNotes = asyncHandler(async (req, res) => {
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!note) throw new ApiError(404, 'Notes not found.');
  res.json(new ApiResponse(200, note, 'Notes approved.'));
});
```

---

### B4 — payment.controller.js

FILE: backend/controllers/payment.controller.js
REPLACE entire file:

```js
import crypto from 'crypto';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// NOTE: Razorpay integration requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
// For now this returns mock data. Replace with real Razorpay SDK when keys are ready.

export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError(400, 'courseId is required.');

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (course.isFree) throw new ApiError(400, 'This course is free. No payment needed.');

  // When Razorpay keys are ready, replace this block with:
  // const Razorpay = (await import('razorpay')).default;
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const order = await razorpay.orders.create({ amount: course.price * 100, currency: 'INR' });

  const order = await Order.create({
    userId: req.user.id,
    courseId,
    amount: course.price,
    currency: 'INR',
    status: 'created'
  });

  res.status(201).json(new ApiResponse(201, {
    orderId: order._id,
    amount: course.price * 100,
    currency: 'INR',
    courseName: course.title,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
  }, 'Order created.'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, courseId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, 'Payment verification failed. Invalid signature.');
    }
  }

  await Order.findByIdAndUpdate(orderId, {
    status: 'paid',
    razorpayPaymentId: razorpay_payment_id
  });

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    userEmail: req.user.email,
    courseId,
    status: 'approved',
    paymentId: razorpay_payment_id || 'manual'
  });

  res.json(new ApiResponse(200, enrollment, 'Payment verified. Enrolled successfully.'));
});
```

---

### B5 — enrollment.routes.js — add checkEnrollment route

FILE: backend/routes/enrollment.routes.js
REPLACE entire file:

```js
import express from 'express';
import {
  requestEnrollment,
  getPendingEnrollments,
  updateEnrollmentStatus,
  getMyEnrollments,
  checkEnrollment
} from '../controllers/enrollment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/request', verifyToken, requestEnrollment);
router.get('/my', verifyToken, getMyEnrollments);
router.get('/check/:courseId', verifyToken, checkEnrollment);
router.get('/pending', verifyToken, verifyAdmin, getPendingEnrollments);
router.put('/status', verifyToken, verifyAdmin, updateEnrollmentStatus);

export default router;
```

---

### B6 — Fix seed scripts (they use require, project uses import)

FILE: backend/scripts/seed.js
REPLACE entire file:

```js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { default: Problem } = await import('../models/Problem.js');
const problemsData = JSON.parse(readFileSync(join(__dirname, '../data/seedProblems.json'), 'utf-8'));

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Problem.deleteMany({});
    await Problem.insertMany(problemsData);
    console.log(`✅ Seeded ${problemsData.length} problems successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDB();
```

FILE: backend/scripts/seedQuiz.js
REPLACE entire file:

```js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { default: Quiz } = await import('../models/Quiz.js');

const cData = JSON.parse(readFileSync(join(__dirname, '../data/cQuizzes.json'), 'utf-8'));
const pythonData = JSON.parse(readFileSync(join(__dirname, '../data/pythonQuizzes.json'), 'utf-8'));
const javaData = JSON.parse(readFileSync(join(__dirname, '../data/javaQuizzes.json'), 'utf-8'));

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Quiz.deleteMany({});
    const allQuizzes = [...cData, ...pythonData, ...javaData];
    await Quiz.insertMany(allQuizzes);
    console.log(`✅ Seeded ${allQuizzes.length} quiz questions successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
```

---

## PART C — PHASE 2: STUDENT-FACING PAGES

---

### C1 — Courses page (student view — browse all published courses)

FILE: frontend/src/pages/user/Courses.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Star, Users, Zap, IndianRupee } from "lucide-react";
import { getAllCourses } from "../../api/course.api";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "free" ? c.isFree : !c.isFree);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={12} fill="currentColor" /> BaseByte Courses
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
          Learn <span className="text-indigo-500">Everything</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-12 max-w-xl">
          Video lectures, live sessions, notes, and hands-on problems — all in one place.
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search courses or instructor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl gap-1">
            {(["all", "free", "paid"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold text-lg">
              {courses.length === 0 ? "No courses published yet. Check back soon!" : "No courses match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="bg-[#0d0d0e] border border-white/5 rounded-[24px] overflow-hidden hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-indigo-600/10 flex items-center justify-center border-b border-white/5 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={40} className="text-indigo-400/50" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${course.isFree ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"}`}>
                      {course.isFree ? "Free" : "Paid"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-zinc-500 text-sm mb-1">{course.instructor}</p>
                  {course.category && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 text-zinc-500 rounded-md">
                      {course.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="text-2xl font-black">
                      {course.isFree ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <IndianRupee size={18} className="text-indigo-400" />
                          <span>{course.price}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                      <Star size={12} fill="currentColor" /> 4.5
                    </div>
                  </div>
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

### C2 — CourseDetails page

FILE: frontend/src/pages/user/CourseDetails.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, User, Tag, CheckCircle2, Lock, IndianRupee, ArrowLeft } from "lucide-react";
import { getCourseById } from "../../api/course.api";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<{ enrolled: boolean; status: string | null } | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    getCourseById(id!)
      .then(res => setCourse(res.data.data))
      .catch(() => showToast("Course not found.", "error"))
      .finally(() => setLoading(false));

    if (user) {
      axiosInstance.get(`/api/enrollments/check/${id}`)
        .then(res => setEnrollment(res.data.data))
        .catch(console.error);
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    try {
      if (course.isFree) {
        await axiosInstance.post("/api/enrollments/request", { courseId: id });
        setEnrollment({ enrolled: true, status: "approved" });
        showToast("Enrolled successfully! You can now access the course.", "success");
      } else {
        navigate(`/checkout/${id}`);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to enroll.", "error");
    } finally {
      setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] p-16">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-zinc-800/60 rounded-[24px] animate-pulse" />
        <div className="h-6 w-full bg-zinc-800/40 rounded-xl animate-pulse" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-zinc-500 font-bold mb-4">Course not found.</p>
        <button onClick={() => navigate("/courses")} className="px-6 py-3 bg-indigo-600 rounded-xl font-black uppercase text-xs tracking-widest">Back to Courses</button>
      </div>
    </div>
  );

  const isEnrolled = enrollment?.enrolled && enrollment.status === "approved";
  const isPending = enrollment?.status === "pending";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate("/courses")} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Course Info */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-black uppercase tracking-widest mb-4">
              <Tag size={11} /> {course.category || "Course"}
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">{course.title}</h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">{course.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <User size={14} className="text-indigo-400" />
                <span>{course.instructor || "BaseByte Team"}</span>
              </div>
              {course.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {course.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 text-zinc-500 text-xs rounded-md font-bold">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* What you'll learn */}
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 mb-6">
              <h2 className="text-xl font-black mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Fundamentals and core concepts", "Hands-on coding problems", "Real-world applications", "Quiz assessments"].map(item => (
                  <div key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Enroll Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#0d0d0e] border border-white/5 rounded-[32px] p-6 sticky top-24">
              {/* Price */}
              <div className="text-4xl font-black mb-2">
                {course.isFree ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <IndianRupee size={28} className="text-indigo-400" />
                    {course.price}
                  </span>
                )}
              </div>
              {!course.isFree && (
                <p className="text-zinc-500 text-xs mb-4">One-time payment. Lifetime access.</p>
              )}

              {/* Enroll Button */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/courses/${id}/learn`)}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 mb-4"
                >
                  Continue Learning →
                </button>
              ) : isPending ? (
                <div className="w-full py-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl font-black uppercase text-xs tracking-widest text-center mb-4">
                  Enrollment Pending Approval
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 mb-4 disabled:opacity-60 shadow-lg shadow-indigo-600/20"
                >
                  {enrolling ? "Processing..." : course.isFree ? "Enroll for Free" : "Buy Course"}
                </button>
              )}

              {/* Features */}
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-400" /> Full course access</div>
                <div className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> Learn at your own pace</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400" /> Certificate on completion</div>
                {!course.isFree && <div className="flex items-center gap-2"><Lock size={14} className="text-zinc-600" /> Secure payment via Razorpay</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### C3 — CourseLearning page (watch lectures)

FILE: frontend/src/pages/user/CourseLearning.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, FileText, Wifi, CheckCircle2, Lock } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { getCourseById } from "../../api/course.api";
import { useToastContext } from "../../context/ToastContext";

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes, lectureRes] = await Promise.all([
          getCourseById(id!),
          axiosInstance.get(`/api/enrollments/check/${id}`),
          axiosInstance.get(`/api/admin/lectures?courseId=${id}`)
        ]);
        setCourse(courseRes.data.data);
        const isEnrolled = enrollRes.data.data?.enrolled && enrollRes.data.data?.status === "approved";
        setEnrolled(isEnrolled || courseRes.data.data?.isFree);
        const lects = lectureRes.data.data?.filter((l: any) => (l.courseId?._id || l.courseId) === id) || [];
        setLectures(lects.sort((a: any, b: any) => a.order - b.order));
        if (lects.length > 0) setSelected(lects[0]);
      } catch {
        showToast("Failed to load course.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-zinc-500 font-bold animate-pulse">Loading course...</div>
    </div>
  );

  if (!enrolled) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white text-center p-8">
      <div>
        <Lock size={40} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
        <p className="text-zinc-500 mb-6">You need to enroll in this course to access lectures.</p>
        <button onClick={() => navigate(`/courses/${id}`)} className="px-8 py-3 bg-indigo-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">
          View Course
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#08080A]">
        <button onClick={() => navigate("/courses")} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-lg truncate">{course?.title}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Lecture List */}
        <aside className="w-72 border-r border-white/5 bg-[#08080A] overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">
              {lectures.length} Lectures
            </p>
            {lectures.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No lectures added yet.</p>
            ) : (
              <div className="space-y-1">
                {lectures.map(lecture => (
                  <button
                    key={lecture._id}
                    onClick={() => setSelected(lecture)}
                    className={`w-full text-left p-3 rounded-2xl transition-all ${selected?._id === lecture._id ? "bg-indigo-600/10 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${selected?._id === lecture._id ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-500"}`}>
                        {lecture.order}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${selected?._id === lecture._id ? "text-white" : "text-zinc-400"}`}>
                          {lecture.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lecture.isLive ? (
                            <span className="text-[9px] font-black text-green-400 flex items-center gap-1"><Wifi size={9} /> Live</span>
                          ) : (
                            <span className="text-[9px] text-zinc-600 flex items-center gap-1"><Play size={9} /> {lecture.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main — Video Player */}
        <main className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <Play size={40} className="mx-auto mb-4" />
                <p className="font-bold">Select a lecture to start learning</p>
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-black mb-2">{selected.title}</h2>
              <p className="text-zinc-500 text-sm mb-8">{selected.duration}</p>

              {selected.isLive ? (
                <div className="bg-[#0d0d0e] border border-green-500/20 rounded-[24px] p-8 text-center mb-8">
                  <Wifi size={32} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-green-400 mb-2">Live Session</h3>
                  <p className="text-zinc-400 text-sm mb-6">Click the button below to join the live lecture.</p>
                  <a
                    href={selected.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                  >
                    <Wifi size={14} /> Join Live Session
                  </a>
                </div>
              ) : selected.videoUrl ? (
                <div className="bg-black rounded-[24px] overflow-hidden mb-8 aspect-video">
                  <iframe
                    src={selected.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={selected.title}
                  />
                </div>
              ) : (
                <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 text-center mb-8">
                  <Play size={32} className="text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">Video not yet uploaded for this lecture.</p>
                </div>
              )}

              {/* Notes Download */}
              {selected.notes && (
                <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                        <FileText size={16} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="font-bold">Lecture Notes</p>
                        <p className="text-zinc-500 text-xs">PDF study material</p>
                      </div>
                    </div>
                    <a
                      href={selected.notes}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

### C4 — Checkout page (Razorpay payment flow)

FILE: frontend/src/pages/user/Checkout.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, IndianRupee, ArrowLeft, CreditCard, Zap } from "lucide-react";
import { getCourseById } from "../../api/course.api";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    getCourseById(id!)
      .then(res => setCourse(res.data.data))
      .catch(() => { showToast("Course not found.", "error"); navigate("/courses"); })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const orderRes = await axiosInstance.post("/api/payment/create", { courseId: id });
      const { orderId, amount, currency, key } = orderRes.data.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          name: "BaseByte",
          description: course.title,
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#6366F1" },
          handler: async (response: any) => {
            try {
              await axiosInstance.post("/api/payment/verify", {
                orderId,
                courseId: id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              showToast("Payment successful! You are now enrolled.", "success");
              navigate(`/courses/${id}/learn`);
            } catch {
              showToast("Payment verification failed. Contact support.", "error");
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setProcessing(false);
      };

      script.onerror = () => {
        showToast("Failed to load payment gateway.", "error");
        setProcessing(false);
      };
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Payment failed.", "error");
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse font-bold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(`/courses/${id}`)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} /> Back to Course
        </button>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={12} fill="currentColor" /> Secure Checkout
        </div>

        <h1 className="text-4xl font-black tracking-tighter mb-8">Complete Purchase</h1>

        {/* Course Summary */}
        <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 mb-6">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-3">You are purchasing</p>
          <h2 className="text-xl font-black mb-1">{course?.title}</h2>
          <p className="text-zinc-500 text-sm mb-4">{course?.instructor}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-zinc-400 font-bold">Total Amount</span>
            <span className="text-3xl font-black flex items-center gap-1">
              <IndianRupee size={22} className="text-indigo-400" /> {course?.price}
            </span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-xl shadow-indigo-600/25 mb-6"
        >
          <CreditCard size={20} />
          {processing ? "Opening Payment Gateway..." : `Pay ₹${course?.price}`}
        </button>

        {/* Security Note */}
        <div className="flex items-center gap-3 text-zinc-500 text-sm justify-center">
          <ShieldCheck size={16} className="text-green-400" />
          <span>Secured by Razorpay. Your payment is safe.</span>
        </div>
      </div>
    </div>
  );
}
```

---

### C5 — Notes page (student marketplace)

FILE: frontend/src/pages/user/Notes.tsx
REPLACE entire file:

```tsx
import { useEffect, useState } from "react";
import { FileText, Search, Download, IndianRupee, Plus, X } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", fileUrl: "", subject: "", price: 0, isFree: true });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToastContext();

  useEffect(() => {
    axiosInstance.get("/api/notes")
      .then(res => setNotes(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showToast("Please login to upload notes.", "error"); return; }
    setUploading(true);
    try {
      await axiosInstance.post("/api/notes/upload", form);
      showToast("Notes uploaded! Pending admin approval.", "success");
      setShowUpload(false);
      setForm({ title: "", fileUrl: "", subject: "", price: 0, isFree: true });
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Upload failed.", "error");
    } finally { setUploading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Notes <span className="text-indigo-500">Marketplace</span></h1>
            <p className="text-zinc-400">Browse and download study notes from fellow students.</p>
          </div>
          {user && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
            >
              <Plus size={16} /> Upload Notes
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-3 bg-[#0d0d0e] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0d0e] border border-white/10 rounded-[32px] p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Upload Notes</h2>
                <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <input required placeholder="Notes Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} />
                <input required placeholder="File URL (Google Drive / Cloudinary)" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} className={inputClass} />
                <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inputClass} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className={inputClass} disabled={form.isFree} />
                  <div onClick={() => setForm({...form, isFree: !form.isFree})} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer ${form.isFree ? "bg-green-500/10 border-green-500/20" : "bg-white/[0.03] border-white/5"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 ${form.isFree ? "bg-green-400 border-green-400" : "border-zinc-600"}`} />
                    <span className={`text-sm font-bold ${form.isFree ? "text-green-400" : "text-zinc-400"}`}>Free</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-black uppercase text-xs tracking-widest text-zinc-400">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest text-white disabled:opacity-60">{uploading ? "Uploading..." : "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-zinc-900 rounded-[24px] animate-pulse border border-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FileText size={40} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">No notes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(note => (
              <div key={note._id} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl">
                    <FileText size={20} className="text-pink-400" />
                  </div>
                  <span className="text-lg font-black">{note.isFree ? <span className="text-green-400">Free</span> : <span className="flex items-center gap-0.5 text-indigo-400"><IndianRupee size={14} />{note.price}</span>}</span>
                </div>
                <h3 className="font-black mb-1">{note.title}</h3>
                <p className="text-zinc-500 text-sm mb-1">{note.subject}</p>
                <p className="text-zinc-600 text-xs mb-6">{note.uploaderEmail}</p>
                <a href={note.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:text-white transition-all">
                  <Download size={14} /> {note.isFree ? "Download Free" : "Buy & Download"}
                </a>
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

### C6 — Feedback page (student submits feedback)

FILE: frontend/src/pages/user/Feedback.tsx
REPLACE entire file:

```tsx
import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import axiosInstance from "../../api/axios.instance";
import { useAuth } from "../../hooks/useAuth";
import { useToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Feedback() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: "website", rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (form.rating === 0) { showToast("Please select a rating.", "error"); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/feedback", form);
      setSubmitted(true);
      showToast("Thank you for your feedback!", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to submit.", "error");
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white text-center p-8">
      <div>
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Send size={32} className="text-green-400" />
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tighter">Thank You! 🎉</h1>
        <p className="text-zinc-400 text-lg mb-8">Your feedback helps us improve BaseByte for everyone.</p>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <MessageSquare size={18} className="text-rose-400" />
          </div>
          <span className="text-rose-400 text-xs font-black uppercase tracking-widest">Share Your Thoughts</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">Give Feedback</h1>
        <p className="text-zinc-500 mb-10">Help us improve BaseByte for all students.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Feedback Type</label>
            <div className="flex bg-[#0d0d0e] border border-white/5 p-1 rounded-xl gap-1 w-fit">
              {(["website", "course"] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t})} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${form.type === t ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>
                  {t === "website" ? "Website" : "Course"}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({...form, rating: star})}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${star <= (hoveredStar || form.rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} transition-colors`}
                  />
                </button>
              ))}
            </div>
            {form.rating > 0 && (
              <p className="text-zinc-500 text-xs mt-2">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">Your Comment *</label>
            <textarea
              required
              rows={5}
              placeholder="Share your experience with BaseByte..."
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} /> {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### C7 — course.api.ts — add enrollment API calls

FILE: frontend/src/api/course.api.ts
REPLACE entire file:

```ts
import axiosInstance from './axios.instance';

export const getAllCourses = () => axiosInstance.get('/api/courses');
export const getCourseById = (id: string) => axiosInstance.get(`/api/courses/${id}`);
export const requestEnrollment = (courseId: string) =>
  axiosInstance.post('/api/enrollments/request', { courseId });
export const getMyEnrollments = () => axiosInstance.get('/api/enrollments/my');
export const checkEnrollment = (courseId: string) =>
  axiosInstance.get(`/api/enrollments/check/${courseId}`);
```

---

## PART D — PHASE 3: PRODUCTION POLISH

---

### D1 — ProblemSolve — wire up Submit button to save submission

FILE: frontend/src/pages/user/ProblemSolve.tsx

Find the handleRun function. After it ends add this new handleSubmit function.
Also find the Run button in JSX and add a Submit button next to it.

ADD this function after handleRun in ProblemSolve.tsx:

```tsx
const handleSubmit = async () => {
  if (!output || output === "Compiling your code... ⚙️") {
    showToast("Please run your code first before submitting.", "error");
    return;
  }
  try {
    await axiosInstance.post("/api/submissions", {
      problemId: id,
      code,
      language,
      status: status === "success" ? "Accepted" : "Wrong Answer",
      testResults: []
    });
    showToast("Solution submitted successfully!", "success");
  } catch {
    showToast("Failed to submit. Please try again.", "error");
  }
};
```

ADD these imports at the top of ProblemSolve.tsx if not present:
```tsx
import { useToastContext } from "../../context/ToastContext";
```

ADD inside the component:
```tsx
const { showToast } = useToastContext();
```

In JSX, find the Run button and add Submit button next to it:
```tsx
<button
  onClick={handleSubmit}
  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2"
>
  Submit
</button>
```

---

### D2 — index.js — fix /run route to restore Hinglish hints

The current /run route removes the Hinglish hints that were in the original code.
FILE: backend/index.js

Find the /run route and REPLACE the entire route with:

```js
const getHinglishHint = (stderr) => {
  if (!stderr) return null;
  const err = stderr.toLowerCase();
  const lineMatch = stderr.match(/:(?:\s+)?(\d+)(?::\d+)?/);
  const lineNo = lineMatch ? `Line ${lineMatch[1]}` : 'Somewhere in code';
  if (err.includes("expected ';'")) return `Bhai, ${lineNo} pe semicolon (;) lagana bhul gaya kya? 😅`;
  if (err.includes('undeclared') || err.includes('not defined')) return `Ye kaun sa naya mehmaan hai? ${lineNo} pe variable declare kar le! 🤔`;
  if (err.includes("expected '}'") || err.includes("expected '{'")) return `Bhai, bracket ka balance bigad gaya! ${lineNo} check kar! 👐`;
  if (err.includes('format') && err.includes('expects argument')) return `Bhai, scanf mein '&' lagana bhul gaya? ${lineNo} check kar! 📍`;
  if (err.includes("undefined reference to `main'")) return "Arre bhai, 'main' function kidhar hai? 🏎️💨";
  if (err.includes('return') && err.includes('with no value')) return `Bhai, 'int main' hai toh 'return 0' kahan hai? 🤨`;
  if (err.includes('division by zero')) return `Zero se divide mat kar bhai! ${lineNo} check kar! 💀`;
  if (err.includes('unused variable')) return `Bhai, variable bana ke chod diya? ${lineNo} use toh kar! 😢`;
  if (err.includes('indentationerror')) return `Python spacing ka bohot kachcha hai! ${lineNo} par extra space ya kam space check karo. 📏`;
  if (err.includes('syntaxerror')) return `${lineNo} par syntax galti hai. Colon (:) ya bracket check karo! ⚡`;
  if (err.includes('typeerror')) return `Bhai, data types match nahi ho rahe. str() ya int() use karo! 🧩`;
  if (err.includes('indexerror')) return `${lineNo}: List ka index limit ke baahar hai! 🚫`;
  if (err.includes('cannot find symbol')) return `Java ko ye variable mil nahi raha ${lineNo} par. Capital letters check karo. 🔡`;
  if (err.includes('timeout') || err.includes('signal: killed')) return 'Bhai, program run hone mein bohot time le raha hai. Loop check karo! 🐢';
  return `Bhai, ${lineNo} ke aas-paas kuch gadbad hai. Dhyan se dekh le! 🧐`;
};

app.post('/run', async (req, res) => {
  const { code, language, input } = req.body;
  const langConfig = {
    c: { version: '10.2.0' },
    python: { version: '3.10.0' },
    java: { version: '15.0.2' }
  };
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: language.toLowerCase(),
      version: langConfig[language.toLowerCase()]?.version || 'latest',
      files: [{ content: code }],
      stdin: input || ''
    });
    const stderr = response.data.run.stderr;
    res.json({
      output: response.data.run.output,
      stderr,
      hint: stderr ? getHinglishHint(stderr) : null
    });
  } catch {
    res.status(500).json({ error: 'Server Error' });
  }
});
```

---

### D3 — User Profile — add enrolled courses section

FILE: frontend/src/components/profile/MyProfile.tsx

Find the component's return JSX. After the existing profile info section, add this enrolled courses section. First add the import at the top:

```tsx
import { useEffect, useState } from "react";
import { getMyEnrollments } from "../../api/course.api";
import { useNavigate } from "react-router-dom";
```

Add inside the component (before return):
```tsx
const [enrollments, setEnrollments] = useState<any[]>([]);
const navigate = useNavigate();
useEffect(() => {
  getMyEnrollments()
    .then(res => setEnrollments(res.data.data || []))
    .catch(console.error);
}, []);
```

Add after the existing profile display content in JSX:
```tsx
{enrollments.length > 0 && (
  <div className="mt-8 bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
    <h3 className="text-lg font-black mb-4">My Enrolled Courses</h3>
    <div className="space-y-3">
      {enrollments.map((enr: any) => (
        <div key={enr._id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl">
          <div>
            <p className="font-bold text-sm">{enr.courseId?.title || "Course"}</p>
            <p className="text-zinc-500 text-xs">{enr.courseId?.instructor}</p>
          </div>
          <button
            onClick={() => navigate(`/courses/${enr.courseId?._id}/learn`)}
            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Continue →
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## PART E — FINAL CLEANUP & COMMANDS TO RUN

---

### E1 — After all code changes, run these terminal commands:

In backend folder:
```bash
# Install any missing package (if not already installed)
npm install

# Seed the database with problems
node scripts/seed.js

# Seed the database with quiz questions
node scripts/seedQuiz.js

# Start the backend
node index.js
```

In frontend folder:
```bash
npm install
npm run dev
```

---

### E2 — Create/verify frontend/.env file

Make sure this file exists at frontend/.env:
```
VITE_API_URL=http://localhost:5000
```

---

### E3 — Verify backend .env has all required variables

backend/.env must have:
```
MONGO_URI=mongodb+srv://basebyte:YOURPASSWORD@basebytecluster.c2lofal.mongodb.net/BaseByte?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

### E4 — Render environment variables (set in Render dashboard)

```
MONGO_URI=your_atlas_connection_string
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=https://basebyte.vercel.app
NODE_ENV=production
```

### E5 — Vercel environment variables (set in Vercel dashboard)

```
VITE_API_URL=https://basebyte-sl12.onrender.com
```

---

## COMPLETE CHECKLIST — VERIFY EVERY ITEM

Backend:
- [ ] admin.routes.js — console.log debug lines removed from /stats
- [ ] course.controller.js — full CRUD, no placeholder stubs
- [ ] enrollment.controller.js — requestEnrollment, getMyEnrollments, checkEnrollment, all working
- [ ] notes.controller.js — getAllNotes, uploadNotes, approveNotes — all working
- [ ] payment.controller.js — createOrder, verifyPayment — working with signature verification
- [ ] enrollment.routes.js — has GET /check/:courseId route
- [ ] scripts/seed.js — uses ES module imports, not require
- [ ] scripts/seedQuiz.js — uses ES module imports, not require
- [ ] /run route — has Hinglish hints restored

Frontend:
- [ ] AdminLectures.tsx — full CRUD with course selector, live/recorded toggle
- [ ] Courses.tsx — shows real courses from DB, search, filter free/paid
- [ ] CourseDetails.tsx — course info, enroll button, free/paid logic
- [ ] CourseLearning.tsx — video player, lecture sidebar, live link, PDF notes
- [ ] Checkout.tsx — Razorpay integration, payment flow
- [ ] Notes.tsx — marketplace, upload form, download
- [ ] Feedback.tsx — star rating, type toggle, submit
- [ ] course.api.ts — enrollment API calls added
- [ ] ProblemSolve.tsx — Submit button wired to save submission
- [ ] MyProfile.tsx — enrolled courses section added
- [ ] frontend/.env — VITE_API_URL=http://localhost:5000

---

## WHAT IS DONE AFTER THIS PROMPT (Phase completion)

Phase 0 — 100% COMPLETE
Phase 1 — 100% COMPLETE (was already done)
Phase 2 — 100% COMPLETE
Phase 3 (partial) — Production infra remaining:
  - Deploy to Render + Vercel (merge dev → main)
  - Add UptimeRobot monitoring
  - Add Sentry error tracking
  - Full mobile responsive testing
