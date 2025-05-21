import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { apiRequest } from "../lib/queryClient";

interface Announcement {
  id: number;
  content: string;
  language: string;
  createdAt: string;
}

interface AnnouncementContextType {
  currentAnnouncement: Announcement | null;
  fetchAnnouncements: () => Promise<void>;
}

const defaultContext: AnnouncementContextType = {
  currentAnnouncement: null,
  fetchAnnouncements: async () => {},
};

const AnnouncementContext = createContext<AnnouncementContextType>(defaultContext);

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const response = await apiRequest("GET", "/api/announcements/active");
      
      if (response.ok) {
        const announcements = await response.json();
        if (announcements && announcements.length > 0) {
          // Get first active announcement or null
          setCurrentAnnouncement(announcements[0]);
        } else {
          setCurrentAnnouncement(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    
    // Poll for announcements every 5 minutes
    const intervalId = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const value = {
    currentAnnouncement,
    fetchAnnouncements,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  return useContext(AnnouncementContext);
}