import {
  User, InsertUser,
  Deposit, InsertDeposit,
  Withdrawal, InsertWithdrawal,
  YouTubeVerification, InsertYouTubeVerification,
  RewardProgram, InsertRewardProgram,
  Profit, InsertProfit,
  Transaction, InsertTransaction,
  Referral, InsertReferral,
  Announcement, InsertAnnouncement
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getUsers(page?: number, limit?: number): Promise<User[]>;
  getUserCount(): Promise<number>;
  
  // Deposit operations
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  getDepositsByUserId(userId: number): Promise<Deposit[]>;
  updateDeposit(id: number, data: Partial<Deposit>): Promise<Deposit | undefined>;
  getAllDeposits(page?: number, limit?: number): Promise<Deposit[]>;
  
  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]>;
  updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined>;
  getAllWithdrawals(page?: number, limit?: number): Promise<Withdrawal[]>;
  
  // YouTube verification operations
  createYouTubeVerification(verification: InsertYouTubeVerification): Promise<YouTubeVerification>;
  getYouTubeVerification(id: number): Promise<YouTubeVerification | undefined>;
  getYouTubeVerificationsByUserId(userId: number): Promise<YouTubeVerification[]>;
  updateYouTubeVerification(id: number, data: Partial<YouTubeVerification>): Promise<YouTubeVerification | undefined>;
  
  // Reward program operations
  createRewardProgram(program: InsertRewardProgram): Promise<RewardProgram>;
  getRewardProgram(id: number): Promise<RewardProgram | undefined>;
  getActiveRewardProgramByUserId(userId: number): Promise<RewardProgram | undefined>;
  getRewardProgramsByUserId(userId: number): Promise<RewardProgram[]>;
  updateRewardProgram(id: number, data: Partial<RewardProgram>): Promise<RewardProgram | undefined>;
  
  // Profit operations
  createProfit(profit: InsertProfit): Promise<Profit>;
  getProfit(id: number): Promise<Profit | undefined>;
  getProfitsByUserId(userId: number): Promise<Profit[]>;
  getProfitsByRewardProgramId(programId: number): Promise<Profit[]>;
  updateProfit(id: number, data: Partial<Profit>): Promise<Profit | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number, type?: string, limit?: number): Promise<Transaction[]>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferral(id: number): Promise<Referral | undefined>;
  getReferralsByReferrerId(referrerId: number): Promise<Referral[]>;
  updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined>;
  
  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement | undefined>;
  getAllAnnouncements(): Promise<Announcement[]>;
  
  // Statistics
  getUserStats(userId: number): Promise<{
    totalDeposited: number;
    currentBalance: number;
    totalProfit: number;
    totalWithdrawn: number;
    referralBonus: number;
    referralCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deposits: Map<number, Deposit>;
  private withdrawals: Map<number, Withdrawal>;
  private youtubeVerifications: Map<number, YouTubeVerification>;
  private rewardPrograms: Map<number, RewardProgram>;
  private profits: Map<number, Profit>;
  private transactions: Map<number, Transaction>;
  private referrals: Map<number, Referral>;
  private announcements: Map<number, Announcement>;
  
  private currentIds: {
    users: number;
    deposits: number;
    withdrawals: number;
    youtubeVerifications: number;
    rewardPrograms: number;
    profits: number;
    transactions: number;
    referrals: number;
    announcements: number;
  };

  constructor() {
    this.users = new Map();
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.youtubeVerifications = new Map();
    this.rewardPrograms = new Map();
    this.profits = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    this.announcements = new Map();
    
    this.currentIds = {
      users: 1,
      deposits: 1,
      withdrawals: 1,
      youtubeVerifications: 1,
      rewardPrograms: 1,
      profits: 1,
      transactions: 1,
      referrals: 1,
      announcements: 1
    };
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$2aUB5xFYYiQFOYMFTbryleQR5uIIYAJYz.dF2Sv6QQW8EHgdQTgEW", // "admin123"
      fullName: "Admin User",
      address: "Admin Address",
      city: "Admin City",
      mobileNumber: "03000000000",
      easyPaisaNumber: "03000000000",
      role: "admin",
      referralCode: "ADMIN"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...userData, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(page = 1, limit = 10): Promise<User[]> {
    const users = Array.from(this.users.values());
    const startIndex = (page - 1) * limit;
    return users.slice(startIndex, startIndex + limit);
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }
  
  // Deposit operations
  async createDeposit(depositData: InsertDeposit): Promise<Deposit> {
    const id = this.currentIds.deposits++;
    const deposit: Deposit = { 
      ...depositData, 
      id, 
      createdAt: new Date() 
    };
    this.deposits.set(id, deposit);
    return deposit;
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async getDepositsByUserId(userId: number): Promise<Deposit[]> {
    return Array.from(this.deposits.values()).filter(
      (deposit) => deposit.userId === userId
    );
  }

  async updateDeposit(id: number, data: Partial<Deposit>): Promise<Deposit | undefined> {
    const deposit = await this.getDeposit(id);
    if (!deposit) return undefined;
    
    const updatedDeposit = { ...deposit, ...data, updatedAt: new Date() };
    this.deposits.set(id, updatedDeposit);
    return updatedDeposit;
  }

  async getAllDeposits(page = 1, limit = 10): Promise<Deposit[]> {
    const deposits = Array.from(this.deposits.values());
    const startIndex = (page - 1) * limit;
    return deposits.slice(startIndex, startIndex + limit);
  }
  
  // Withdrawal operations
  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.currentIds.withdrawals++;
    const withdrawal: Withdrawal = { 
      ...withdrawalData, 
      id, 
      createdAt: new Date() 
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values()).filter(
      (withdrawal) => withdrawal.userId === userId
    );
  }

  async updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) return undefined;
    
    const updatedWithdrawal = { ...withdrawal, ...data };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  async getAllWithdrawals(page = 1, limit = 10): Promise<Withdrawal[]> {
    const withdrawals = Array.from(this.withdrawals.values());
    const startIndex = (page - 1) * limit;
    return withdrawals.slice(startIndex, startIndex + limit);
  }
  
  // YouTube verification operations
  async createYouTubeVerification(verificationData: InsertYouTubeVerification): Promise<YouTubeVerification> {
    const id = this.currentIds.youtubeVerifications++;
    const verification: YouTubeVerification = { 
      ...verificationData, 
      id, 
      createdAt: new Date() 
    };
    this.youtubeVerifications.set(id, verification);
    return verification;
  }

  async getYouTubeVerification(id: number): Promise<YouTubeVerification | undefined> {
    return this.youtubeVerifications.get(id);
  }

  async getYouTubeVerificationsByUserId(userId: number): Promise<YouTubeVerification[]> {
    return Array.from(this.youtubeVerifications.values()).filter(
      (verification) => verification.userId === userId
    );
  }

  async updateYouTubeVerification(id: number, data: Partial<YouTubeVerification>): Promise<YouTubeVerification | undefined> {
    const verification = await this.getYouTubeVerification(id);
    if (!verification) return undefined;
    
    const updatedVerification = { ...verification, ...data, updatedAt: new Date() };
    this.youtubeVerifications.set(id, updatedVerification);
    return updatedVerification;
  }
  
  // Reward program operations
  async createRewardProgram(programData: InsertRewardProgram): Promise<RewardProgram> {
    const id = this.currentIds.rewardPrograms++;
    const program: RewardProgram = { 
      ...programData, 
      id, 
      createdAt: new Date() 
    };
    this.rewardPrograms.set(id, program);
    return program;
  }

  async getRewardProgram(id: number): Promise<RewardProgram | undefined> {
    return this.rewardPrograms.get(id);
  }

  async getActiveRewardProgramByUserId(userId: number): Promise<RewardProgram | undefined> {
    return Array.from(this.rewardPrograms.values()).find(
      (program) => program.userId === userId && program.status === 'active'
    );
  }

  async getRewardProgramsByUserId(userId: number): Promise<RewardProgram[]> {
    return Array.from(this.rewardPrograms.values()).filter(
      (program) => program.userId === userId
    );
  }

  async updateRewardProgram(id: number, data: Partial<RewardProgram>): Promise<RewardProgram | undefined> {
    const program = await this.getRewardProgram(id);
    if (!program) return undefined;
    
    const updatedProgram = { ...program, ...data };
    this.rewardPrograms.set(id, updatedProgram);
    return updatedProgram;
  }
  
  // Profit operations
  async createProfit(profitData: InsertProfit): Promise<Profit> {
    const id = this.currentIds.profits++;
    const profit: Profit = { 
      ...profitData, 
      id, 
      createdAt: new Date() 
    };
    this.profits.set(id, profit);
    return profit;
  }

  async getProfit(id: number): Promise<Profit | undefined> {
    return this.profits.get(id);
  }

  async getProfitsByUserId(userId: number): Promise<Profit[]> {
    return Array.from(this.profits.values()).filter(
      (profit) => profit.userId === userId
    );
  }

  async getProfitsByRewardProgramId(programId: number): Promise<Profit[]> {
    return Array.from(this.profits.values()).filter(
      (profit) => profit.rewardProgramId === programId
    );
  }

  async updateProfit(id: number, data: Partial<Profit>): Promise<Profit | undefined> {
    const profit = await this.getProfit(id);
    if (!profit) return undefined;
    
    const updatedProfit = { ...profit, ...data };
    this.profits.set(id, updatedProfit);
    return updatedProfit;
  }
  
  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const transaction: Transaction = { 
      ...transactionData, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number, type?: string, limit?: number): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
    
    if (type && type !== 'all') {
      transactions = transactions.filter(transaction => transaction.type === type);
    }
    
    // Sort by created date, newest first
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      transactions = transactions.slice(0, limit);
    }
    
    return transactions;
  }
  
  // Referral operations
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const id = this.currentIds.referrals++;
    const referral: Referral = { 
      ...referralData, 
      id, 
      createdAt: new Date() 
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }

  async getReferralsByReferrerId(referrerId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === referrerId
    );
  }

  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined> {
    const referral = await this.getReferral(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, ...data };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  // Announcement operations
  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentIds.announcements++;
    const announcement: Announcement = { 
      ...announcementData, 
      id, 
      createdAt: new Date() 
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).filter(
      (announcement) => announcement.active
    );
  }

  async updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = await this.getAnnouncement(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement = { ...announcement, ...data };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }
  
  // Statistics
  async getUserStats(userId: number): Promise<{
    totalDeposited: number;
    currentBalance: number;
    totalProfit: number;
    totalWithdrawn: number;
    referralBonus: number;
    referralCount: number;
  }> {
    // Calculate total deposited
    const deposits = await this.getDepositsByUserId(userId);
    const approvedDeposits = deposits.filter(d => d.status === 'approved');
    const totalDeposited = approvedDeposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);
    
    // Calculate total profits
    const profits = await this.getProfitsByUserId(userId);
    const paidProfits = profits.filter(p => p.status === 'paid');
    const totalProfit = paidProfits.reduce((sum, profit) => sum + Number(profit.amount), 0);
    
    // Calculate total withdrawn
    const withdrawals = await this.getWithdrawalsByUserId(userId);
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
    const totalWithdrawn = completedWithdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
    
    // Calculate referral bonuses
    const referrals = await this.getReferralsByReferrerId(userId);
    const paidReferrals = referrals.filter(r => r.status === 'paid');
    const referralBonus = paidReferrals.reduce((sum, referral) => sum + Number(referral.bonus), 0);
    
    // Current balance = deposits + profits + referrals - withdrawals
    const currentBalance = totalDeposited + totalProfit + referralBonus - totalWithdrawn;
    
    return {
      totalDeposited,
      currentBalance,
      totalProfit,
      totalWithdrawn,
      referralBonus,
      referralCount: referrals.length
    };
  }
}

export const storage = new MemStorage();
