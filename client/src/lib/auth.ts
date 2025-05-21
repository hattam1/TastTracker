import { apiRequest } from "./queryClient";

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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  address: string;
  city: string;
  mobileNumber: string;
  easyPaisaNumber: string;
  referralCode?: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/login", credentials);
  return await res.json();
}

export async function register(data: RegisterData): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/register", data);
  return await res.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        return null;
      }
      throw new Error(`Failed to get current user: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}