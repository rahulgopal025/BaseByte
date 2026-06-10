import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import { globalLimiter, authLimiter } from './middleware/rateLimit.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import profileRoutes from './routes/profile.routes.js';
import adminRoutes from './routes/admin.routes.js';
import courseRoutes from './routes/course.routes.js';
import lectureRoutes from './routes/lecture.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notesRoutes from './routes/notes.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import submissionRoutes from './routes/submission.routes.js';

const app = express();

// ─── Security Headers ─────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://basebyte.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// ─── Request Parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logging ─────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Global Rate Limiter ──────────────────────────────────────────
app.use(globalLimiter);

// ─── Hinglish Error Hints ─────────────────────────────────────────
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

// ─── Compiler Route (Piston API) ──────────────────────────────────
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

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/submissions', submissionRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BaseByte server is running.' });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found.' });
});

// ─── Global Error Handler (must be LAST) ──────────────────────────
app.use(errorHandler);

// ─── Connect DB & Start Server ────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BaseByte server running on port ${PORT}`);
  });
});