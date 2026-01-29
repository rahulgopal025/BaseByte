import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const ProfileContext = createContext<any>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${email}`);
      if (res.data.profile) {
        setProfileData(res.data.profile);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (data: any) => {
    try {
      const res = await axios.post("http://localhost:5000/api/profile/save", data);
      if (res.data.success) {
        setProfileData(res.data.profile);
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData, fetchProfile, saveProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);