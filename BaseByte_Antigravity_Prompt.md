# BaseByte — Full Production Restructure Prompt
# Copy everything below this line and paste into Antigravity IDE

---

You are working on a MERN stack project called **BaseByte** — a coding education platform. I need you to restructure and rewrite the entire project into a clean production-level architecture. I will give you the complete existing code, the new folder structure, and exactly what each file should contain.

---

## EXISTING PROJECT OVERVIEW

### What already exists and works:
- Express.js backend with MongoDB (Mongoose)
- React 19 + TypeScript + Tailwind CSS frontend
- User signup/login (bcryptjs, no JWT yet)
- Code compiler using Piston API (C, Python, Java)
- Practice problems list (GET /api/problems — no single problem route)
- Quiz system by language and topic
- Basic user profile (save/fetch by email)
- Hinglish error hints in compiler output
- Frontend deployed on Vercel: https://basebyte.vercel.app
- Backend deployed on Render: https://basebyte-sl12.onrender.com

### Current bugs to fix during restructure:
1. No JWT — login returns plain object, no token
2. CORS uses hardcoded localhost:5173 — breaks production
3. No GET /api/problems/:id route — ProblemSolve page is blank
4. admin.routes.js imports Enrollment and Lecture models that don't exist — crashes server
5. admin.routes.js is never mounted in index.js
6. No input validation on signup/login
7. Login error returns no message — frontend shows "undefined" in alert()
8. No ProtectedRoute — any page accessible without login
9. Wildcard * route redirects to Home instead of 404 page
10. Duplicate "Functions" topic in Python quiz list
11. Quiz finish button navigates away with no score shown
12. console.log("Execution successful:") left in Compiler.tsx
13. useEffect in ProfilePage missing fetchProfile in dependency array
14. AuthContext user typed as "any" throughout
15. body-parser and fs-extra installed but never used
16. All API base URLs are hardcoded strings in every component — must be centralized
17. ProfileContext typed as "any" everywhere
18. UserMenu.tsx has no TypeScript props interface

---

## EXISTING CODE (read carefully before writing anything)

### backend/models/User.js
```js
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", UserSchema);
```

### backend/models/UserProfile.js
```js
const mongoose = require('mongoose');
const UserProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: String,
  midName: String,
  lastName: String,
  college: String,
  address: String,
  mobile: String,
  degree: String
});
module.exports = mongoose.model('UserProfile', UserProfileSchema);
```

### backend/models/Problem.js
```js
const mongoose = require("mongoose");
const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  language: { type: String, required: true },
  tags: [String],
  sampleInput: { type: String, default: "" },
  sampleOutput: { type: String, required: true },
  testCases: [{ input: { type: String, default: "" }, output: { type: String, required: true } }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Problem", problemSchema);
```

### backend/models/Quiz.js
```js
const mongoose = require("mongoose");
const QuizSchema = new mongoose.Schema({
  language: String,
  topic: String,
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String
});
module.exports = mongoose.model("Quiz", QuizSchema);
```

### backend/models/Submission.js
```js
const mongoose = require("mongoose");
const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, enum: ["Accepted", "Wrong Answer", "Pending"], default: "Pending" },
  testResults: [{ input: String, expectedOutput: String, actualOutput: String, passed: Boolean }],
  submittedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Submission", submissionSchema);
```

### backend/config/db.js
```js
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) { process.exit(1); }
    const conn = await mongoose.connect(uri);
    console.log("✅ Database Connected");
    console.log(`🏠 Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
module.exports = connectDB;
```

### backend/index.js (current — has all the bugs)
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require("./config/db");
const problemRoutes = require("./routes/problem.routes");
const quizRoutes = require("./routes/quiz.routes");
const profileRoutes = require("./routes/profile.routes");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const app = express();
connectDB();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

const getHinglishHint = (stderr) => {
  if (!stderr) return null;
  const err = stderr.toLowerCase();
  const lineMatch = stderr.match(/:(?:\s+)?(\d+)(?::\d+)?/);
  const lineNo = lineMatch ? `Line ${lineMatch[1]}` : "Somewhere in code";
  if (err.includes("expected ';'")) return `Bhai, ${lineNo} pe semicolon (;) lagana bhul gaya kya? 😅`;
  if (err.includes("undeclared") || err.includes("not defined")) return `Ye kaun sa naya mehmaan hai? ${lineNo} pe variable declare kar le! 🤔`;
  if (err.includes("expected '}'") || err.includes("expected '{'")) return `Bhai, bracket ka balance bigad gaya! ${lineNo} check kar! 👐`;
  if (err.includes("format") && err.includes("expects argument")) return `Bhai, scanf mein '&' lagana bhul gaya? ${lineNo} check kar! 📍`;
  if (err.includes("undefined reference to `main'")) return "Arre bhai, 'main' function kidhar hai? 🏎️💨";
  if (err.includes("return") && err.includes("with no value")) return `Bhai, 'int main' hai toh 'return 0' kahan hai? 🤨`;
  if (err.includes("division by zero")) return `Zero se divide mat kar bhai! ${lineNo} check kar! 💀`;
  if (err.includes("unused variable")) return `Bhai, variable bana ke chod diya? ${lineNo} use toh kar! 😢`;
  return `Bhai, ${lineNo} ke aas-paas kuch gadbad hai. Dhyan se dekh le! 🧐`;
};

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ status: "success", user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ status: "success", user: { name: user.name, email: user.email } });
    } else {
      res.json({ status: "error" });
    }
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.post('/run', async (req, res) => {
  const { code, language, input } = req.body;
  const langConfig = { c: { version: "10.2.0" }, python: { version: "3.10.0" }, java: { version: "15.0.2" } };
  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: language.toLowerCase(),
      version: langConfig[language.toLowerCase()]?.version || "latest",
      files: [{ content: code }],
      stdin: input || ""
    });
    const stderr = response.data.run.stderr;
    res.json({ output: response.data.run.output, stderr, hint: stderr ? getHinglishHint(stderr) : null });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.use("/api/problems", problemRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/profile", profileRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Entry Point active on port ${PORT}`));
```

### backend/routes/problem.routes.js
```js
const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find({});
    console.log("Found Problems:", problems.length);
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
```

### backend/routes/quiz.routes.js
```js
const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
router.get("/:lang/:topic", async (req, res) => {
  try {
    const { lang, topic } = req.params;
    const quizzes = await Quiz.find({
      language: lang.toLowerCase(),
      topic: topic.replace(/-/g, ' ')
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
```

### backend/routes/profile.routes.js
```js
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
router.post('/save', async (req, res) => {
  try {
    const { email } = req.body;
    const profile = await UserProfile.findOneAndUpdate({ email }, req.body, { upsert: true, new: true });
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
router.get('/:email', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ email: req.params.email });
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
module.exports = router;
```

### backend/routes/admin.routes.js (BROKEN — Enrollment and Lecture models don't exist yet)
```js
// This file imports non-existent models. It needs Enrollment.js and Lecture.js models created.
// It is also never mounted in index.js. Both issues must be fixed.
```

### frontend/src/context/AuthContext.tsx
```tsx
import React, { createContext, useContext, useState, useEffect } from "react";
interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) { setUser(JSON.parse(savedUser)); }
  }, []);
  const login = (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

### frontend/src/context/ProfileContext.tsx
```tsx
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
const ProfileContext = createContext<any>(null);
export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchProfile = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`https://basebyte-sl12.onrender.com/api/profile/${email}`);
      if (res.data.profile) { setProfileData(res.data.profile); }
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };
  const saveProfile = async (data: any) => {
    try {
      const res = await axios.post("https://basebyte-sl12.onrender.com/api/profile/save", data);
      if (res.data.success) { setProfileData(res.data.profile); return true; }
    } catch (error) { console.error(error); return false; }
  };
  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, fetchProfile, saveProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};
export const useProfile = () => useContext(ProfileContext);
```

### frontend/src/App.tsx
```tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Compiler from "./pages/Compiler";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ProblemDetails from "./pages/ProblemDetails";
import ProblemSolve from "./pages/ProblemSolve";
import ProfilePage from "./pages/ProfilePage";
import QuizPage from './pages/QuizPage';
import Topics from './pages/Topics';
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#050505]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compiler" element={<Compiler />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:id" element={<ProblemDetails />} />
            <Route path="/solve/:id" element={<ProblemSolve />} />
            <Route path="/topics/:lang" element={<Topics />} />
            <Route path="/quiz/:lang/:topic" element={<QuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </ProfileProvider>
    </AuthProvider>
  );
}
```

### frontend/src/pages/Auth.tsx
```tsx
// handles login and signup, uses axios.post to hardcoded URL
// on error: alert(response.data.message) — shows "undefined" 
// no loading state on submit button
// no input validation
```

### frontend/src/pages/Compiler.tsx
```tsx
// has console.log("Execution successful:", response.data) — must be removed
// hardcoded API URL: https://basebyte-sl12.onrender.com/run
// uses Hinglish error hints from backend (keep this feature, it's good)
// language templates for c, python, java
// has ZoomIn/ZoomOut font size controls
// has input field for stdin
// has RotateCcw reset button
```

### frontend/src/pages/Topics.tsx
```tsx
// python topicList has "Functions" TWICE (at index 5 and index 9) — remove the duplicate
// shows hardcoded "10 Qs" — change to dynamic count from questions.length if available, or keep as is
// navigates to /quiz/:lang/:topic on click
```

### frontend/src/pages/QuizPage.tsx
```tsx
// on last question, "Finish" button calls navigate('/practice') — NO score shown
// need a score summary screen: show correct count, wrong count, percentage, retry button
// confetti on correct answer — keep this feature
// userAnswers stored in state — use this to calculate final score
```

### frontend/src/pages/ProblemSolve.tsx
```tsx
// fetches /api/problems/:id — this route doesn't exist yet on backend (fix backend too)
// imports full Compiler page as a child component — causes layout conflict
// needs proper split layout: left panel = problem description, right panel = code editor only (not full Compiler page)
```

### frontend/src/pages/ProfilePage.tsx
```tsx
// useEffect has missing fetchProfile dependency — fix it
// if user not logged in, show redirect message or redirect to /auth
```

### frontend/src/components/UserMenu.tsx
```tsx
// no TypeScript interface for props (user, onLogout)
// fix props typing
```

---

## NEW PRODUCTION FOLDER STRUCTURE TO CREATE

Create exactly this structure. Do not deviate:

```
BaseByte/
├── .gitignore                          ← modify
│
├── backend/
│   ├── index.js                        ← rewrite (fix all bugs)
│   ├── package.json                    ← modify (add start script, remove unused deps)
│   ├── .env.example                    ← create new
│   │
│   ├── config/
│   │   ├── db.js                       ← keep as is
│   │   ├── langConfig.js               ← keep as is
│   │   ├── cloudinary.js               ← create new (placeholder for Phase 2)
│   │   └── razorpay.js                 ← create new (placeholder for Phase 2)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js          ← create new
│   │   ├── admin.middleware.js         ← create new
│   │   ├── validate.middleware.js      ← create new
│   │   ├── rateLimit.middleware.js     ← create new
│   │   └── errorHandler.middleware.js  ← create new
│   │
│   ├── models/
│   │   ├── User.js                     ← modify (add role field)
│   │   ├── UserProfile.js              ← keep as is
│   │   ├── Problem.js                  ← keep as is
│   │   ├── Quiz.js                     ← keep as is
│   │   ├── Submission.js               ← keep as is
│   │   ├── Course.js                   ← create new
│   │   ├── Lecture.js                  ← create new (fixes admin.routes.js crash)
│   │   ├── Enrollment.js               ← create new (fixes admin.routes.js crash)
│   │   ├── Order.js                    ← create new
│   │   ├── Notes.js                    ← create new
│   │   ├── Feedback.js                 ← create new
│   │   └── RefreshToken.js             ← create new
│   │
│   ├── controllers/
│   │   ├── auth.controller.js          ← create new
│   │   ├── problem.controller.js       ← create new
│   │   ├── quiz.controller.js          ← create new
│   │   ├── profile.controller.js       ← create new
│   │   ├── course.controller.js        ← create new (placeholder)
│   │   ├── lecture.controller.js       ← create new (placeholder)
│   │   ├── enrollment.controller.js    ← create new (placeholder)
│   │   ├── payment.controller.js       ← create new (placeholder)
│   │   ├── notes.controller.js         ← create new (placeholder)
│   │   ├── feedback.controller.js      ← create new
│   │   └── submission.controller.js    ← create new
│   │
│   ├── routes/
│   │   ├── auth.routes.js              ← create new
│   │   ├── problem.routes.js           ← rewrite (add GET /:id)
│   │   ├── quiz.routes.js              ← rewrite (fix topic matching)
│   │   ├── profile.routes.js           ← rewrite (add auth guard)
│   │   ├── admin.routes.js             ← rewrite (fix imports, mount properly)
│   │   ├── course.routes.js            ← create new
│   │   ├── lecture.routes.js           ← create new
│   │   ├── enrollment.routes.js        ← create new
│   │   ├── payment.routes.js           ← create new (placeholder)
│   │   ├── notes.routes.js             ← create new (placeholder)
│   │   ├── feedback.routes.js          ← create new
│   │   └── submission.routes.js        ← create new
│   │
│   └── utils/
│       ├── generateToken.js            ← create new
│       ├── sendEmail.js                ← create new
│       ├── logger.js                   ← create new
│       ├── ApiResponse.js              ← create new
│       ├── ApiError.js                 ← create new
│       └── asyncHandler.js             ← create new
│
└── frontend/
    └── src/
        ├── App.tsx                     ← rewrite (add all routes, ProtectedRoute, AdminRoute)
        ├── main.tsx                    ← keep as is
        ├── index.css                   ← keep as is
        │
        ├── api/
        │   ├── axios.instance.ts       ← create new (centralize base URL + interceptors)
        │   ├── auth.api.ts             ← create new
        │   ├── problem.api.ts          ← create new
        │   ├── quiz.api.ts             ← create new
        │   ├── course.api.ts           ← create new
        │   ├── payment.api.ts          ← create new
        │   ├── notes.api.ts            ← create new
        │   ├── profile.api.ts          ← create new
        │   └── feedback.api.ts         ← create new
        │
        ├── hooks/
        │   ├── useAuth.ts              ← create new
        │   ├── useProblems.ts          ← create new
        │   ├── useQuiz.ts              ← create new
        │   ├── useCourses.ts           ← create new
        │   ├── useProfile.ts           ← create new
        │   ├── useSubmission.ts        ← create new
        │   ├── usePayment.ts           ← create new
        │   └── useToast.ts             ← create new
        │
        ├── context/
        │   ├── AuthContext.tsx         ← rewrite (fix types, add role)
        │   └── ProfileContext.tsx      ← rewrite (fix types, use api/ layer)
        │
        ├── types/
        │   ├── auth.types.ts           ← create new
        │   ├── course.types.ts         ← create new
        │   ├── problem.types.ts        ← create new
        │   ├── quiz.types.ts           ← create new
        │   └── common.types.ts         ← create new
        │
        ├── constants/
        │   ├── routes.constants.ts     ← create new
        │   └── api.constants.ts        ← create new
        │
        ├── utils/
        │   ├── formatDate.ts           ← create new
        │   ├── formatPrice.ts          ← create new
        │   └── errorDecoder.ts         ← keep as is
        │
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx          ← create new
        │   │   ├── Input.tsx           ← create new
        │   │   ├── Modal.tsx           ← create new
        │   │   ├── Badge.tsx           ← create new
        │   │   ├── Spinner.tsx         ← create new
        │   │   ├── Skeleton.tsx        ← create new
        │   │   └── Toast.tsx           ← create new
        │   │
        │   ├── layout/
        │   │   ├── Navbar.tsx          ← keep logic, fix TypeScript
        │   │   ├── Footer.tsx          ← keep as is
        │   │   └── AdminLayout.tsx     ← create new
        │   │
        │   ├── guards/
        │   │   ├── ProtectedRoute.tsx  ← create new
        │   │   ├── AdminRoute.tsx      ← create new
        │   │   └── GuestRoute.tsx      ← create new
        │   │
        │   ├── compiler/
        │   │   ├── CodeEditor.tsx      ← keep as is
        │   │   ├── Console.tsx         ← keep as is
        │   │   ├── LanguageSelector.tsx← keep as is
        │   │   └── LineNumbers.tsx     ← keep as is
        │   │
        │   ├── practice/
        │   │   ├── FilterBar.tsx       ← keep as is
        │   │   ├── ProblemCard.tsx     ← keep as is
        │   │   └── SubmissionHistory.tsx ← keep as is
        │   │
        │   ├── course/
        │   │   ├── CourseCard.tsx      ← create new
        │   │   ├── CourseHero.tsx      ← create new
        │   │   ├── LectureList.tsx     ← create new
        │   │   ├── LecturePlayer.tsx   ← create new
        │   │   └── CourseProgress.tsx  ← create new
        │   │
        │   ├── admin/
        │   │   ├── AdminSidebar.tsx    ← create new
        │   │   ├── CourseForm.tsx      ← create new
        │   │   ├── LectureForm.tsx     ← create new
        │   │   ├── EnrollmentTable.tsx ← create new
        │   │   ├── FeedbackTable.tsx   ← create new
        │   │   └── StatsCard.tsx       ← create new
        │   │
        │   ├── home/
        │   │   ├── Hero.tsx            ← keep as is
        │   │   ├── Features.tsx        ← keep as is
        │   │   └── Steps.tsx           ← keep as is
        │   │
        │   └── common/
        │       ├── UserMenu.tsx        ← fix TypeScript props
        │       ├── NotFound.tsx        ← create new
        │       └── ErrorBoundary.tsx   ← create new
        │
        └── pages/
            ├── user/
            │   ├── Home.tsx            ← keep as is
            │   ├── Auth.tsx            ← rewrite (fix errors, add loading state, no alert())
            │   ├── Practice.tsx        ← keep as is
            │   ├── ProblemDetails.tsx  ← fix API call
            │   ├── ProblemSolve.tsx    ← fix layout (no embedded Compiler page)
            │   ├── Compiler.tsx        ← fix (remove console.log, use api/ layer)
            │   ├── Topics.tsx          ← fix (remove duplicate Functions)
            │   ├── QuizPage.tsx        ← fix (add score summary screen)
            │   ├── ProfilePage.tsx     ← fix (useEffect deps, redirect if not logged in)
            │   ├── About.tsx           ← keep as is
            │   ├── Courses.tsx         ← create new
            │   ├── CourseDetails.tsx   ← create new
            │   ├── CourseLearning.tsx  ← create new
            │   ├── Notes.tsx           ← create new
            │   ├── Checkout.tsx        ← create new
            │   └── Feedback.tsx        ← create new
            │
            └── admin/
                ├── AdminDashboard.tsx  ← create new
                ├── AdminCourses.tsx    ← create new
                ├── AdminLectures.tsx   ← create new
                ├── AdminStudents.tsx   ← create new
                ├── AdminEnrollments.tsx← create new
                ├── AdminProblems.tsx   ← create new
                ├── AdminFeedback.tsx   ← create new
                └── AdminNotes.tsx      ← create new
```

---

## EXACT RULES FOR EVERY FILE

### Rule 1 — backend/package.json
Add `"start": "node index.js"` to scripts. Remove `body-parser` and `fs-extra` from dependencies. Keep all others.

### Rule 2 — backend/.env.example
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/BaseByte
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=https://basebyte.vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Rule 3 — backend/utils/ApiResponse.js
```js
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
module.exports = ApiResponse;
```

### Rule 4 — backend/utils/ApiError.js
```js
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) { this.stack = stack; }
    else { Error.captureStackTrace(this, this.constructor); }
  }
}
module.exports = ApiError;
```

### Rule 5 — backend/utils/asyncHandler.js
```js
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
module.exports = asyncHandler;
```

### Rule 6 — backend/utils/generateToken.js
Use jsonwebtoken. Export two functions: generateAccessToken(userId) — expires in 15m. generateRefreshToken(userId) — expires in 7d. Use JWT_SECRET and JWT_REFRESH_SECRET from process.env.

### Rule 7 — backend/middleware/auth.middleware.js
Verify JWT from Authorization header (Bearer token). Attach user to req.user. Return 401 if no token or invalid.

### Rule 8 — backend/middleware/admin.middleware.js
Check req.user.role === 'admin'. Return 403 if not. Must be used after auth.middleware.

### Rule 9 — backend/middleware/errorHandler.middleware.js
Global error handler. Catch ApiError instances and return proper JSON. Also handle Mongoose validation errors and duplicate key errors (code 11000 = email already exists).

### Rule 10 — backend/models/User.js
Add `role: { type: String, enum: ['student', 'admin'], default: 'student' }` field to existing schema. Keep all other fields.

### Rule 11 — backend/models/Course.js
Fields: title (String, required), description (String, required), thumbnail (String), price (Number, default 0), isFree (Boolean, default false), instructor (String), category (String), tags ([String]), isPublished (Boolean, default false), createdAt (Date, default now).

### Rule 12 — backend/models/Lecture.js
Fields: courseId (ObjectId ref Course, required), title (String, required), videoUrl (String), notes (String), order (Number), duration (String), isLive (Boolean, default false), liveLink (String), createdAt (Date, default now).

### Rule 13 — backend/models/Enrollment.js
Fields: userId (ObjectId ref User), userEmail (String, required), courseId (ObjectId ref Course), status (enum: pending/approved/rejected, default pending), paymentId (String), enrolledAt (Date, default now).

### Rule 14 — backend/models/Order.js
Fields: userId (ObjectId ref User, required), courseId (ObjectId ref Course, required), amount (Number, required), currency (String, default INR), razorpayOrderId (String), razorpayPaymentId (String), status (enum: created/paid/failed, default created), createdAt (Date, default now).

### Rule 15 — backend/models/Notes.js
Fields: uploadedBy (ObjectId ref User), uploaderEmail (String), title (String, required), fileUrl (String), subject (String), price (Number, default 0), isFree (Boolean, default true), isApproved (Boolean, default false), downloads (Number, default 0), createdAt (Date, default now).

### Rule 16 — backend/models/Feedback.js
Fields: userId (ObjectId ref User), userEmail (String), courseId (ObjectId ref Course, optional), type (enum: course/website, default website), rating (Number, min 1, max 5), comment (String), createdAt (Date, default now).

### Rule 17 — backend/models/RefreshToken.js
Fields: token (String, required, unique), userId (ObjectId ref User, required), expiresAt (Date, required), createdAt (Date, default now).

### Rule 18 — backend/controllers/auth.controller.js
Four functions: signup, login, refreshToken, logout. 
- signup: validate name/email/password, check if email exists, hash password (bcrypt cost 12), save user, return success message (no token yet on signup — user must login).
- login: validate email/password, find user, compare password, generate access + refresh token, save refresh token to DB, return { accessToken, refreshToken, user: { id, name, email, role } }.
- refreshToken: verify refresh token from body, check in DB, generate new access token, return it.
- logout: delete refresh token from DB.

### Rule 19 — backend/controllers/problem.controller.js
Two functions: getAllProblems (GET /), getProblemById (GET /:id). Remove console.log. Return proper ApiResponse.

### Rule 20 — backend/controllers/quiz.controller.js
One function: getQuizByLangAndTopic. Fix topic matching: use case-insensitive regex instead of exact string match. This fixes the hyphen/space bug properly.

### Rule 21 — backend/controllers/profile.controller.js
Two functions: saveProfile, getProfile. Add auth middleware — profile routes require login.

### Rule 22 — backend/controllers/feedback.controller.js
Two functions: submitFeedback (POST), getAllFeedback (GET, admin only).

### Rule 23 — backend/controllers/submission.controller.js
Two functions: saveSubmission (POST, auth required), getMySubmissions (GET /:problemId, auth required).

### Rule 24 — backend/index.js (rewrite)
- Load dotenv
- Connect DB
- Apply Helmet for security headers
- Apply CORS with process.env.FRONTEND_URL
- Apply express.json()
- Apply Morgan for HTTP logging (dev format)
- Apply global rate limiter
- Mount all routes:
  - POST /api/auth/signup → auth.routes
  - POST /api/auth/login → auth.routes
  - POST /api/auth/refresh → auth.routes
  - POST /api/auth/logout → auth.routes
  - GET/POST /api/problems → problem.routes (protect POST with auth+admin)
  - GET /api/quizzes → quiz.routes
  - GET/POST /api/profile → profile.routes (protect with auth)
  - GET/POST /api/admin → admin.routes (protect with auth+admin)
  - GET/POST /api/courses → course.routes
  - GET/POST /api/lectures → lecture.routes
  - POST /api/payment → payment.routes
  - GET/POST /api/notes → notes.routes
  - POST /api/feedback → feedback.routes
  - GET/POST /api/submissions → submission.routes
  - POST /run → inline (keep existing Piston API call with Hinglish hints)
- Mount global errorHandler middleware LAST
- Start server on process.env.PORT || 5000
- Install required new packages: jsonwebtoken, helmet, morgan, express-rate-limit

### Rule 25 — frontend/src/api/axios.instance.ts
```ts
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://basebyte-sl12.onrender.com';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
// Request interceptor: attach accessToken from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});
// Response interceptor: handle 401 gracefully
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
```

### Rule 26 — frontend/src/api/auth.api.ts
Export: signup(name, email, password), login(email, password), logout(), refreshToken(token). Use axiosInstance.

### Rule 27 — frontend/src/api/problem.api.ts
Export: getAllProblems(), getProblemById(id). Use axiosInstance.

### Rule 28 — frontend/src/api/quiz.api.ts
Export: getQuizByTopic(lang, topic). Use axiosInstance.

### Rule 29 — frontend/src/api/profile.api.ts
Export: getProfile(email), saveProfile(data). Use axiosInstance.

### Rule 30 — frontend/src/types/auth.types.ts
```ts
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
```

### Rule 31 — frontend/src/types/problem.types.ts
```ts
export interface TestCase { input: string; output: string; }
export interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  tags: string[];
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  createdAt: string;
}
```

### Rule 32 — frontend/src/types/quiz.types.ts
```ts
export interface Quiz {
  _id: string;
  language: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
```

### Rule 33 — frontend/src/types/course.types.ts
```ts
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  instructor: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}
export interface Lecture {
  _id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  notes: string;
  order: number;
  duration: string;
  isLive: boolean;
  liveLink: string;
}
export interface Enrollment {
  _id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
}
```

### Rule 34 — frontend/src/types/common.types.ts
```ts
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
```

### Rule 35 — frontend/src/constants/routes.constants.ts
```ts
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PRACTICE: '/practice',
  PROBLEM_DETAILS: '/practice/:id',
  PROBLEM_SOLVE: '/solve/:id',
  COMPILER: '/compiler',
  TOPICS: '/topics/:lang',
  QUIZ: '/quiz/:lang/:topic',
  PROFILE: '/profile',
  COURSES: '/courses',
  COURSE_DETAILS: '/courses/:id',
  COURSE_LEARNING: '/courses/:id/learn',
  NOTES: '/notes',
  CHECKOUT: '/checkout/:id',
  FEEDBACK: '/feedback',
  ABOUT: '/about',
  ADMIN: '/admin',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_LECTURES: '/admin/lectures',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_ENROLLMENTS: '/admin/enrollments',
  ADMIN_PROBLEMS: '/admin/problems',
  ADMIN_FEEDBACK: '/admin/feedback',
  ADMIN_NOTES: '/admin/notes',
  NOT_FOUND: '*',
} as const;
```

### Rule 36 — frontend/src/context/AuthContext.tsx (rewrite)
- Replace `user: any` with `User | null` from auth.types.ts
- Store accessToken in localStorage as 'accessToken'
- Store user in localStorage as 'user'
- login function receives LoginResponse: stores accessToken, refreshToken, user
- logout removes accessToken, refreshToken, user from localStorage
- Add isAuthenticated: boolean = !!user
- Add isAdmin: boolean = user?.role === 'admin'

### Rule 37 — frontend/src/components/guards/ProtectedRoute.tsx
```tsx
// If user is not authenticated, redirect to /auth
// Otherwise render children (Outlet)
```

### Rule 38 — frontend/src/components/guards/AdminRoute.tsx
```tsx
// If user is not authenticated, redirect to /auth
// If user is authenticated but not admin, redirect to /
// Otherwise render children (Outlet)
```

### Rule 39 — frontend/src/components/guards/GuestRoute.tsx
```tsx
// If user IS authenticated, redirect to /
// Otherwise render children (used to wrap /auth so logged-in users can't access login page)
```

### Rule 40 — frontend/src/components/ui/Toast.tsx
A self-dismissing toast notification component. Types: success (green), error (red), warning (yellow), info (blue). Appears bottom-right. Auto-dismisses after 4 seconds. Has close button. Uses Tailwind CSS. No external toast library.

### Rule 41 — frontend/src/components/ui/Spinner.tsx
Simple animated loading spinner. Small (24px), medium (40px), large (64px) size props. Uses Tailwind CSS. Indigo color to match app theme.

### Rule 42 — frontend/src/components/ui/Skeleton.tsx
Skeleton loading placeholder. Props: width, height, rounded. Uses Tailwind animate-pulse. Dark theme (bg-zinc-800).

### Rule 43 — frontend/src/components/common/NotFound.tsx
Proper 404 page. Dark theme matching app (#050505 background). Show "404" in large text, "Page not found" message, and a "Go Home" button that navigates to /.

### Rule 44 — frontend/src/components/common/ErrorBoundary.tsx
Class-based React error boundary. Catches JS errors in component tree. Shows fallback UI instead of blank page.

### Rule 45 — frontend/src/hooks/useToast.ts
Custom hook to manage toast notifications. Returns: { toasts, showToast(message, type), removeToast(id) }. showToast generates a unique ID and adds to array. Auto-removes after 4 seconds.

### Rule 46 — frontend/src/hooks/useAuth.ts
Re-export useAuth from AuthContext OR wrap it with additional helpers. Keep simple.

### Rule 47 — frontend/src/pages/user/Auth.tsx (rewrite)
- Remove all alert() calls
- Show error message INLINE below the form (red text)
- Add loading state: disable button + show spinner while submitting
- Validate: name required if signup, email format, password min 6 chars
- On success: store token via AuthContext login(), navigate to /
- Use auth.api.ts instead of direct axios call
- Keep all existing UI/design (dark theme, rounded form, Eye/EyeOff toggle, etc.)

### Rule 48 — frontend/src/pages/user/QuizPage.tsx (rewrite)
Keep everything that works. Fix only: when currentIndex + 1 >= questions.length after answering, show a ScoreScreen instead of navigating. ScoreScreen shows:
- Total questions
- Correct answers count
- Wrong answers count  
- Percentage score
- Performance message (Excellent >= 80%, Good >= 60%, Keep Practicing < 60%)
- "Try Again" button (resets state)
- "Back to Topics" button (navigate to /topics/:lang)
Keep confetti on correct answer. Keep all existing UI design.

### Rule 49 — frontend/src/pages/user/Topics.tsx (fix)
Remove duplicate "Functions" from python array. Keep everything else exactly the same.

### Rule 50 — frontend/src/pages/user/Compiler.tsx (fix)
Remove the console.log("Execution successful:", response.data) line. Replace direct axios call with axiosInstance from api/axios.instance.ts. Everything else stays identical.

### Rule 51 — frontend/src/pages/user/ProblemSolve.tsx (fix)
Do NOT import or embed the full Compiler page. Instead: import CodeEditor, LanguageSelector, Console components directly. Replicate the compiler logic inline (language state, code state, handleRun, output state). Left panel = problem description (keep existing UI). Right panel = code editor + console. Keep existing header with back button and problem title.

### Rule 52 — frontend/src/pages/user/ProfilePage.tsx (fix)
Add fetchProfile to useEffect dependency array. If user is null, show a message "Please login to view your profile" with a button to navigate to /auth.

### Rule 53 — frontend/src/components/layout/Navbar.tsx (fix)
Add proper TypeScript. Add "Courses" link to nav menu items alongside Home, Practice, Compiler, About. Keep all existing design.

### Rule 54 — frontend/src/components/common/UserMenu.tsx (fix)
Add TypeScript interface: `interface UserMenuProps { user: User; onLogout: () => void; }`. Replace the `user` and `onLogout` any-typed props with this interface.

### Rule 55 — frontend/src/App.tsx (rewrite)
```tsx
// Structure:
// <AuthProvider>
//   <ProfileProvider>
//     <ToastProvider (if using context for toasts)>
//       <Router>
//         <Navbar />
//         <main>
//           <Routes>
//             {/* Public routes */}
//             <Route path="/" element={<Home />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/compiler" element={<Compiler />} />
//             <Route path="/courses" element={<Courses />} />
//
//             {/* Guest only routes (redirect to / if logged in) */}
//             <Route element={<GuestRoute />}>
//               <Route path="/auth" element={<Auth />} />
//               <Route path="/login" element={<Auth />} />
//               <Route path="/signup" element={<Auth />} />
//             </Route>
//
//             {/* Protected routes (redirect to /auth if not logged in) */}
//             <Route element={<ProtectedRoute />}>
//               <Route path="/practice" element={<Practice />} />
//               <Route path="/practice/:id" element={<ProblemDetails />} />
//               <Route path="/solve/:id" element={<ProblemSolve />} />
//               <Route path="/topics/:lang" element={<Topics />} />
//               <Route path="/quiz/:lang/:topic" element={<QuizPage />} />
//               <Route path="/profile" element={<ProfilePage />} />
//               <Route path="/courses/:id" element={<CourseDetails />} />
//               <Route path="/courses/:id/learn" element={<CourseLearning />} />
//               <Route path="/notes" element={<Notes />} />
//               <Route path="/checkout/:id" element={<Checkout />} />
//               <Route path="/feedback" element={<Feedback />} />
//             </Route>
//
//             {/* Admin only routes */}
//             <Route element={<AdminRoute />}>
//               <Route path="/admin" element={<AdminDashboard />} />
//               <Route path="/admin/courses" element={<AdminCourses />} />
//               <Route path="/admin/lectures" element={<AdminLectures />} />
//               <Route path="/admin/students" element={<AdminStudents />} />
//               <Route path="/admin/enrollments" element={<AdminEnrollments />} />
//               <Route path="/admin/problems" element={<AdminProblems />} />
//               <Route path="/admin/feedback" element={<AdminFeedback />} />
//               <Route path="/admin/notes" element={<AdminNotes />} />
//             </Route>
//
//             {/* 404 */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </main>
//         <Footer />
//       </Router>
//     </ToastProvider>
//   </ProfileProvider>
// </AuthProvider>
```

### Rule 56 — New pages (Courses, CourseDetails, CourseLearning, Notes, Checkout, Feedback, all Admin pages)
For ALL new pages that don't have existing code: create a clean placeholder page. Dark theme (#050505 bg, white text). Show the page title centered. Show "Coming Soon" or "Under Construction" text. Keep the same visual style as existing pages. These will be filled in during Phase 2. Do NOT leave them blank or return null.

### Rule 57 — All placeholder files (config/cloudinary.js, config/razorpay.js, routes that are new for Phase 2, controllers for Phase 2 features)
Add a comment at top: `// Phase 2 — To be implemented`. Export an empty router or empty object so the app doesn't crash if accidentally imported.

---

## DESIGN RULES (apply to all new/modified frontend files)
- Background: #050505
- Cards/surfaces: #0A0A0C or #111114
- Borders: white/5 or white/10
- Primary accent: indigo-500 / indigo-600
- Text primary: white
- Text secondary: zinc-400 or zinc-500
- Font: Public Sans or system sans-serif
- Rounded corners: rounded-2xl or rounded-[24px] or rounded-[32px]
- All buttons: font-black uppercase tracking-widest text-xs
- Hover effects: transition-all duration-300
- Active: active:scale-95

---

## FINAL CHECKLIST — verify before finishing

Backend:
- [ ] package.json has "start": "node index.js"
- [ ] body-parser and fs-extra removed from dependencies
- [ ] index.js uses process.env.FRONTEND_URL for CORS
- [ ] index.js has no hardcoded localhost URLs
- [ ] GET /api/problems/:id route exists
- [ ] admin.routes.js no longer crashes (Enrollment and Lecture models exist)
- [ ] admin.routes.js is mounted in index.js
- [ ] auth routes exist: /api/auth/signup, /api/auth/login
- [ ] Login response includes { accessToken, refreshToken, user: { id, name, email, role } }
- [ ] No console.log in production code (except startup messages)
- [ ] Global error handler middleware mounted last
- [ ] asyncHandler wraps all controller functions
- [ ] Quiz route uses case-insensitive regex for topic matching

Frontend:
- [ ] No hardcoded https://basebyte-sl12.onrender.com URLs anywhere — all use axiosInstance
- [ ] No alert() calls anywhere — all errors shown inline or via Toast
- [ ] No console.log in production code
- [ ] No "any" types in AuthContext — uses User interface
- [ ] No "any" types in ProfileContext
- [ ] ProtectedRoute wraps all auth-required pages
- [ ] AdminRoute wraps all admin pages
- [ ] GuestRoute wraps /auth /login /signup
- [ ] Wildcard * route shows NotFound page (not Home)
- [ ] Python topics list has no duplicate "Functions"
- [ ] QuizPage shows score screen after last question
- [ ] ProfilePage useEffect has correct dependencies
- [ ] UserMenu has proper TypeScript props interface
- [ ] ProblemSolve does NOT import full Compiler page
- [ ] Auth.tsx shows inline error messages, not alert()
- [ ] Auth.tsx has loading state on submit button
- [ ] Navbar has "Courses" link added

---

Now generate all files. Start with backend files first (package.json, utils, models, middleware, controllers, routes, index.js), then frontend files (types, constants, api layer, hooks, context, components, pages). Write complete full code for every file — no placeholders, no "// add code here", no truncation. Every file must be production-ready and complete.
