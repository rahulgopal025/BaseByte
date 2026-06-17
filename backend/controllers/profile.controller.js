import UserProfile from '../models/UserProfile.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import Enrollment from '../models/Enrollment.js';
import PracticePath from '../models/PracticePath.js';
import Notes from '../models/Notes.js';

// ─── Profile Completion Calculator ─────────────────────────────────────────────
const COMPLETION_FIELDS = [
  { field: 'avatar', label: 'Add a profile photo to improve your profile.' },
  { field: 'bio', label: 'Write a bio to tell others about yourself.' },
  { field: 'mobile', label: 'Add your phone number for account security.' },
  { field: 'college', label: 'Add your college to connect with peers.' },
  { field: 'degree', label: 'Add your degree information.' },
  { field: 'graduationYear', label: 'Add your graduation year.' },
  { field: 'skills', label: 'Add skills to showcase your expertise.', isArray: true },
  { field: 'github', label: 'Add your GitHub profile to increase profile completion.' },
  { field: 'linkedin', label: 'Link your LinkedIn for professional networking.' },
  { field: 'website', label: 'Add your portfolio website to showcase your work.' },
  { field: 'location', label: 'Add your location to your profile.' },
];

function calculateProfileCompletion(profile) {
  let filled = 0;
  const tips = [];
  const total = COMPLETION_FIELDS.length;

  for (const { field, label, isArray } of COMPLETION_FIELDS) {
    const val = profile[field];
    if (isArray) {
      if (Array.isArray(val) && val.length > 0) filled++;
      else tips.push(label);
    } else {
      if (val && val.toString().trim() !== '') filled++;
      else tips.push(label);
    }
  }

  return {
    percentage: Math.round((filled / total) * 100),
    tips: tips.slice(0, 3), // Top 3 tips
  };
}

// ─── Badge Definitions ─────────────────────────────────────────────────────────
function computeBadges(stats) {
  const { totalProblemsSolved, easySolved, mediumSolved, hardSolved, coursesEnrolled, coursesCompleted, practicePathsCompleted, totalSubmissions } = stats;

  const badgeDefs = [
    { id: 'first_problem', icon: '🥇', title: 'First Blood', description: 'Solve your first problem', target: 1, current: totalProblemsSolved },
    { id: '10_problems', icon: '⚡', title: 'Problem Crusher', description: 'Solve 10 problems', target: 10, current: totalProblemsSolved },
    { id: '50_problems', icon: '🔥', title: 'Code Warrior', description: 'Solve 50 problems', target: 50, current: totalProblemsSolved },
    { id: '100_problems', icon: '🏆', title: 'Century Club', description: 'Solve 100 problems', target: 100, current: totalProblemsSolved },
    { id: '500_problems', icon: '💎', title: 'Diamond Coder', description: 'Solve 500 problems', target: 500, current: totalProblemsSolved },
    { id: 'easy_master', icon: '🟢', title: 'Easy Master', description: 'Solve 25 easy problems', target: 25, current: easySolved },
    { id: 'medium_master', icon: '🟡', title: 'Medium Conqueror', description: 'Solve 25 medium problems', target: 25, current: mediumSolved },
    { id: 'hard_master', icon: '🔴', title: 'Hard Mode Hero', description: 'Solve 10 hard problems', target: 10, current: hardSolved },
    { id: 'first_course', icon: '📚', title: 'Eager Learner', description: 'Enroll in your first course', target: 1, current: coursesEnrolled },
    { id: 'course_finisher', icon: '🎓', title: 'Course Finisher', description: 'Complete a course', target: 1, current: coursesCompleted },
    { id: '5_courses', icon: '🌟', title: 'Knowledge Seeker', description: 'Enroll in 5 courses', target: 5, current: coursesEnrolled },
    { id: 'path_master', icon: '🗺️', title: 'Path Master', description: 'Complete a practice path', target: 1, current: practicePathsCompleted },
    { id: '100_submissions', icon: '🚀', title: 'Submission Machine', description: 'Make 100 submissions', target: 100, current: totalSubmissions },
  ];

  return badgeDefs.map(b => ({
    id: b.id,
    icon: b.icon,
    title: b.title,
    description: b.description,
    isUnlocked: b.current >= b.target,
    earnedDate: b.current >= b.target ? new Date().toISOString() : undefined,
    progress: Math.min(b.current, b.target),
    target: b.target,
  }));
}

// ─── Day Name Helper ────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Save Profile ───────────────────────────────────────────────────────────────
export const saveProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.user.id },
    { ...req.body, userId: req.user.id },
    { upsert: true, new: true, runValidators: true }
  );

  res.json(new ApiResponse(200, profile, 'Profile saved successfully.'));
});

// ─── Get Profile with Full Dashboard Data ───────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  let profile = await UserProfile.findOne({ userId: req.user.id });

  if (!profile && req.user.email) {
    profile = await UserProfile.findOne({ email: req.user.email });
    // Migrate the old profile by setting its userId
    if (profile) {
      profile.userId = req.user.id;
      await profile.save();
    }
  }

  if (!profile) {
    // Auto-create profile so dashboard is always available
    profile = await UserProfile.create({
      userId: req.user.id,
      email: req.user.email || ''
    });
  }

  const userId = req.user.id;

  // ─── Run all queries in parallel for performance ─────────────────────────
  const [
    totalProblemsAvailable,
    easyTotal,
    mediumTotal,
    hardTotal,
    allSubmissions,
    acceptedProblemIds,
    easySolvedIds,
    mediumSolvedIds,
    hardSolvedIds,
    coursesEnrolled,
    coursesCompleted,
    enrolledCoursesList,
    allPaths,
    notesCount,
    recentSubmissions,
  ] = await Promise.all([
    // Problem counts by difficulty
    Problem.countDocuments(),
    Problem.countDocuments({ difficulty: 'Easy' }),
    Problem.countDocuments({ difficulty: 'Medium' }),
    Problem.countDocuments({ difficulty: 'Hard' }),
    // Submissions
    Submission.countDocuments({ userId }),
    Submission.distinct('problemId', { userId, status: 'Accepted' }),
    // Solved by difficulty — need to join with Problem
    Submission.distinct('problemId', { userId, status: 'Accepted' }).then(async (ids) => {
      if (ids.length === 0) return [];
      return Problem.find({ _id: { $in: ids }, difficulty: 'Easy' }).distinct('_id');
    }),
    Submission.distinct('problemId', { userId, status: 'Accepted' }).then(async (ids) => {
      if (ids.length === 0) return [];
      return Problem.find({ _id: { $in: ids }, difficulty: 'Medium' }).distinct('_id');
    }),
    Submission.distinct('problemId', { userId, status: 'Accepted' }).then(async (ids) => {
      if (ids.length === 0) return [];
      return Problem.find({ _id: { $in: ids }, difficulty: 'Hard' }).distinct('_id');
    }),
    // Enrollments
    Enrollment.countDocuments({ userId }),
    Enrollment.countDocuments({ userId, isCompleted: true }),
    Enrollment.find({ userId, status: 'approved' })
      .populate('courseId', 'title description thumbnail instructor')
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean(),
    // Practice paths
    PracticePath.find().lean(),
    // Notes
    Notes.countDocuments(),
    // Recent activity (last 10 submissions with problem info)
    Submission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('problemId', 'title difficulty language')
      .lean(),
  ]);

  // ─── Practice Paths Completed ────────────────────────────────────────────
  let practicePathsCompleted = 0;
  const solvedSet = new Set(acceptedProblemIds.map(id => id.toString()));
  if (solvedSet.size > 0 && allPaths.length > 0) {
    allPaths.forEach(path => {
      if (path.problems && path.problems.length > 0) {
        const isCompleted = path.problems.every(pId => solvedSet.has(pId.toString()));
        if (isCompleted) practicePathsCompleted++;
      }
    });
  }

  // ─── Favorite Language ───────────────────────────────────────────────────
  let favoriteLanguage = 'N/A';
  let mostActiveDay = 'N/A';
  const submissionsByMonth = [];

  let dailyCount = {}; // For activity calendar

  if (recentSubmissions.length > 0) {
    // Language frequency
    const langCount = {};
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    const monthCount = {};

    const allUserSubmissions = await Submission.find({ userId })
      .select('language createdAt')
      .lean();

    allUserSubmissions.forEach(sub => {
      const lang = (sub.language || '').toLowerCase();
      if (lang) langCount[lang] = (langCount[lang] || 0) + 1;

      if (sub.createdAt) {
        const d = new Date(sub.createdAt);
        dayCount[d.getDay()]++;

        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;

        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dailyCount[dayKey] = (dailyCount[dayKey] || 0) + 1;
      }
    });

    // Most used language
    const sortedLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
    if (sortedLangs.length > 0) {
      favoriteLanguage = sortedLangs[0][0].charAt(0).toUpperCase() + sortedLangs[0][0].slice(1);
    }

    // Most active day
    const maxDayIdx = dayCount.indexOf(Math.max(...dayCount));
    if (dayCount[maxDayIdx] > 0) {
      mostActiveDay = DAY_NAMES[maxDayIdx];
    }

    // Submissions by month (last 6 months)
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      submissionsByMonth.push({
        month: monthNames[d.getMonth()],
        count: monthCount[key] || 0,
      });
    }
  }

  // ─── Activity Calendar (Last 365 Days) ───────────────────────────────────
  const activityCalendar = [];
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 364);

  // Initialize all 365 days to ensure grid is complete
  for (let d = new Date(oneYearAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = (typeof dailyCount !== 'undefined' ? dailyCount[dateStr] : 0) || 0;

    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 5) level = 3;
    else if (count >= 2) level = 2;
    else if (count === 1) level = 1;

    activityCalendar.push({ date: dateStr, count, level });
  }

  // Streak Calculation
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Sort unique dates descending to calculate current streak
  const uniqueDates = typeof dailyCount !== 'undefined' ? Object.keys(dailyCount).sort((a, b) => new Date(b) - new Date(a)) : [];

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  // Find max streak (ascending logic)
  const uniqueDatesAsc = [...uniqueDates].reverse();
  for (let i = 0; i < uniqueDatesAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(uniqueDatesAsc[i - 1]);
      const currDate = new Date(uniqueDatesAsc[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) tempStreak++;
      else tempStreak = 1;
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
  }

  // Find current streak
  let checkDate = new Date();
  let datePtrStr = todayStr;

  // If no submission today, check if streak continued yesterday
  if (!dailyCount || !dailyCount[todayStr]) {
    if (dailyCount && dailyCount[yesterdayStr]) {
      datePtrStr = yesterdayStr;
      checkDate = yesterdayDate;
    } else {
      currentStreak = 0;
    }
  }

  if (dailyCount && dailyCount[datePtrStr]) {
    while (dailyCount[datePtrStr]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      datePtrStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    }
  }

  // ─── Acceptance Rate ─────────────────────────────────────────────────────
  const totalSubmissions = allSubmissions;
  const acceptanceRate = totalSubmissions > 0
    ? Math.round((acceptedProblemIds.length / totalSubmissions) * 100)
    : 0;

  // ─── Skill Progress (by language) ────────────────────────────────────────
  const allProblems = await Problem.find().select('language difficulty').lean();
  const problemsByLang = {};
  allProblems.forEach(p => {
    const lang = (p.language || '').toLowerCase();
    if (!problemsByLang[lang]) problemsByLang[lang] = { total: 0, solved: 0 };
    problemsByLang[lang].total++;
  });

  // Count solved per language
  if (acceptedProblemIds.length > 0) {
    const solvedProblems = await Problem.find({ _id: { $in: acceptedProblemIds } }).select('language').lean();
    solvedProblems.forEach(p => {
      const lang = (p.language || '').toLowerCase();
      if (problemsByLang[lang]) problemsByLang[lang].solved++;
    });
  }

  const skillProgress = Object.entries(problemsByLang)
    .filter(([, v]) => v.total > 0)
    .map(([name, v]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      solved: v.solved,
      total: v.total,
      percentage: Math.round((v.solved / v.total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // ─── Recent Activity ─────────────────────────────────────────────────────
  const recentActivity = recentSubmissions
    .filter(s => s.problemId)
    .slice(0, 10)
    .map((s, i) => ({
      id: s._id?.toString() || `activity-${i}`,
      type: s.status === 'Accepted' ? 'problem_solved' : 'submission',
      description: s.status === 'Accepted'
        ? `Solved "${s.problemId.title}"`
        : `Submitted solution for "${s.problemId.title}" — ${s.status}`,
      timestamp: s.createdAt,
      meta: {
        difficulty: s.problemId.difficulty,
        language: s.language,
        status: s.status,
      },
    }));

  // ─── Profile Completion ──────────────────────────────────────────────────
  const { percentage: profileCompletion, tips: completionTips } = calculateProfileCompletion(profile);

  // ─── Coding Stats ────────────────────────────────────────────────────────
  const codingStats = {
    totalSubmissions,
    totalProblemsSolved: acceptedProblemIds.length,
    totalProblemsAvailable,
    easySolved: easySolvedIds.length,
    easyTotal,
    mediumSolved: mediumSolvedIds.length,
    mediumTotal,
    hardSolved: hardSolvedIds.length,
    hardTotal,
    acceptanceRate,
    favoriteLanguage,
    mostActiveDay,
    submissionsByMonth,
    activityCalendar,
    currentStreak,
    maxStreak
  };

  // ─── Learning Stats ──────────────────────────────────────────────────────
  const learningStats = {
    coursesEnrolled,
    coursesCompleted,
    practicePathsCompleted,
    totalPracticePathsAvailable: allPaths.length,
    lecturesWatched: 0, // Needs lecture tracking model
    totalLearningHours: 0, // Needs time tracking
    quizzesCompleted: 0, // Needs quiz attempt tracking
    notesCount,
    certificatesEarned: coursesCompleted, // Certificates = completed courses
    currentStreak: 0, // Needs daily activity tracking
    longestStreak: 0, // Needs daily activity tracking
  };

  // ─── Badges ──────────────────────────────────────────────────────────────
  const badges = computeBadges({
    totalProblemsSolved: acceptedProblemIds.length,
    easySolved: easySolvedIds.length,
    mediumSolved: mediumSolvedIds.length,
    hardSolved: hardSolvedIds.length,
    coursesEnrolled,
    coursesCompleted,
    practicePathsCompleted,
    totalSubmissions,
  });

  // ─── Legacy stats for backward compatibility ─────────────────────────────
  const stats = {
    totalProblemsAvailable,
    totalProblemsSolved: acceptedProblemIds.length,
    coursesEnrolled,
    coursesCompleted,
    practicePathsCompleted,
  };

  // ─── Response ────────────────────────────────────────────────────────────
  res.json(new ApiResponse(200, {
    ...profile.toObject(),
    stats,
    codingStats,
    learningStats,
    badges,
    recentActivity,
    skillProgress,
    profileCompletion,
    completionTips,
    enrolledCourses: enrolledCoursesList,
  }, 'Profile fetched successfully.'));
});
