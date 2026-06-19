import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import axiosInstance from "../api/axios.instance";
import { API_ENDPOINTS } from "../constants/api.constants";

export interface CodingStats {
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  totalProblemsSolved: number;
  totalProblemsAvailable: number;
  totalSubmissions: number;
  acceptanceRate: number;
  favoriteLanguage: string;
  mostActiveDay: string;
  submissionsByMonth: { month: string; count: number }[];
  activityCalendar?: { date: string; count: number; level: number }[];
  currentStreak?: number;
  maxStreak?: number;
}

export interface LearningStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  practicePathsCompleted: number;
  totalPracticePathsAvailable: number;
  lecturesWatched: number;
  totalLearningHours: number;
  quizzesCompleted: number;
  notesCount: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  earnedDate?: string;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}

export interface ActivityItem {
  id: string;
  type: 'problem_solved' | 'course_enrolled' | 'submission' | 'profile_update';
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface SkillProgress {
  name: string;
  solved: number;
  total: number;
  percentage: number;
}

export interface ProfileData {
  _id?: string;
  userId?: string;
  username?: string;
  provider?: string;
  email?: string;
  firstName?: string;
  midName?: string;
  lastName?: string;
  college?: string;
  address?: string;
  mobile?: string;
  degree?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  twitter?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  graduationYear?: string;
  location?: string;
  createdAt?: string;
  profileCompletion?: number;
  completionTips?: string[];
  codingStats?: CodingStats;
  learningStats?: LearningStats;
  badges?: Badge[];
  recentActivity?: ActivityItem[];
  skillProgress?: SkillProgress[];
  enrolledCourses?: Array<{
    _id: string;
    courseId: {
      _id: string;
      title: string;
      description: string;
      thumbnail: string;
      instructor: string;
    };
    enrolledAt: string;
    isCompleted: boolean;
  }>;
  // Legacy stats field for backward compatibility
  stats?: {
    totalProblemsAvailable: number;
    totalProblemsSolved: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    practicePathsCompleted: number;
  };
}

interface ProfileContextType {
  profileData: ProfileData | null;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: Record<string, unknown>) => Promise<boolean>;
  updateAccount: (data: { username?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    // Prevent duplicate concurrent fetches
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.PROFILE}/me`);
      if (res.data.data) {
        setProfileData(res.data.data);
      }
    } catch {
      // Profile not found or not logged in — fail silently
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Globally fetch profile on mount if token exists
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, [fetchProfile]);

  const saveProfile = useCallback(async (data: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await axiosInstance.post(`${API_ENDPOINTS.PROFILE}/save`, data);
      if (res.data.data) {
        // Refetch the full profile to ensure all stats/badges are preserved and re-calculated
        await fetchProfile();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchProfile]);

  const updateAccount = useCallback(async (data: { username?: string; currentPassword?: string; newPassword?: string }) => {
    try {
      const res = await axiosInstance.put(`${API_ENDPOINTS.PROFILE}/account`, data);
      if (res.data.data) {
        await fetchProfile();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Failed to update account.' };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Failed to update account.' };
    }
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, fetchProfile, saveProfile, updateAccount, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};