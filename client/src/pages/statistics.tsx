import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StatisticsPage() {
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");
  
  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats'],
  });
  
  const { data: userDetails } = useQuery({
    queryKey: ['/api/user/details'],
  });
  
  const { data: profitSchedule } = useQuery({
    queryKey: ['/api/user/profit-schedule'],
  });
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/user/transactions', { filter: transactionFilter, timeRange }],
  });
  
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'ri-bank-card-line bg-indigo-100 text-indigo-500';
      case 'withdrawal':
        return 'ri-wallet-3-line bg-purple-100 text-purple-500';
      case 'profit':
        return 'ri-money-dollar-circle-line bg-green-100 text-green-500';
      case 'referral':
        return 'ri-user-add-line bg-blue-100 text-blue-500';
      default:
        return 'ri-file-list-line bg-gray-100 text-gray-500';
    }
  };
  
  const getAmountClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'text-success-600';
      case 'profit':
        return 'text-success-600';
      case 'referral':
        return 'text-success-600';
      case 'withdrawal':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getAmountPrefix = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'profit':
      case 'referral':
        return '+';
      case 'withdrawal':
        return '-';
      default:
        return '';
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Statistics</h1>
        <p className="text-gray-500">Detailed overview of your account activity</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-lg font-bold mb-4">Account Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Deposited</div>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.totalDeposited) : "Loading..."}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Profit</div>
            <div className="text-2xl font-bold text-success-600">{stats ? formatCurrency(stats.totalProfit) : "Loading..."}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Withdrawn</div>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.totalWithdrawn) : "Loading..."}</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Account Details</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="text-sm text-gray-500">Username:</div>
                  <div className="text-sm font-medium">{userDetails?.username}</div>
                  
                  <div className="text-sm text-gray-500">Full Name:</div>
                  <div className="text-sm font-medium">{userDetails?.fullName}</div>
                  
                  <div className="text-sm text-gray-500">EasyPaisa:</div>
                  <div className="text-sm font-medium">{userDetails?.easyPaisaNumber}</div>
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="text-sm text-gray-500">Registration:</div>
                  <div className="text-sm font-medium">{userDetails ? formatDate(userDetails.registeredAt) : "Loading..."}</div>
                  
                  <div className="text-sm text-gray-500">Reward Activation:</div>
                  <div className="text-sm font-medium">{userDetails?.rewardActivationDate ? formatDate(userDetails.rewardActivationDate) : "Not activated"}</div>
                  
                  <div className="text-sm text-gray-500">Next Payout:</div>
                  <div className="text-sm font-medium">{userDetails?.nextPayoutDate ? formatDate(userDetails.nextPayoutDate) : "Not available"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Weekly Profit Schedule</h3>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!profitSchedule || profitSchedule.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-sm text-gray-500">
                      No profit schedule available. Activate a reward program to see weekly profits.
                    </td>
                  </tr>
                ) : (
                  profitSchedule.map((week, index) => (
                    <tr key={index}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        Week {week.weekNumber}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(week.startDate)} - {formatDate(week.endDate)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-success-600">
                        {formatCurrency(week.profitAmount)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(week.status)}`}>
                          {week.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-4">Transaction History</h2>
        
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  transactionFilter === "all" 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTransactionFilter("all")}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  transactionFilter === "deposits" 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTransactionFilter("deposits")}
              >
                Deposits
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  transactionFilter === "withdrawals" 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTransactionFilter("withdrawals")}
              >
                Withdrawals
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  transactionFilter === "profits" 
                    ? "bg-primary-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTransactionFilter("profits")}
              >
                Profits
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">Show:</span>
              <select 
                className="bg-gray-100 border-0 rounded-md px-2 py-1 focus:outline-none"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 py-3 border-b border-gray-100">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!transactions || transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-sm text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getActivityIcon(transaction.type)}`}>
                            <i className={getActivityIcon(transaction.type).split(' ')[0]}></i>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                            <div className="text-xs text-gray-500">{transaction.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className={`text-sm ${getAmountClass(transaction.type)}`}>
                          {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
