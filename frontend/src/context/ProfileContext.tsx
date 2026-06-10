import React, { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axios.instance";
import { API_ENDPOINTS } from "../constants/api.constants";

interface ProfileData {
  _id?: string;
  userId?: string;
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
  avatar?: string;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: Record<string, unknown>) => Promise<boolean>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
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
    }
  };

  const saveProfile = async (data: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await axiosInstance.post(`${API_ENDPOINTS.PROFILE}/save`, data);
      if (res.data.data) {
        setProfileData(res.data.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, fetchProfile, saveProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};