import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { apiRequest } from "../lib/queryClient";

export interface User {
  id: number;
  username: string;
  fullName: string;
  address: string;
  city: string;
  mobileNumber: string;
  easyPaisaNumber: string;
  role: string;
  youtubeVerified: boolean;
  referralCode: string;
  referredBy: number | null;
  createdAt: Date;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  setUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}