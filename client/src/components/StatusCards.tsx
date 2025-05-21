import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/auth-provider";
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  ArrowDownRight,
  Users
} from "lucide-react";

interface UserStats {
  totalDeposited: number;
  currentBalance: number;
  totalProfit: number;
  totalWithdrawn: number;
  referralBonus: number;
  referralCount: number;
}

export default function StatusCards() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });
  
  const userData: UserStats = stats || {
    totalDeposited: 0,
    currentBalance: 0,
    totalProfit: 0,
    totalWithdrawn: 0,
    referralBonus: 0,
    referralCount: 0
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Account Balance",
      value: userData.currentBalance,
      icon: <Wallet className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-800/30",
      format: "currency",
    },
    {
      title: "Total Deposits",
      value: userData.totalDeposited,
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-500 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-800/30",
      format: "currency",
    },
    {
      title: "Total Profit",
      value: userData.totalProfit,
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
      format: "currency",
    },
    {
      title: "Total Withdrawn",
      value: userData.totalWithdrawn,
      icon: <ArrowDownRight className="h-5 w-5 text-purple-500" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-800/30",
      format: "currency",
    },
    {
      title: "Referral Bonus",
      value: userData.referralBonus,
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-800/30",
      format: "currency",
    },
    {
      title: "Total Referrals",
      value: userData.referralCount,
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-800/30",
      format: "number",
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === "currency") {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`rounded-lg p-5 ${card.bgColor} border border-${card.textColor.split('-')[1]}-200 dark:border-${card.textColor.split('-')[1]}-900`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${card.iconBg} mr-4`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
              <h3 className={`text-lg font-semibold ${card.textColor}`}>
                {formatValue(card.value, card.format)}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}