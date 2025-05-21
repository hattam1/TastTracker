import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/auth-provider";
import { ArrowRight, Check } from "lucide-react";

interface ProgramTier {
  id: number;
  name: string;
  minDeposit: number;
  weeklyProfit: number;
  duration: number;
  features: string[];
}

export default function RewardProgramSection() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  const tiers: ProgramTier[] = [
    {
      id: 1,
      name: "Basic",
      minDeposit: 50,
      weeklyProfit: 5,
      duration: 8,
      features: [
        "Weekly profit payments",
        "24/7 Support",
        "Referral benefits"
      ]
    },
    {
      id: 2,
      name: "Standard",
      minDeposit: 200,
      weeklyProfit: 25,
      duration: 8,
      features: [
        "Weekly profit payments",
        "24/7 Priority Support",
        "Enhanced referral benefits",
        "Early withdrawal option"
      ]
    },
    {
      id: 3,
      name: "Premium",
      minDeposit: 500,
      weeklyProfit: 70,
      duration: 8,
      features: [
        "Weekly profit payments",
        "24/7 VIP Support",
        "Maximum referral benefits",
        "Flexible withdrawal",
        "Bonus on renewal"
      ]
    }
  ];

  const { data: activeProgram, isLoading: isProgramLoading } = useQuery({
    queryKey: ['/api/rewards/active'],
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest("POST", "/api/rewards/enroll", { tierId });
      return response.json();
    },
    onSuccess: () => {
      // Reset selection and refetch active program
      setSelectedTier(null);
    }
  });

  if (isProgramLoading) {
    return (
      <div className="dashboard-card animate-pulse h-64">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (activeProgram) {
    const tier = tiers.find(t => t.id === activeProgram.tierId) || tiers[0];
    const remainingWeeks = Math.max(0, Math.ceil((new Date(activeProgram.endDate).getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)));
    
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Active Investment Program</h2>
        <div className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-400">{tier.name} Plan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Investment Amount: <span className="font-semibold">${activeProgram.depositAmount}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Weekly Profit: <span className="font-semibold text-green-600 dark:text-green-400">${activeProgram.weeklyProfit}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className="status-approved">Active</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start Date: <span className="font-semibold">{new Date(activeProgram.startDate).toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remaining: <span className="font-semibold">{remainingWeeks} weeks</span>
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-base font-medium mb-2">Profit Schedule</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-2">Week</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: tier.duration }).map((_, i) => {
                const weekDate = new Date(activeProgram.startDate);
                weekDate.setDate(weekDate.getDate() + (i * 7));
                const isPaid = weekDate < new Date();
                
                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2">Week {i + 1}</td>
                    <td className="px-4 py-2">{weekDate.toLocaleDateString()}</td>
                    <td className="px-4 py-2">${activeProgram.weeklyProfit}</td>
                    <td className="px-4 py-2">
                      <span className={isPaid ? "status-completed" : "status-pending"}>
                        {isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">Investment Programs</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose an investment tier to start earning weekly profits.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
              selectedTier === tier.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setSelectedTier(tier.id)}
          >
            <h3 className="font-medium text-lg mb-2">{tier.name}</h3>
            <p className="text-2xl font-bold text-primary mb-1">${tier.minDeposit}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Minimum investment</p>
            
            <p className="text-sm mb-1">
              <span className="font-medium">${tier.weeklyProfit}</span> weekly profit
            </p>
            <p className="text-sm mb-4">
              <span className="font-medium">{tier.duration}</span> week duration
            </p>
            
            <ul className="space-y-2">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => selectedTier && enrollMutation.mutate(selectedTier)}
          disabled={!selectedTier || enrollMutation.isPending}
          className={`flex items-center px-4 py-2 rounded-md ${
            !selectedTier ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {enrollMutation.isPending ? 'Processing...' : 'Start Earning'}
          {!enrollMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}