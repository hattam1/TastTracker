export const REWARD_TIERS = [
  { deposit: 5000, profit: 500 },
  { deposit: 15000, profit: 1500 },
  { deposit: 30000, profit: 3000 },
  { deposit: 50000, profit: 5000 },
  { deposit: 100000, profit: 10000 },
  { deposit: 500000, profit: 15000 }
];

export const MINIMUM_WITHDRAWAL = 400;
export const WITHDRAWAL_FEE = 100;
export const REFERRAL_BONUS = 100;
export const YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch?v=rKpltaOMFdc";
export const ADMIN_EMAIL = "info.yourmobileplanet@gmail.com";

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin"
};

export const DEPOSIT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  REJECTED: "rejected"
};

export const PAGES = {
  DASHBOARD: "/",
  DEPOSIT: "/deposit",
  WITHDRAW: "/withdraw",
  YOUTUBE: "/youtube",
  REFERRALS: "/referrals",
  STATISTICS: "/statistics",
  LOGIN: "/login",
  REGISTER: "/register"
};

export const ADMIN_PAGES = {
  DASHBOARD: "/admin",
  USERS: "/admin/users",
  DEPOSITS: "/admin/deposits",
  WITHDRAWALS: "/admin/withdrawals",
  ANNOUNCEMENTS: "/admin/announcements"
};
