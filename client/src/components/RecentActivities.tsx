import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/auth-provider";
import { ArrowUpRight, ArrowDownRight, Repeat, Users } from "lucide-react";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function RecentActivities() {
  const { user } = useAuth();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/recent'],
    enabled: !!user,
  });
  
  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "referral":
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Repeat className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-processing";
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-card animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const transactionList: Transaction[] = transactions || [];
  
  if (transactionList.length === 0) {
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No activities yet.</p>
          <p className="text-sm mt-2">Your transactions will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-6">Recent Activities</h2>
      
      <div className="space-y-5">
        {transactionList.map((transaction) => (
          <div key={transaction.id} className="flex items-start">
            <div className="mt-1 mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              {getIcon(transaction.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </h3>
                <span className={transaction.type === "deposit" || transaction.type === "referral" ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                  {transaction.type === "withdrawal" ? "-" : "+"}{transaction.amount}
                </span>
              </div>
              
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.description}
                </p>
                <span className={`${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {transactionList.length > 0 && (
        <div className="mt-6 text-center">
          <a href="/statistics" className="text-primary hover:text-primary/90 text-sm font-medium">
            View all transactions
          </a>
        </div>
      )}
    </div>
  );
}