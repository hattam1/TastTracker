import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateProfitPercentage(amount: number): number {
  // Based on reward tiers
  if (amount >= 500000) return 15;
  if (amount >= 100000) return 10;
  if (amount >= 50000) return 10;
  if (amount >= 30000) return 10;
  if (amount >= 15000) return 10;
  if (amount >= 5000) return 10;
  return 0;
}

export function calculateWeeklyProfit(amount: number): number {
  if (amount >= 500000) return 15000;
  if (amount >= 100000) return 10000;
  if (amount >= 50000) return 5000;
  if (amount >= 30000) return 3000;
  if (amount >= 15000) return 1500;
  if (amount >= 5000) return 500;
  return 0;
}

export function generateReferralLink(username: string): string {
  const host = window.location.origin;
  return `${host}/register?ref=${username}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy: ", err);
    return false;
  }
}

export function getDaysUntilNextWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate days since start
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate days until next 7-day period
  const daysUntilNext = 7 - (daysSinceStart % 7);
  
  return daysUntilNext;
}

export function getInitials(name: string): string {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
