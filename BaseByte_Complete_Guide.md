# BaseByte — Complete Code Analysis, Bug Fixes, UI Improvements & Production Guide
# For Antigravity IDE — Read every section carefully before making any changes.
# Last analyzed: All files in dev branch read line by line.

---

## SECTION 1 — FILES TO DELETE IMMEDIATELY (Dead Code)

These files are never imported anywhere. Delete them right now.

### DELETE: backend/controllers/authController.js
Reason: Duplicate of auth.controller.js. Never imported in any route. auth.routes.js uses
auth.controller.js. This file is completely dead.

### DELETE: backend/middleware/auth.js
Reason: Duplicate of auth.middleware.js. Never imported anywhere. auth.middleware.js is used
in all routes. This file is completely dead.

### DELETE: backend/utils/manualDecoder.js
Reason: Never imported anywhere in the entire codebase. Hinglish hints are handled inline
in index.js. This file has always been dead since the original repo.

### DELETE: frontend/src/App.css
Reason: Contains default Vite template CSS (logo-spin animation, .card, .read-the-docs).
None of this is used anywhere in the project. App.tsx never imports App.css.

### CLEAN: vite.config.ts
Reason: optimizeDeps.include has react-resizable-panels listed but this package is never
used in any component. Remove that entry.

---

## SECTION 2 — BUGS TO FIX (Critical — these crash or break features)

### BUG 1: Compiler.tsx — ZoomIn, ZoomOut, Play, RotateCcw not imported
File: frontend/src/pages/user/Compiler.tsx
Problem: These 4 icons are used in JSX but never imported. This crashes the Compiler page.
Fix: Add this import line at the top:
  import { Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

### BUG 2: Auth.tsx — unused variables endpoint and payload
File: frontend/src/pages/user/Auth.tsx
Problem: Inside handleSubmit there are two lines:
  const endpoint = isLogin ? "/login" : "/signup";
  const payload = isLogin ? { email, password } : { name, email, password };
These are never used — leftover from old axios.post code. Delete both lines.

### BUG 3: ProfilePage — fetchProfile called with argument but takes none
File: frontend/src/pages/user/ProfilePage.tsx
Problem: Line says: if (user?.email) fetchProfile(user.email);
But ProfileContext.fetchProfile() takes no parameters. It uses JWT from axios interceptor.
Fix: Change to: if (user) fetchProfile();
Also fix useEffect dependency array — it currently has [user, fetchProfile].
fetchProfile uses useCallback so this is fine, keep it.

### BUG 4: App.tsx — nested Routes inside Route (React Router anti-pattern)
File: frontend/src/App.tsx
Problem: There is a wildcard Route path="*" that contains another Routes component inside it.
This is wrong in React Router v7. It causes:
- Incorrect route matching
- Admin layout not working properly
- Footer showing on admin pages
- Navigation bugs when going back
Fix: Full rewrite of App.tsx shown in Section 5 below.

### BUG 5: Home.tsx — reads localStorage directly instead of using AuthContext
File: frontend/src/pages/user/Home.tsx
Problem: Uses localStorage.getItem("user") directly. Should use useAuth() hook.
If user logs out, Home page still shows welcome message until refresh.
Fix: Replace localStorage code with useAuth().

### BUG 6: UserMenu.tsx — navigates to /settings which does not exist
File: frontend/src/components/common/UserMenu.tsx
Problem: Settings button calls navigate("/settings") but no /settings route exists.
This gives a 404 or shows NotFound page.
Fix: Either create a settings page or remove the settings button for now.

### BUG 7: App.css — being applied globally via broken #root styles
File: frontend/src/App.css
Problem: The #root style has max-width: 1280px, margin: 0 auto, text-align: center.
This restricts the entire app layout and overrides responsive designs.
Even though App.tsx doesn't import it, if anything imports it accidentally it breaks layout.
Fix: Delete this file entirely.

### BUG 8: frontend/package.json — project name is "codearc" not "basebyte"
File: frontend/package.json
Problem: "name": "codearc" — leftover from when the project was named differently.
Fix: Change to "name": "basebyte-frontend"

### BUG 9: UserProfile model mismatch — old data uses email, new code uses userId
File: backend/models/UserProfile.js + backend/controllers/profile.controller.js
Problem: New profile.controller.js queries by { userId: req.user.id } but old UserProfile
documents in MongoDB were saved with { email: "..." } as the key. Existing users get
"Profile not found" even though their profile exists in the DB.
Fix: Update UserProfile model to have both userId and email fields.
Add fallback in getProfile: try userId first, then fall back to email lookup.

### BUG 10: Navbar hides nav links for guest users
File: frontend/src/components/layout/Navbar.tsx
Problem: The desktop nav <ul> is wrapped in {user && (...)} — so guests see NO navigation
links at all. They cannot navigate to Home, About, Compiler, or Courses without typing URLs.
Fix: Show public nav links to everyone. Only hide Profile link for guests.

---

## SECTION 3 — UNUSED CODE TO CLEAN IN EACH FILE

### frontend/src/pages/user/Home.tsx
REMOVE: entire useEffect that reads localStorage
REMOVE: const [userName, setUserName] = useState("Student")
REMOVE: The conditional {localStorage.getItem("user") && (...)} wrapper
ADD: import { useAuth } from "../../hooks/useAuth"
ADD: const { user } = useAuth()
REPLACE WITH: {user && (...)} and use user.name.split(" ")[0] directly

### frontend/src/components/common/UserMenu.tsx
REMOVE: Settings button (navigates to non-existent /settings route)
REMOVE: Notifications button (no notifications system exists yet)
These two dead buttons confuse users and link to nothing.

### frontend/src/components/Compiler/CodeEditor.tsx
CHECK: LineNumbers component is imported — verify it is actually used in the JSX
If LineNumbers is imported but not rendered, remove the import.

### frontend/vite.config.ts
REMOVE from optimizeDeps.include: 'react-resizable-panels'
This package is installed but used nowhere. Remove from vite config too.

### backend/models/UserProfile.js
REMOVE: email field as the primary key
ADD: userId as ObjectId reference to User (primary key)
KEEP: email as optional secondary field for display

### All placeholder pages (Courses, CourseDetails, CourseLearning, Notes, Checkout, Feedback)
These currently show "Coming soon in Phase 2" with plain text.
Make them look good — styled placeholder with the app theme.
See Section 4 for the template.

---

## SECTION 4 — UI AND DESIGN IMPROVEMENTS

### Problem 1: Inconsistent component imports location
Components in old locations still exist:
- frontend/src/components/Hero.tsx (should be components/home/Hero.tsx)
- frontend/src/components/Features.tsx (should be components/home/Features.tsx)
- frontend/src/components/Steps.tsx (should be components/home/Steps.tsx)
- frontend/src/components/Practice/ folder (should be components/practice/)
- frontend/src/components/Compiler/ folder (should be components/compiler/)
These are functional but inconsistent with the new folder structure.
Move them to their correct locations and update imports.

### Problem 2: Loading states are plain uppercase text
Every page shows: "LOADING..." or "Loading Problem..." as plain text.
This looks unprofessional. Replace with the Skeleton component that already exists.

CURRENT (bad):
  if (loading) return <div className="text-white">Loading...</div>;

REPLACE WITH (for all pages):
  if (loading) return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 w-64 bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="h-6 w-full bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-6 w-3/4 bg-zinc-800/60 rounded-xl animate-pulse" />
        <div className="h-48 w-full bg-zinc-800/40 rounded-2xl animate-pulse mt-8" />
      </div>
    </div>
  );

### Problem 3: Toast system built but never wired up
Toast.tsx and useToast.ts are complete and ready. They are just never used.
Wire it up globally so any page can show toast notifications.

HOW TO WIRE UP TOAST:
Step 1 — Create frontend/src/context/ToastContext.tsx:
  import React, { createContext, useContext } from "react";
  import { useToast } from "../hooks/useToast";
  import Toast from "../components/ui/Toast";

  const ToastContext = createContext<any>(null);

  export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const { toasts, showToast, removeToast } = useToast();
    return (
      <ToastContext.Provider value={{ showToast }}>
        {children}
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </ToastContext.Provider>
    );
  };

  export const useToastContext = () => useContext(ToastContext);

Step 2 — Wrap App in ToastProvider (inside App.tsx)
Step 3 — Replace all inline error messages in Auth.tsx with:
  const { showToast } = useToastContext();
  showToast("Invalid email or password", "error");
  showToast("Account created successfully!", "success");

### Problem 4: Practice page has no problems list
The Practice page only shows 3 language cards for quiz navigation.
There is no problems list at all even though problems exist in the DB and the API works.

ADD a section below the language cards:
  - Fetch problems with useProblems hook
  - Show a grid of ProblemCard components
  - Each card: problem title, difficulty badge, language badge, "Solve" button
  - Filter by difficulty (Easy/Medium/Hard tabs)
  - The ProblemCard component already exists in components/Practice/

### Problem 5: Courses page is a blank placeholder
Courses.tsx just shows "Coming soon in Phase 2" as plain text on a white background.
Replace with a proper coming-soon page that matches app design.

REPLACE Courses.tsx with this styled version:
  import { BookOpen, Lock, Zap } from "lucide-react";
  export default function Courses() {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
            <Zap size={12} fill="currentColor" /> Coming Soon
          </div>
          <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <BookOpen size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">Courses</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Full courses with video lectures, live sessions, notes, and certificates.
            Launching very soon for BaseByte students.
          </p>
          <div className="flex items-center justify-center gap-3 text-zinc-600 text-sm font-bold">
            <Lock size={14} /> Available in Phase 2
          </div>
        </div>
      </div>
    );
  }

Apply the same styled coming-soon template to:
  - CourseDetails.tsx
  - CourseLearning.tsx
  - Notes.tsx
  - Checkout.tsx
  - Feedback.tsx

### Problem 6: Hero section has wrong code example
The Hero component shows "void main()" which is incorrect C syntax.
Real C uses "int main()". This is an educational platform — the code must be correct.

CHANGE in Hero.tsx:
  <p><span className="text-purple-400">void</span> ...
TO:
  <p><span className="text-purple-400">int</span> ...

### Problem 7: "Solved by 500+ Students" counter is hardcoded fake data
The Hero bounce card shows "Solved by 500+ Students" — this is hardcoded and misleading.
Either connect it to real DB data or change the text to something accurate like
"Join 500+ students learning to code" or remove the bounce card.

### Problem 8: Footer social links have no href
All social icon buttons in Footer.tsx have no links — they are just div elements with icons.
Add real links or remove them to avoid dead clickable elements.

### Problem 9: About page has mb-15 which is not a valid Tailwind class
File: frontend/src/pages/user/About.tsx
Problem: className="flex justify-center mb-15" — mb-15 is not a valid Tailwind class.
Fix: Change to mb-16 or mb-12.

---

## SECTION 5 — APP.TSX FULL REWRITE (Fixes the nested Routes bug)

The current App.tsx has a wildcard Route wrapping all user routes with another Routes
inside it. This is wrong. Here is the correct flat structure using Layout components.

### Step 1 — Create frontend/src/components/layout/UserLayout.tsx
This component provides the Navbar + main + Footer wrapper for all user pages.

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

### Step 2 — Rewrite frontend/src/App.tsx completely:

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
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
import ProblemDetails from "./pages/user/ProblemDetails";
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
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminNotes from "./pages/admin/AdminNotes";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <ToastProvider>
            <Routes>

              {/* USER ROUTES — with Navbar and Footer */}
              <Route element={<UserLayout />}>

                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/compiler" element={<Compiler />} />
                <Route path="/courses" element={<Courses />} />

                {/* Guest only — redirect to / if already logged in */}
                <Route element={<GuestRoute />}>
                  <Route path="/auth" element={<Auth />} />
                </Route>
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />

                {/* Protected — redirect to /auth if not logged in */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/practice/:id" element={<ProblemDetails />} />
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

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ADMIN ROUTES — with AdminLayout, no Navbar/Footer */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/courses" element={<AdminCourses />} />
                  <Route path="/admin/lectures" element={<AdminLectures />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                  <Route path="/admin/problems" element={<AdminProblems />} />
                  <Route path="/admin/feedback" element={<AdminFeedback />} />
                  <Route path="/admin/notes" element={<AdminNotes />} />
                </Route>
              </Route>

            </Routes>
          </ToastProvider>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

NOTE: After this change, update ProtectedRoute and GuestRoute to use Outlet pattern:

frontend/src/components/guards/ProtectedRoute.tsx:
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}
```

frontend/src/components/guards/GuestRoute.tsx:
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
```

frontend/src/components/guards/AdminRoute.tsx:
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

frontend/src/components/layout/AdminLayout.tsx:
Make sure it uses Outlet from react-router-dom to render the admin page content.
```tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/AdminSidebar";
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## SECTION 6 — PERFORMANCE IMPROVEMENTS

### Performance 1: Add frontend .env for local development
Create file: frontend/.env
Content:
  VITE_API_URL=http://localhost:5000

Without this, axios.instance.ts falls back to the Render production URL.
Every local API call goes to Render instead of your local backend.
This makes local development very slow (Render has cold starts).

### Performance 2: Add MongoDB indexes for common queries
File: backend/models/User.js — email field should have index: true
File: backend/models/UserProfile.js — userId should have index: true
File: backend/models/Quiz.js — language and topic should have compound index
File: backend/models/Submission.js — userId + problemId compound index

Add to each model:
  UserSchema.index({ email: 1 });
  QuizSchema.index({ language: 1, topic: 1 });
  submissionSchema.index({ userId: 1, problemId: 1 });

### Performance 3: Backend response compression
Install in backend: npm install compression
Add to backend/index.js after helmet():
  import compression from 'compression';
  app.use(compression());
This reduces API response size by 60-70% using gzip.

### Performance 4: Compiler page takes 2-3 seconds on first load
The issue is that Piston API (emkc.org) has cold starts.
Add a loading message that shows immediately: "Sending to compiler server..."
The output area already shows "Compiling your code... ⚙️" which is good. Keep it.

### Performance 5: Problems and Quiz data never cached
Every time user opens Practice or Quiz page, it hits MongoDB.
For quiz questions and problems (which rarely change), add simple in-memory cache:

Add to backend/utils/cache.js:
```js
const cache = new Map();
export const setCache = (key, value, ttlSeconds = 300) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};
export const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) { cache.delete(key); return null; }
  return item.value;
};
```

Use in quiz.controller.js:
```js
const cacheKey = `quiz_${lang}_${topicSearch}`;
const cached = getCache(cacheKey);
if (cached) return res.json(new ApiResponse(200, cached, 'Quizzes fetched.'));
// ... fetch from DB ...
setCache(cacheKey, quizzes, 300); // cache 5 minutes
```

---

## SECTION 7 — PRODUCTION LEVEL UI DESIGN GUIDE

### Rule 1: Every page needs a consistent page header
Currently each page has completely different header styles.
Create a reusable PageHeader component:

```tsx
// frontend/src/components/ui/PageHeader.tsx
interface PageHeaderProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}
export default function PageHeader({ badge, title, highlight, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-12 relative">
      <div className="absolute -left-20 -top-10 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
          {badge}
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
        {title} {highlight && <span className="text-indigo-500">{highlight}</span>}
      </h1>
      {subtitle && <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}
```

Use it on every page: Practice, Topics, Profile, Courses, etc.

### Rule 2: Consistent empty state component
When a list has no data, don't show nothing. Show a proper empty state.

```tsx
// frontend/src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; };
}
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center text-zinc-600 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-8">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### Rule 3: Consistent card style
All cards across the app should follow one design pattern:
  bg-[#0d0d0e] border border-white/5 rounded-[24px] or rounded-[32px]
  hover:border-white/10 transition-all duration-300
  p-6 or p-8 for content padding

### Rule 4: Consistent button styles
Primary: bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all
Secondary: bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 ... (same rest)
Danger: bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 ...

### Rule 5: Error states need proper design
Currently errors just show red text. Create a proper error component:
```tsx
// frontend/src/components/ui/ErrorState.tsx
export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-4">
        <AlertCircle size={28} />
      </div>
      <p className="text-red-400 font-bold mb-2">Something went wrong</p>
      <p className="text-zinc-500 text-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300">
          Try Again
        </button>
      )}
    </div>
  );
}
```

### Rule 6: Mobile navigation is broken for guests
On mobile, if user is not logged in, the hamburger menu shows login/signup buttons.
But there are no page navigation links for guests on mobile.
Fix the mobile menu to show Home, About, Courses, Compiler for everyone.
Only show Practice, Profile, Quizzes when logged in.

---

## SECTION 8 — BACKEND IMPROVEMENTS

### Backend 1: Profile controller using wrong field for lookup
File: backend/controllers/profile.controller.js
Current code queries by: { userId: req.user.id }
But UserProfile.js schema has email as the unique field, not userId.
Fix UserProfile.js model: add userId field as primary, email as optional.

New UserProfile.js:
```js
import mongoose from 'mongoose';
const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String },
  firstName: { type: String, default: '' },
  midName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  college: { type: String, default: '' },
  address: { type: String, default: '' },
  mobile: { type: String, default: '' },
  degree: { type: String, default: 'B.Tech' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  website: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true });
UserProfileSchema.index({ userId: 1 });
export default mongoose.model('UserProfile', UserProfileSchema);
```

### Backend 2: Problem routes require auth but Practice page is public
File: backend/routes/problem.routes.js
Current: Both GET / and GET /:id require verifyToken.
Problem: Practice page and ProblemDetails should be viewable without login.
Only submitting a solution should require auth.
Fix:
  router.get('/', getAllProblems);         // public
  router.get('/:id', getProblemById);     // public
  router.post('/', verifyToken, adminMiddleware, createProblem); // admin only

### Backend 3: No health check returns server stats
Current /health just returns { status: 'ok' }. Make it more useful for monitoring.
Fix in index.js:
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

### Backend 4: Login response format inconsistency
auth.controller.js returns:
  { statusCode: 200, data: { accessToken, refreshToken, user }, message, success }
But frontend Auth.tsx checks:
  response.data.success || response.data.status === "success"
This works but is inconsistent. Standardize: always use ApiResponse format.
The login response data.user has "id" but the User type in auth.types.ts expects "_id".
Fix auth.controller.js login: change user.id to user._id in the response object.

### Backend 5: No CORS for Render + Vercel in production
Current CORS allows localhost:5173 and basebyte.vercel.app.
When you deploy to Render, make sure environment variable FRONTEND_URL is set.
Also add http://localhost:5173 explicitly for development (already done — good).

---

## SECTION 9 — COMPLETE CHECKLIST TO EXECUTE IN ORDER

Execute these in exact order. Do not skip steps.

STEP 1 — DELETE dead files:
  - backend/controllers/authController.js
  - backend/middleware/auth.js
  - backend/utils/manualDecoder.js
  - frontend/src/App.css

STEP 2 — FIX Compiler.tsx (add missing icon imports)

STEP 3 — FIX Auth.tsx (remove unused endpoint and payload variables)

STEP 4 — FIX ProfilePage.tsx (fetchProfile() with no argument)

STEP 5 — FIX Home.tsx (use useAuth() instead of localStorage directly)

STEP 6 — FIX UserMenu.tsx (remove Settings and Notifications dead buttons)

STEP 7 — FIX About.tsx (change mb-15 to mb-16)

STEP 8 — FIX frontend/package.json (name: "basebyte-frontend")

STEP 9 — FIX vite.config.ts (remove react-resizable-panels from optimizeDeps)

STEP 10 — CREATE frontend/.env with VITE_API_URL=http://localhost:5000

STEP 11 — UPDATE UserProfile.js model (add userId field as primary)

STEP 12 — UPDATE profile.controller.js (query by userId not email)

STEP 13 — UPDATE problem.routes.js (remove auth from GET routes)

STEP 14 — CREATE frontend/src/context/ToastContext.tsx (wire up toast globally)

STEP 15 — CREATE frontend/src/components/layout/UserLayout.tsx (Outlet based)

STEP 16 — REWRITE frontend/src/App.tsx (flat routes, no nested Routes)

STEP 17 — UPDATE ProtectedRoute, GuestRoute, AdminRoute (Outlet pattern)

STEP 18 — UPDATE AdminLayout.tsx (use Outlet)

STEP 19 — UPDATE Navbar.tsx (show public links to guests)

STEP 20 — REPLACE all loading states with Skeleton animations

STEP 21 — ADD Practice page problems list section

STEP 22 — REPLACE all "coming soon" pages with styled versions

STEP 23 — FIX Hero.tsx (void main → int main)

STEP 24 — ADD MongoDB indexes to models

STEP 25 — CREATE backend/utils/cache.js and use in quiz.controller.js

STEP 26 — FIX health check endpoint to return uptime and environment

STEP 27 — FIX login response _id vs id inconsistency in auth.controller.js

STEP 28 — CREATE frontend/src/components/ui/PageHeader.tsx

STEP 29 — CREATE frontend/src/components/ui/EmptyState.tsx

STEP 30 — CREATE frontend/src/components/ui/ErrorState.tsx

---

## SECTION 10 — ENVIRONMENT FILES REFERENCE

### backend/.env (your local machine — never commit)
MONGO_URI=mongodb+srv://basebyte:YOURNEWPASSWORD@basebytecluster.c2lofal.mongodb.net/BaseByte?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=http://localhost:5173

### frontend/.env (create this file — never commit)
VITE_API_URL=http://localhost:5000

### Render Environment Variables (set in Render dashboard)
MONGO_URI=mongodb+srv://basebyte:YOURNEWPASSWORD@basebytecluster.c2lofal.mongodb.net/BaseByte?retryWrites=true&w=majority
JWT_SECRET=BaseByteSecretKey0205
JWT_REFRESH_SECRET=BaseByteRefreshKey0205
FRONTEND_URL=https://basebyte.vercel.app
NODE_ENV=production

### Vercel Environment Variables (set in Vercel dashboard)
VITE_API_URL=https://basebyte-sl12.onrender.com

---

## SUMMARY: PRIORITY ORDER

HIGHEST PRIORITY (do today):
1. Fix Compiler.tsx missing imports (crashes the page)
2. Delete 3 dead backend files
3. Fix App.tsx nested Routes
4. Fix ProfilePage fetchProfile argument
5. Create frontend/.env

HIGH PRIORITY (do this week):
6. Fix Navbar to show links for guests
7. Wire up Toast globally
8. Fix UserMenu dead buttons
9. Replace loading text with Skeleton
10. Add problems list to Practice page

MEDIUM PRIORITY (before Phase 2):
11. Add MongoDB indexes
12. Add compression middleware
13. Add in-memory cache for quiz and problems
14. Fix UserProfile model for userId
15. Style all placeholder pages properly

LOW PRIORITY (Phase 2 prep):
16. Add PageHeader, EmptyState, ErrorState components
17. Fix Hero code example
18. Fix footer social links
19. Fix package.json name

