import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import compression from 'compression';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import { globalLimiter, authLimiter } from './middleware/rateLimit.middleware.js';

// Routes
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

// Security & Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CORS
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

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BaseByte server is running.',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rate Limiter
app.use(globalLimiter);

// Compiler Route
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

    res.json({
      output: response.data.run.output,
      stderr: response.data.run.stderr
    });
  } catch {
    res.status(500).json({ error: 'Server Error' });
  }
});

// API Routes
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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found.' });
});

// Global Error Handler
app.use(errorHandler);

// Database & Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BaseByte server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
  });
});