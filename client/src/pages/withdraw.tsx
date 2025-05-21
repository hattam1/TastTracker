import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MINIMUM_WITHDRAWAL, WITHDRAWAL_FEE } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

export default function WithdrawPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState(5000);
  
  const { data: balanceData } = useQuery({
    queryKey: ['/api/user/stats'],
  });
  
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['/api/user/withdrawals'],
  });
  
  const { mutate: requestWithdrawal, isPending } = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const res = await apiRequest("POST", "/api/user/withdrawals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal will be processed within 24-48 hours",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit withdrawal request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < MINIMUM_WITHDRAWAL) {
      toast({
        title: "Invalid amount",
        description: `Minimum withdrawal amount is ${formatCurrency(MINIMUM_WITHDRAWAL)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (balanceData && amount > balanceData.currentBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    requestWithdrawal({ amount });
  };
  
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
  
  const amountAfterFee = amount - WITHDRAWAL_FEE;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Withdraw Funds</h1>
        <p className="text-gray-500">Request a withdrawal to your EasyPaisa account</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold mb-4">Account Balance</h2>
            
            <div className="bg-gray-50 rounded-xl p-5 mb-4">
              <div className="text-gray-500 text-sm mb-1">Available Balance</div>
              <div className="text-3xl font-bold mb-3">
                {balanceData ? formatCurrency(balanceData.currentBalance) : "Loading..."}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-gray-500 text-xs">Minimum Withdrawal</div>
                  <div className="text-sm font-medium">{formatCurrency(MINIMUM_WITHDRAWAL)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Fee</div>
                  <div className="text-sm font-medium">{formatCurrency(WITHDRAWAL_FEE)} per transaction</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-information-line text-yellow-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    منی ودڈرا کی کم از کم رقم 400 روپے ہے۔ ریوارڈ پروگرام میں شامل ہوں، رقم جمع کریں اور ہفتہ وار منافع حاصل کریں۔
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Withdrawal Request</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (PKR)
                </label>
                <input 
                  type="number" 
                  min={MINIMUM_WITHDRAWAL} 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You will receive: {formatCurrency(amountAfterFee)} (after fee)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EasyPaisa Account Number
                </label>
                <input 
                  type="text" 
                  value={user?.easyPaisaNumber || ''} 
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input 
                  type="text" 
                  value={user?.fullName || ''} 
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition"
                  disabled={isPending || !balanceData || amount > balanceData.currentBalance}
                >
                  {isPending ? "Processing..." : "Request Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-4">Withdrawal History</h2>
        
        {isLoading ? (
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 py-3">
                <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-sm text-gray-500">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals?.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(withdrawal.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: {formatCurrency(WITHDRAWAL_FEE)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(withdrawal.createdAt)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {withdrawal.processedAt ? formatDate(withdrawal.processedAt) : "-"}
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
