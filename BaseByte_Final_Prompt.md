# BaseByte — Final Fix Prompt for Antigravity IDE
# I have read every single file in the dev branch line by line.
# This prompt contains ONLY what still needs to be changed.
# Do not touch anything not mentioned here.

---

## PROJECT CONTEXT

BaseByte is a MERN stack coding education platform.
- Backend: Node.js + Express + MongoDB (ES Modules, "type": "module")
- Frontend: React 19 + TypeScript + Tailwind CSS + Vite
- Backend runs on port 5000
- Frontend runs on port 5173
- Deployed: Vercel (frontend) + Render (backend)

---

## WHAT IS ALREADY WORKING — DO NOT TOUCH

- Auth system: signup, login, logout, refresh token — all working
- App.tsx flat Routes structure with UserLayout — correct
- ProtectedRoute, AdminRoute, GuestRoute with Outlet pattern — correct
- ToastContext wired globally — correct
- Auth.tsx — uses useToastContext, no alert(), loading state — correct
- Home.tsx — uses useAuth(), no localStorage — correct
- UserMenu — no Settings/Notifications dead buttons — correct
- Practice page — has problems list with skeleton loading — correct
- Compiler.tsx — icons imported correctly — correct
- ProfilePage — fetchProfile() with no argument — correct
- problem.routes.js — GET routes public — correct
- All dead files deleted (authController.js, auth.js, manualDecoder.js, App.css) — done
- Navbar — shows public links to all users — correct
- Quiz score screen — working — correct
- Topics — no duplicate Functions — correct
- Cache utility using node-cache — working
- All folder structure — correct

---

## CHANGES REQUIRED — READ EVERY WORD CAREFULLY

---

### CHANGE 1 — CRITICAL
**File: backend/controllers/auth.controller.js**

Find the login function. Find this exact block:
```js
user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
}
```

Change ONLY `id: user._id` to `_id: user._id`

The frontend auth.types.ts User interface has `_id` not `id`.
This one character change fixes user._id being undefined throughout the entire app.

Final correct version of just that block:
```js
user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
}
```

Do not change anything else in this file.

---

### CHANGE 2 — CRITICAL
**File: Create NEW file → frontend/.env**

Create this file at frontend/.env (same level as frontend/package.json):
```
VITE_API_URL=http://localhost:5000
```

This is required for local development. Without it, axios.instance.ts falls back to
the Render production URL and every local API call goes to the live server.

---

### CHANGE 3 — CRITICAL
**File: Create NEW file → frontend/.env.example**

Create this file at frontend/.env.example:
```
# Copy this file to .env and fill in your values
VITE_API_URL=http://localhost:5000
```

---

### CHANGE 4 — HIGH PRIORITY
**File: backend/index.js**

Find this exact block:
```js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BaseByte server is running.' });
});
```

Replace it with:
```js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BaseByte server is running.',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

Do not change anything else in index.js.

---

### CHANGE 5 — HIGH PRIORITY
**File: backend/index.js**

Add response compression. In index.js, at the very top with other imports, add:
```js
import compression from 'compression';
```

Then find this line:
```js
app.use(helmet());
```

Add compression right after it:
```js
app.use(helmet());
app.use(compression());
```

Then run in terminal inside backend folder:
```bash
npm install compression
```

---

### CHANGE 6 — HIGH PRIORITY
**File: backend/models/User.js**

Find this line at the bottom before export:
```js
export default mongoose.model('User', UserSchema);
```

Add these two lines BEFORE the export:
```js
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
```

So it reads:
```js
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
export default mongoose.model('User', UserSchema);
```

---

### CHANGE 7 — HIGH PRIORITY
**File: backend/models/Quiz.js**

Find the bottom of the file before the export line. Add this compound index:
```js
QuizSchema.index({ language: 1, topic: 1 });
```

---

### CHANGE 8 — HIGH PRIORITY
**File: backend/models/Submission.js**

Find the bottom of the file before the export line. Add this compound index:
```js
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ userId: 1 });
```

---

### CHANGE 9 — HIGH PRIORITY
**File: frontend/src/context/ToastContext.tsx**

Current file has:
```tsx
const ToastContext = createContext<any>(null);
```

And:
```tsx
export const useToastContext = () => useContext(ToastContext);
```

Replace the entire file with this properly typed version:

```tsx
import React, { createContext, useContext } from "react";
import { useToast } from "../hooks/useToast";
import Toast from "../components/ui/Toast";
import type { ToastType } from "../types/common.types";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { toasts, showToast, removeToast } = useToast();
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToastContext must be used within ToastProvider");
  return context;
};
```

---

### CHANGE 10 — HIGH PRIORITY
**File: frontend/src/pages/user/ProblemDetails.tsx**

Find this line:
```tsx
const [problem, setProblem] = useState<any>(null);
```

Replace with:
```tsx
import type { Problem } from "../../types/problem.types";
// ...
const [problem, setProblem] = useState<Problem | null>(null);
```

Also find:
```tsx
} catch (err) {
  console.error("Error");
}
```

Replace with:
```tsx
} catch (err) {
  console.error("Failed to fetch problem:", err);
}
```

---

### CHANGE 11 — HIGH PRIORITY
**File: frontend/src/pages/user/ProblemSolve.tsx**

Find this line:
```tsx
const [problem, setProblem] = useState<any>(null);
```

Replace with:
```tsx
const [problem, setProblem] = useState<Problem | null>(null);
```

Add this import at top if not present:
```tsx
import type { Problem } from "../../types/problem.types";
```

Also find:
```tsx
} catch (err) {
  console.error("Error");
}
```

Replace with:
```tsx
} catch (err) {
  console.error("Failed to fetch problem:", err);
}
```

---

### CHANGE 12 — MEDIUM PRIORITY
**File: frontend/src/pages/user/QuizPage.tsx**

Find:
```tsx
const [questions, setQuestions] = useState<any[]>([]);
```

Replace with:
```tsx
import type { Quiz } from "../../types/quiz.types";
// ...
const [questions, setQuestions] = useState<Quiz[]>([]);
```

Find:
```tsx
} catch (err) {
  console.error("Error fetching quizzes");
```

Replace with:
```tsx
} catch (err) {
  console.error("Failed to fetch quizzes:", err);
```

Also find this line in QuizPage (it has an invalid Tailwind class):
```tsx
<div className="py-4 flex gap-3 mb-25">
```

Replace with:
```tsx
<div className="py-4 flex gap-3 mb-24">
```

`mb-25` is not a valid Tailwind class. `mb-24` is correct.

---

### CHANGE 13 — MEDIUM PRIORITY
**File: frontend/src/pages/user/Practice.tsx**

Find:
```tsx
{filteredProblems.map((problem: any) => (
```

Replace with:
```tsx
{filteredProblems.map((problem) => (
```

The `useProblems` hook already returns `Problem[]` so `: any` cast is unnecessary
and removes TypeScript safety.

---

### CHANGE 14 — MEDIUM PRIORITY
**File: frontend/src/pages/admin/AdminDashboard.tsx**

Replace the entire file with this properly styled version:

```tsx
import React from "react";
import { Users, BookOpen, BarChart3, FileText, TrendingUp, Zap } from "lucide-react";

const stats = [
  { label: "Total Students", value: "—", icon: <Users size={20} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Total Courses", value: "—", icon: <BookOpen size={20} />, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Total Problems", value: "—", icon: <BarChart3 size={20} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { label: "Feedback Received", value: "—", icon: <FileText size={20} />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
          <Zap size={18} className="text-indigo-400" fill="currentColor" />
        </div>
        <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Admin Panel</span>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-1">Dashboard</h1>
      <p className="text-zinc-500 font-medium mb-10">Welcome back, Admin. Here's your overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-6">
            <div className={`inline-flex p-3 rounded-2xl border mb-4 ${stat.bg}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-zinc-500 text-sm font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center min-h-48 text-center">
        <TrendingUp size={32} className="text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-bold">Live stats and charts coming in Phase 2</p>
        <p className="text-zinc-600 text-sm mt-1">Stats will connect to real DB data.</p>
      </div>
    </div>
  );
}
```

---

### CHANGE 15 — MEDIUM PRIORITY
**File: All admin pages that show plain "Coming soon in Phase 2" text**

Files:
- frontend/src/pages/admin/AdminCourses.tsx
- frontend/src/pages/admin/AdminLectures.tsx
- frontend/src/pages/admin/AdminStudents.tsx
- frontend/src/pages/admin/AdminEnrollments.tsx
- frontend/src/pages/admin/AdminProblems.tsx
- frontend/src/pages/admin/AdminFeedback.tsx
- frontend/src/pages/admin/AdminNotes.tsx

Replace ALL of them with properly styled placeholders.
Use this exact template for each, changing the title, subtitle, and icon:

```tsx
import React from "react";
import { ICON_NAME } from "lucide-react"; // use appropriate icon

export default function PAGE_NAME() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-black tracking-tighter mb-1">PAGE_TITLE</h1>
      <p className="text-zinc-500 font-medium mb-10">PAGE_SUBTITLE</p>
      <div className="bg-[#0d0d0e] border border-white/5 rounded-[24px] p-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center text-zinc-600 mb-6">
          <ICON_NAME size={32} />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Coming in Phase 2</h3>
        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
          This section will be fully functional with real data in the next development phase.
        </p>
      </div>
    </div>
  );
}
```

Use these values for each file:

AdminCourses: title="Manage Courses", subtitle="Create, edit, and publish courses.", icon=BookOpen
AdminLectures: title="Manage Lectures", subtitle="Add video lectures and live session links.", icon=Video
AdminStudents: title="Students", subtitle="View and manage enrolled students.", icon=Users
AdminEnrollments: title="Enrollments", subtitle="Approve or reject enrollment requests.", icon=ClipboardList
AdminProblems: title="Problems", subtitle="Add and manage coding problems.", icon=Code2
AdminFeedback: title="Feedback", subtitle="View student ratings and reviews.", icon=MessageSquare
AdminNotes: title="Notes Marketplace", subtitle="Approve student-uploaded notes.", icon=FileText

---

### CHANGE 16 — MEDIUM PRIORITY
**File: frontend/src/pages/user/CourseDetails.tsx**
**File: frontend/src/pages/user/CourseLearning.tsx**
**File: frontend/src/pages/user/Checkout.tsx**

These pages are currently either missing or show plain text. Replace each with a
styled coming-soon page using the same design as Courses.tsx which already looks good.

For CourseDetails.tsx:
```tsx
import { BookOpen, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function CourseDetails() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={12} fill="currentColor" /> Coming Soon
        </div>
        <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <BookOpen size={40} className="text-indigo-400" />
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-tight">Course Details</h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Detailed course pages with curriculum, instructor info, and enrollment will be available in Phase 2.
        </p>
        <button onClick={() => navigate('/courses')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all active:scale-95">
          Back to Courses
        </button>
      </div>
    </div>
  );
}
```

For CourseLearning.tsx:
Same template, change title to "Course Player", description to "Video lectures and live sessions will be available here after enrollment."

For Checkout.tsx:
Same template, change title to "Checkout", description to "Secure payment integration with Razorpay coming in Phase 2."

---

### CHANGE 17 — LOW PRIORITY
**File: backend/utils/logger.js**

The current logger uses console.log/warn/error directly which is fine for now.
But in production on Render, all logs need proper formatting.

Replace the entire file with:
```js
const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  success: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[SUCCESS] [${new Date().toISOString()}] ${message}`, ...args);
    }
  }
};

export default logger;
```

---

### CHANGE 18 — LOW PRIORITY
**File: backend/index.js**

Find this line in connectDB().then():
```js
console.log(`🚀 BaseByte server running on port ${PORT}`);
```

Replace with:
```js
console.log(`🚀 BaseByte server running on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
```

---

### CHANGE 19 — LOW PRIORITY
**File: frontend/src/types/common.types.ts**

The current file has Toast interface but no export for ToastType being used in ToastContext.
Verify it has this exact content and add if missing:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
```

---

### CHANGE 20 — LOW PRIORITY
**File: frontend/src/components/layout/UserLayout.tsx**

Verify the file exists and has this exact content.
If it already has this, skip. If different, replace:

```tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#050505]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
```

---

## FINAL CHECKLIST — VERIFY AFTER ALL CHANGES

Backend:
- [ ] auth.controller.js login returns _id not id
- [ ] index.js has compression middleware
- [ ] index.js health check returns uptime and timestamp
- [ ] index.js startup logs show environment and frontend URL
- [ ] User.js has email index
- [ ] Quiz.js has compound language+topic index
- [ ] Submission.js has userId+problemId index
- [ ] logger.js has success level and proper formatting

Frontend:
- [ ] frontend/.env exists with VITE_API_URL=http://localhost:5000
- [ ] frontend/.env.example exists
- [ ] ToastContext.tsx properly typed (no any)
- [ ] ProblemDetails.tsx uses Problem type not any
- [ ] ProblemSolve.tsx uses Problem type not any
- [ ] QuizPage.tsx uses Quiz type not any
- [ ] QuizPage.tsx mb-25 changed to mb-24
- [ ] Practice.tsx no : any cast in map
- [ ] AdminDashboard.tsx properly styled
- [ ] All 7 admin pages have styled placeholders
- [ ] CourseDetails, CourseLearning, Checkout styled properly

---

## WHAT TO DO AFTER ALL CHANGES

1. In backend folder run: npm install compression
2. Restart backend: node index.js
3. Restart frontend: npm run dev
4. Test in Postman: POST /api/auth/login
5. Verify login response has _id (not id) in user object
6. Test frontend: go to localhost:5173, login, check profile works
7. Test quiz: go to /practice → click C → click any topic → verify quiz loads
8. Test compiler: go to /compiler → run some code
9. Test admin: create an admin user in MongoDB Atlas manually by changing role to "admin"
   then login and verify /admin route works

---

## ENVIRONMENT REFERENCE

### backend/.env (local — never commit)
MONGO_URI=mongodb+srv://basebyte:YOUR_PASSWORD@basebytecluster.c2lofal.mongodb.net/BaseByte?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

### frontend/.env (local — never commit)
VITE_API_URL=http://localhost:5000

### Render Environment Variables
MONGO_URI=mongodb+srv://basebyte:YOUR_PASSWORD@basebytecluster.c2lofal.mongodb.net/BaseByte?retryWrites=true&w=majority
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=https://basebyte.vercel.app
NODE_ENV=production

### Vercel Environment Variables
VITE_API_URL=https://basebyte-sl12.onrender.com
