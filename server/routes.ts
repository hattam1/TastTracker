import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, isAuthenticated, isAdmin, hashPassword, verifyPassword, generateToken } from "./auth";
import { sendWithdrawalEmail } from "./email";
import path from "path";
import fs from "fs/promises";
import { mkdir } from "fs/promises";
import multer from "multer";
import {
  loginCredentialsSchema,
  registerUserSchema,
  withdrawalSchema,
  announcementSchema
} from "@shared/schema";
import { randomBytes } from "crypto";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const receiptDir = path.join(uploadDir, "receipts");
const youtubeDir = path.join(uploadDir, "youtube");

// Create upload directories if they don't exist
async function ensureDirsExist() {
  try {
    await mkdir(uploadDir, { recursive: true });
    await mkdir(receiptDir, { recursive: true });
    await mkdir(youtubeDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directories:", error);
  }
}

ensureDirsExist();

// Configure multer storage
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    const isYoutubeVerification = req.path.includes("youtube");
    cb(null, isYoutubeVerification ? youtubeDir : receiptDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage2,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(authenticateUser);

  // API routes
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Generate referral code
      const referralCode = randomBytes(4).toString("hex").toUpperCase();
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        referralCode,
        role: "user"
      });
      
      // Check if user was referred
      if (userData.referralCode) {
        const referrer = Array.from((await storage.getUsers()).values()).find(
          u => u.referralCode === userData.referralCode
        );
        
        if (referrer) {
          // Update user with referrer
          await storage.updateUser(user.id, { referredBy: referrer.id });
          
          // Create referral
          await storage.createReferral({
            referrerId: referrer.id,
            referredId: user.id,
            bonus: 100,
            status: "paid"
          });
          
          // Create transaction for referrer
          await storage.createTransaction({
            userId: referrer.id,
            type: "referral",
            amount: 100,
            description: `Referral bonus for ${user.username}`,
            status: "completed"
          });
        }
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Set token in a cookie
      req.session.token = token;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginCredentialsSchema.parse(req.body);
      
      // Get user by username
      const user = await storage.getUserByUsername(credentials.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const passwordValid = await verifyPassword(credentials.password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Set token in a cookie
      req.session.token = token;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // User routes
  app.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/user/details", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get active reward program
      const activeProgram = await storage.getActiveRewardProgramByUserId(req.user.id);
      
      // Calculate next payout date if program is active
      let nextPayoutDate = null;
      if (activeProgram) {
        const startDate = new Date(activeProgram.startDate);
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilNextPayout = 7 - (daysSinceStart % 7);
        
        nextPayoutDate = new Date(now);
        nextPayoutDate.setDate(now.getDate() + daysUntilNextPayout);
      }
      
      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        easyPaisaNumber: user.easyPaisaNumber,
        registeredAt: user.createdAt,
        rewardActivationDate: activeProgram?.startDate || null,
        nextPayoutDate
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Deposit routes
  app.post("/api/user/deposits", isAuthenticated, upload.single("receipt"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Receipt screenshot is required" });
      }
      
      const amount = parseFloat(req.body.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Create deposit
      const deposit = await storage.createDeposit({
        userId: req.user.id,
        amount,
        receiptPath: req.file.path,
        status: "pending"
      });
      
      // Create transaction
      await storage.createTransaction({
        userId: req.user.id,
        type: "deposit",
        amount,
        description: "Deposit pending approval",
        referenceId: deposit.id,
        status: "pending"
      });
      
      res.status(201).json(deposit);
    } catch (error) {
      console.error("Error creating deposit:", error);
      res.status(500).json({ message: "Failed to create deposit" });
    }
  });

  app.get("/api/user/deposits", isAuthenticated, async (req, res) => {
    try {
      const deposits = await storage.getDepositsByUserId(req.user.id);
      res.json(deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.get("/api/user/deposits/:id/receipt", isAuthenticated, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const deposit = await storage.getDeposit(depositId);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }
      
      // Ensure user owns the deposit or is admin
      if (deposit.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Stream receipt file
      res.sendFile(deposit.receiptPath);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  // Withdrawal routes
  app.post("/api/user/withdrawals", isAuthenticated, async (req, res) => {
    try {
      const data = withdrawalSchema.parse(req.body);
      
      // Check amount is valid
      if (data.amount < 400) {
        return res.status(400).json({ message: "Minimum withdrawal amount is PKR 400" });
      }
      
      // Check user has sufficient balance
      const stats = await storage.getUserStats(req.user.id);
      if (data.amount > stats.currentBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Calculate fee
      const fee = 100;
      
      // Create withdrawal
      const withdrawal = await storage.createWithdrawal({
        userId: req.user.id,
        amount: data.amount,
        fee,
        status: "pending"
      });
      
      // Create transaction
      await storage.createTransaction({
        userId: req.user.id,
        type: "withdrawal",
        amount: data.amount,
        description: "Withdrawal request",
        referenceId: withdrawal.id,
        status: "pending"
      });
      
      // Send email notification
      await sendWithdrawalEmail({
        fullName: req.user.fullName,
        address: req.user.address,
        mobileNumber: req.user.mobileNumber,
        easyPaisaNumber: req.user.easyPaisaNumber,
        amount: data.amount - fee
      });
      
      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal" });
    }
  });

  app.get("/api/user/withdrawals", isAuthenticated, async (req, res) => {
    try {
      const withdrawals = await storage.getWithdrawalsByUserId(req.user.id);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // YouTube verification routes
  app.post("/api/user/youtube-verification", isAuthenticated, upload.single("screenshot"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Screenshot is required" });
      }
      
      // Create verification
      const verification = await storage.createYouTubeVerification({
        userId: req.user.id,
        screenshotPath: req.file.path,
        status: "pending"
      });
      
      res.status(201).json(verification);
    } catch (error) {
      console.error("Error creating YouTube verification:", error);
      res.status(500).json({ message: "Failed to create YouTube verification" });
    }
  });

  app.get("/api/user/youtube-status", isAuthenticated, async (req, res) => {
    try {
      // Check if user is verified
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get latest verification
      const verifications = await storage.getYouTubeVerificationsByUserId(req.user.id);
      const latestVerification = verifications.length > 0 ? 
        verifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] : null;
      
      res.json({
        verified: user.youtubeVerified,
        status: latestVerification?.status || null,
        lastSubmission: latestVerification?.createdAt || null
      });
    } catch (error) {
      console.error("Error fetching YouTube status:", error);
      res.status(500).json({ message: "Failed to fetch YouTube status" });
    }
  });

  // Reward program routes
  app.get("/api/user/active-reward", isAuthenticated, async (req, res) => {
    try {
      const program = await storage.getActiveRewardProgramByUserId(req.user.id);
      
      if (!program) {
        return res.json(null);
      }
      
      const deposit = await storage.getDeposit(program.depositId);
      
      res.json({
        id: program.id,
        deposit: Number(program.depositAmount),
        weeklyProfit: Number(program.weeklyProfit),
        status: program.status,
        startDate: program.startDate
      });
    } catch (error) {
      console.error("Error fetching active reward program:", error);
      res.status(500).json({ message: "Failed to fetch active reward program" });
    }
  });

  app.post("/api/user/update-reward-plan", isAuthenticated, async (req, res) => {
    try {
      const { deposit } = req.body;
      
      if (!deposit || isNaN(deposit) || deposit <= 0) {
        return res.status(400).json({ message: "Valid deposit amount is required" });
      }
      
      // Calculate weekly profit based on deposit amount
      let weeklyProfit = 0;
      if (deposit >= 500000) weeklyProfit = 15000;
      else if (deposit >= 100000) weeklyProfit = 10000;
      else if (deposit >= 50000) weeklyProfit = 5000;
      else if (deposit >= 30000) weeklyProfit = 3000;
      else if (deposit >= 15000) weeklyProfit = 1500;
      else if (deposit >= 5000) weeklyProfit = 500;
      
      if (weeklyProfit === 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
      }
      
      // Create a new deposit
      const newDeposit = await storage.createDeposit({
        userId: req.user.id,
        amount: deposit,
        receiptPath: "pending_receipt",
        status: "pending"
      });
      
      res.json({
        message: "Reward plan update request submitted",
        requiredDeposit: deposit,
        weeklyProfit
      });
    } catch (error) {
      console.error("Error updating reward plan:", error);
      res.status(500).json({ message: "Failed to update reward plan" });
    }
  });

  // Referral routes
  app.get("/api/user/referrals", isAuthenticated, async (req, res) => {
    try {
      const referrals = await storage.getReferralsByReferrerId(req.user.id);
      
      const referralDetails = await Promise.all(referrals.map(async (referral) => {
        const referredUser = await storage.getUser(referral.referredId);
        return {
          id: referral.id,
          fullName: referredUser?.fullName || "Unknown User",
          email: referredUser?.mobileNumber || "Unknown",
          registeredAt: referredUser?.createdAt || new Date(),
          active: !!referredUser?.active,
          bonus: Number(referral.bonus),
          status: referral.status
        };
      }));
      
      res.json(referralDetails);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get("/api/user/referrals/stats", isAuthenticated, async (req, res) => {
    try {
      const referrals = await storage.getReferralsByReferrerId(req.user.id);
      
      // Calculate total referrals and earnings
      const totalReferrals = referrals.length;
      const totalEarnings = referrals.reduce((sum, ref) => sum + Number(ref.bonus), 0);
      
      // Calculate monthly stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const thisMonthReferrals = referrals.filter(ref => {
        const refDate = new Date(ref.createdAt);
        return refDate.getMonth() === thisMonth && refDate.getFullYear() === thisYear;
      });
      
      const monthlyReferrals = thisMonthReferrals.length;
      const monthlyEarnings = thisMonthReferrals.reduce((sum, ref) => sum + Number(ref.bonus), 0);
      
      res.json({
        totalReferrals,
        totalEarnings,
        monthlyReferrals,
        monthlyEarnings
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Activities and transactions
  app.get("/api/user/activities", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id, undefined, 10);
      
      const activities = transactions.map(transaction => ({
        id: transaction.id,
        title: getTransactionTitle(transaction.type),
        description: transaction.description,
        type: transaction.type,
        amount: Number(transaction.amount),
        date: transaction.createdAt,
        status: transaction.status
      }));
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/user/transactions", isAuthenticated, async (req, res) => {
    try {
      const { filter = 'all', timeRange = '30days' } = req.query;
      
      // Get all transactions for the user
      const transactions = await storage.getTransactionsByUserId(req.user.id, filter as string);
      
      // Filter by time range
      const filteredTransactions = filterTransactionsByTimeRange(transactions, timeRange as string);
      
      const formattedTransactions = filteredTransactions.map(transaction => ({
        id: transaction.id,
        title: getTransactionTitle(transaction.type),
        description: transaction.description,
        type: transaction.type,
        amount: Number(transaction.amount),
        date: transaction.createdAt,
        status: transaction.status
      }));
      
      res.json(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/user/profit-schedule", isAuthenticated, async (req, res) => {
    try {
      // Get active reward program
      const program = await storage.getActiveRewardProgramByUserId(req.user.id);
      
      if (!program) {
        return res.json([]);
      }
      
      // Get profits for this program
      const profits = await storage.getProfitsByRewardProgramId(program.id);
      
      // If no profits yet, generate a schedule
      if (profits.length === 0) {
        const schedule = generateProfitSchedule(program);
        res.json(schedule);
      } else {
        // Format existing profits
        const formattedProfits = profits.map((profit, index) => ({
          weekNumber: profit.weekNumber,
          startDate: profit.startDate,
          endDate: profit.endDate,
          profitAmount: Number(profit.amount),
          status: profit.status
        }));
        
        res.json(formattedProfits);
      }
    } catch (error) {
      console.error("Error fetching profit schedule:", error);
      res.status(500).json({ message: "Failed to fetch profit schedule" });
    }
  });

  // Announcements
  app.get("/api/announcements/current", async (req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      
      // Return the most recent announcement
      if (announcements.length > 0) {
        const sortedAnnouncements = announcements.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        res.json(sortedAnnouncements[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching current announcement:", error);
      res.status(500).json({ message: "Failed to fetch current announcement" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const users = await storage.getUsers(page, limit);
      const total = await storage.getUserCount();
      
      // Map users to include stats
      const usersWithStats = await Promise.all(users.map(async (user) => {
        const stats = await storage.getUserStats(user.id);
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...userWithoutPassword,
          ...stats
        };
      }));
      
      res.json({
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserStats(userId);
      const deposits = await storage.getDepositsByUserId(userId);
      const withdrawals = await storage.getWithdrawalsByUserId(userId);
      const rewardPrograms = await storage.getRewardProgramsByUserId(userId);
      const transactions = await storage.getTransactionsByUserId(userId);
      const youtubeVerifications = await storage.getYouTubeVerificationsByUserId(userId);
      
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        stats,
        deposits,
        withdrawals,
        rewardPrograms,
        transactions,
        youtubeVerifications
      });
    } catch (error) {
      console.error("Error fetching admin user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  app.post("/api/admin/users/:id/toggle-active", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Toggle active status
      const updatedUser = await storage.updateUser(userId, { active: !user.active });
      
      const { password, ...userWithoutPassword } = updatedUser!;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error toggling user active status:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/admin/deposits", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      
      let deposits = await storage.getAllDeposits(page, limit);
      
      // Filter by status if provided
      if (status && status !== 'all') {
        deposits = deposits.filter(deposit => deposit.status === status);
      }
      
      // Enrich with user details
      const depositsWithUserDetails = await Promise.all(deposits.map(async (deposit) => {
        const user = await storage.getUser(deposit.userId);
        return {
          ...deposit,
          username: user?.username,
          fullName: user?.fullName
        };
      }));
      
      res.json({
        deposits: depositsWithUserDetails,
        pagination: {
          page,
          limit,
          // This is not accurate when filtering but it's a simple implementation
          total: deposits.length,
          pages: Math.ceil(deposits.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admin deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  app.post("/api/admin/deposits/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const deposit = await storage.getDeposit(depositId);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }
      
      // Update deposit status
      const updatedDeposit = await storage.updateDeposit(depositId, { 
        status: "approved",
        adminNote: req.body.note || "Approved by admin",
        updatedAt: new Date()
      });
      
      // Update transaction status
      const transactions = Array.from((await storage.getTransactionsByUserId(deposit.userId)).values())
        .filter(t => t.referenceId === depositId && t.type === "deposit");
      
      if (transactions.length > 0) {
        await storage.updateTransaction(transactions[0].id, {
          status: "completed",
          description: "Deposit approved"
        });
      }
      
      // Calculate weekly profit
      let weeklyProfit = 0;
      const amount = Number(deposit.amount);
      
      if (amount >= 500000) weeklyProfit = 15000;
      else if (amount >= 100000) weeklyProfit = 10000;
      else if (amount >= 50000) weeklyProfit = 5000;
      else if (amount >= 30000) weeklyProfit = 3000;
      else if (amount >= 15000) weeklyProfit = 1500;
      else if (amount >= 5000) weeklyProfit = 500;
      
      // Check if user already has an active reward program
      const existingProgram = await storage.getActiveRewardProgramByUserId(deposit.userId);
      
      if (existingProgram) {
        // End existing program
        await storage.updateRewardProgram(existingProgram.id, {
          status: "ended",
          endDate: new Date()
        });
      }
      
      // Create new reward program
      const rewardProgram = await storage.createRewardProgram({
        userId: deposit.userId,
        depositId: depositId,
        depositAmount: deposit.amount,
        weeklyProfit,
        status: "active",
        startDate: new Date()
      });
      
      // Check if user is YouTube verified
      const user = await storage.getUser(deposit.userId);
      if (user && !user.youtubeVerified) {
        // Try to find a verified YouTube verification
        const verifications = await storage.getYouTubeVerificationsByUserId(deposit.userId);
        const approvedVerification = verifications.find(v => v.status === "approved");
        
        if (approvedVerification) {
          await storage.updateUser(deposit.userId, { youtubeVerified: true });
        }
      }
      
      res.json({
        deposit: updatedDeposit,
        rewardProgram
      });
    } catch (error) {
      console.error("Error approving deposit:", error);
      res.status(500).json({ message: "Failed to approve deposit" });
    }
  });

  app.post("/api/admin/deposits/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const deposit = await storage.getDeposit(depositId);
      
      if (!deposit) {
        return res.status(404).json({ message: "Deposit not found" });
      }
      
      // Update deposit status
      const updatedDeposit = await storage.updateDeposit(depositId, { 
        status: "rejected",
        adminNote: req.body.note || "Rejected by admin",
        updatedAt: new Date()
      });
      
      // Update transaction status
      const transactions = Array.from((await storage.getTransactionsByUserId(deposit.userId)).values())
        .filter(t => t.referenceId === depositId && t.type === "deposit");
      
      if (transactions.length > 0) {
        await storage.updateTransaction(transactions[0].id, {
          status: "rejected",
          description: "Deposit rejected: " + (req.body.note || "Rejected by admin")
        });
      }
      
      res.json(updatedDeposit);
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      res.status(500).json({ message: "Failed to reject deposit" });
    }
  });

  app.get("/api/admin/withdrawals", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      
      let withdrawals = await storage.getAllWithdrawals(page, limit);
      
      // Filter by status if provided
      if (status && status !== 'all') {
        withdrawals = withdrawals.filter(withdrawal => withdrawal.status === status);
      }
      
      // Enrich with user details
      const withdrawalsWithUserDetails = await Promise.all(withdrawals.map(async (withdrawal) => {
        const user = await storage.getUser(withdrawal.userId);
        return {
          ...withdrawal,
          username: user?.username,
          fullName: user?.fullName,
          easyPaisaNumber: user?.easyPaisaNumber
        };
      }));
      
      res.json({
        withdrawals: withdrawalsWithUserDetails,
        pagination: {
          page,
          limit,
          // This is not accurate when filtering but it's a simple implementation
          total: withdrawals.length,
          pages: Math.ceil(withdrawals.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/admin/withdrawals/:id/process", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, { 
        status: "processing",
        adminNote: req.body.note || "Processing by admin"
      });
      
      // Update transaction status
      const transactions = Array.from((await storage.getTransactionsByUserId(withdrawal.userId)).values())
        .filter(t => t.referenceId === withdrawalId && t.type === "withdrawal");
      
      if (transactions.length > 0) {
        await storage.updateTransaction(transactions[0].id, {
          status: "processing",
          description: "Withdrawal processing"
        });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  app.post("/api/admin/withdrawals/:id/complete", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, { 
        status: "completed",
        processedAt: new Date(),
        adminNote: req.body.note || "Completed by admin"
      });
      
      // Update transaction status
      const transactions = Array.from((await storage.getTransactionsByUserId(withdrawal.userId)).values())
        .filter(t => t.referenceId === withdrawalId && t.type === "withdrawal");
      
      if (transactions.length > 0) {
        await storage.updateTransaction(transactions[0].id, {
          status: "completed",
          description: "Withdrawal completed"
        });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error completing withdrawal:", error);
      res.status(500).json({ message: "Failed to complete withdrawal" });
    }
  });

  app.post("/api/admin/withdrawals/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, { 
        status: "rejected",
        adminNote: req.body.note || "Rejected by admin"
      });
      
      // Update transaction status
      const transactions = Array.from((await storage.getTransactionsByUserId(withdrawal.userId)).values())
        .filter(t => t.referenceId === withdrawalId && t.type === "withdrawal");
      
      if (transactions.length > 0) {
        await storage.updateTransaction(transactions[0].id, {
          status: "rejected",
          description: "Withdrawal rejected: " + (req.body.note || "Rejected by admin")
        });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      res.status(500).json({ message: "Failed to reject withdrawal" });
    }
  });

  app.get("/api/admin/youtube-verifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get all users with their latest YouTube verification
      const users = await storage.getUsers();
      
      const pendingVerifications = [];
      
      for (const user of users) {
        const verifications = await storage.getYouTubeVerificationsByUserId(user.id);
        
        if (verifications.length > 0) {
          // Get latest verification
          const latestVerification = verifications.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0];
          
          if (latestVerification.status === "pending") {
            pendingVerifications.push({
              verificationId: latestVerification.id,
              userId: user.id,
              username: user.username,
              fullName: user.fullName,
              createdAt: latestVerification.createdAt,
              screenshotPath: latestVerification.screenshotPath
            });
          }
        }
      }
      
      res.json(pendingVerifications);
    } catch (error) {
      console.error("Error fetching YouTube verifications:", error);
      res.status(500).json({ message: "Failed to fetch YouTube verifications" });
    }
  });

  app.get("/api/admin/youtube-verifications/:id/screenshot", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const verification = await storage.getYouTubeVerification(verificationId);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      // Stream screenshot file
      res.sendFile(verification.screenshotPath);
    } catch (error) {
      console.error("Error fetching verification screenshot:", error);
      res.status(500).json({ message: "Failed to fetch verification screenshot" });
    }
  });

  app.post("/api/admin/youtube-verifications/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const verification = await storage.getYouTubeVerification(verificationId);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      // Update verification status
      const updatedVerification = await storage.updateYouTubeVerification(verificationId, { 
        status: "approved",
        adminNote: req.body.note || "Approved by admin",
        updatedAt: new Date()
      });
      
      // Update user's YouTube verification status
      await storage.updateUser(verification.userId, { youtubeVerified: true });
      
      res.json(updatedVerification);
    } catch (error) {
      console.error("Error approving YouTube verification:", error);
      res.status(500).json({ message: "Failed to approve YouTube verification" });
    }
  });

  app.post("/api/admin/youtube-verifications/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const verification = await storage.getYouTubeVerification(verificationId);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      // Update verification status
      const updatedVerification = await storage.updateYouTubeVerification(verificationId, { 
        status: "rejected",
        adminNote: req.body.note || "Rejected by admin",
        updatedAt: new Date()
      });
      
      res.json(updatedVerification);
    } catch (error) {
      console.error("Error rejecting YouTube verification:", error);
      res.status(500).json({ message: "Failed to reject YouTube verification" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      
      // Sort by created date, newest first
      announcements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = announcementSchema.parse(req.body);
      
      // Create announcement
      const announcement = await storage.createAnnouncement({
        content: data.content,
        language: data.language,
        active: data.active,
        createdBy: req.user.id
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.post("/api/admin/announcements/:id/toggle-active", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      const announcement = await storage.getAnnouncement(announcementId);
      
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Toggle active status
      const updatedAnnouncement = await storage.updateAnnouncement(announcementId, { 
        active: !announcement.active 
      });
      
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error toggling announcement active status:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  // Stats for admin dashboard
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const totalUsers = users.length;
      
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let pendingDeposits = 0;
      let pendingWithdrawals = 0;
      let activeRewardPrograms = 0;
      
      // Calculate stats
      for (const user of users) {
        const deposits = await storage.getDepositsByUserId(user.id);
        const approvedDeposits = deposits.filter(d => d.status === 'approved');
        const pendingDepositsList = deposits.filter(d => d.status === 'pending');
        
        totalDeposits += approvedDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
        pendingDeposits += pendingDepositsList.length;
        
        const withdrawals = await storage.getWithdrawalsByUserId(user.id);
        const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
        const pendingWithdrawalsList = withdrawals.filter(w => w.status === 'pending');
        
        totalWithdrawals += completedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
        pendingWithdrawals += pendingWithdrawalsList.length;
        
        const activeProgram = await storage.getActiveRewardProgramByUserId(user.id);
        if (activeProgram) {
          activeRewardPrograms++;
        }
      }
      
      // Get pending YouTube verifications
      const pendingYoutubeVerifications = (await getAllPendingYoutubeVerifications()).length;
      
      res.json({
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        activeRewardPrograms,
        pendingYoutubeVerifications
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function getTransactionTitle(type: string): string {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'profit':
      return 'Weekly Profit';
    case 'referral':
      return 'Referral Bonus';
    default:
      return 'Transaction';
  }
}

function filterTransactionsByTimeRange(transactions: any[], timeRange: string): any[] {
  const now = new Date();
  
  switch (timeRange) {
    case '30days': {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return transactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
    }
    case '90days': {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return transactions.filter(t => new Date(t.createdAt) >= ninetyDaysAgo);
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return transactions.filter(t => new Date(t.createdAt) >= startOfYear);
    }
    case 'all':
    default:
      return transactions;
  }
}

function generateProfitSchedule(program: any): any[] {
  const schedule = [];
  const startDate = new Date(program.startDate);
  const weeklyProfit = Number(program.weeklyProfit);
  
  // Generate schedule for 12 weeks
  for (let i = 1; i <= 12; i++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (i - 1) * 7);
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    const now = new Date();
    let status = "pending";
    
    if (weekEndDate < now) {
      status = "paid";
    } else if (weekStartDate <= now && now <= weekEndDate) {
      status = "processing";
    }
    
    schedule.push({
      weekNumber: i,
      startDate: weekStartDate,
      endDate: weekEndDate,
      profitAmount: weeklyProfit,
      status
    });
  }
  
  return schedule;
}

async function getAllPendingYoutubeVerifications(): Promise<any[]> {
  const users = await storage.getUsers();
  const pendingVerifications = [];
  
  for (const user of users) {
    const verifications = await storage.getYouTubeVerificationsByUserId(user.id);
    
    if (verifications.length > 0) {
      const latestVerification = verifications.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      
      if (latestVerification.status === "pending") {
        pendingVerifications.push({
          ...latestVerification,
          username: user.username,
          fullName: user.fullName
        });
      }
    }
  }
  
  return pendingVerifications;
}
