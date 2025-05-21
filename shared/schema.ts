import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("fullName").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  mobileNumber: text("mobileNumber").notNull(),
  easyPaisaNumber: text("easyPaisaNumber").notNull(),
  role: text("role").notNull().default("user"),
  youtubeVerified: boolean("youtubeVerified").notNull().default(false),
  referralCode: text("referralCode").notNull().unique(),
  referredBy: integer("referredBy").references(() => users.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  active: boolean("active").notNull().default(true)
});

// Deposits
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  receiptPath: text("receiptPath").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
});

// Withdrawals
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  processedAt: timestamp("processedAt"),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").notNull().defaultNow()
});

// YouTube Verifications
export const youtubeVerifications = pgTable("youtubeVerifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  screenshotPath: text("screenshotPath").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
});

// Reward Programs
export const rewardPrograms = pgTable("rewardPrograms", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  depositId: integer("depositId").notNull().references(() => deposits.id),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).notNull(),
  weeklyProfit: decimal("weeklyProfit", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("startDate").notNull().defaultNow(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow()
});

// Profits
export const profits = pgTable("profits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  rewardProgramId: integer("rewardProgramId").notNull().references(() => rewardPrograms.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  weekNumber: integer("weekNumber").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow()
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: integer("referenceId"),
  status: text("status").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow()
});

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrerId").notNull().references(() => users.id),
  referredId: integer("referredId").notNull().references(() => users.id).unique(),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  paidAt: timestamp("paidAt")
});

// Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  language: text("language").notNull().default("en"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  createdBy: integer("createdBy").references(() => users.id)
});

// Schema validation types
export const registerUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  fullName: z.string().min(3).max(100),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  mobileNumber: z.string().min(10).max(15),
  easyPaisaNumber: z.string().min(10).max(15),
  referralCode: z.string().optional()
});

export const loginCredentialsSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const depositSchema = z.object({
  amount: z.number().positive(),
  receiptPath: z.string()
});

export const withdrawalSchema = z.object({
  amount: z.number().positive()
});

export const youtubeVerificationSchema = z.object({
  screenshotPath: z.string()
});

export const announcementSchema = z.object({
  content: z.string().min(5),
  language: z.string().default("en"),
  active: z.boolean().default(true)
});

// Export insert and select types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;
export type YouTubeVerification = typeof youtubeVerifications.$inferSelect;
export type InsertYouTubeVerification = typeof youtubeVerifications.$inferInsert;
export type RewardProgram = typeof rewardPrograms.$inferSelect;
export type InsertRewardProgram = typeof rewardPrograms.$inferInsert;
export type Profit = typeof profits.$inferSelect;
export type InsertProfit = typeof profits.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// Export validation schema types
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type DepositData = z.infer<typeof depositSchema>;
export type WithdrawalData = z.infer<typeof withdrawalSchema>;
export type YouTubeVerificationData = z.infer<typeof youtubeVerificationSchema>;
export type AnnouncementData = z.infer<typeof announcementSchema>;
