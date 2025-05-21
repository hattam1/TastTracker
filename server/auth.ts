import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@shared/schema";

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "tdx_secret_key_change_in_production";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Express middleware to authenticate user
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if token exists in session
    const token = req.session?.token;
    
    if (!token) {
      return next();
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next();
    }
    
    // Get user
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return next();
    }
    
    // Check if user is active
    if (!user.active) {
      return next();
    }
    
    // Set user on request
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    next();
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: Please login" });
  }
  
  next();
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}
