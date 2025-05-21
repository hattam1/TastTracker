import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  fetchAnnouncements: async () => {}
};

const AnnouncementContext = createContext<AnnouncementContextType>(defaultContext);

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiRequest("GET", "/api/announcements/current");
      const data = await res.json();
      setCurrentAnnouncement(data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <AnnouncementContext.Provider value={{ currentAnnouncement, fetchAnnouncements }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  return useContext(AnnouncementContext);
}