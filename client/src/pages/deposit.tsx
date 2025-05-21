import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/auth-provider";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Upload, Info, ArrowRight, CheckCircle } from "lucide-react";

export default function DepositPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  
  const { data: deposits, isLoading: isLoadingDeposits } = useQuery({
    queryKey: ['/api/deposits/user'],
    enabled: !!user,
  });
  
  const depositMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/deposits/create", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit deposit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setAmount("");
      setSelectedFile(null);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ['/api/deposits/user'] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !amount) return;
    
    const formData = new FormData();
    formData.append("receipt", selectedFile);
    formData.append("amount", amount);
    
    depositMutation.mutate(formData);
  };

  if (isLoadingDeposits) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse"></div>
        <div className="grid gap-8 animate-pulse">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Deposit Funds</h1>
      
      <div className="dashboard-card mb-8">
        <div className="mb-6">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div style={{ width: `${(step/3)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
            </div>
            <div className="flex justify-between">
              <div className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${step >= 1 ? 'text-white bg-primary' : 'text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}>
                1
              </div>
              <div className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${step >= 2 ? 'text-white bg-primary' : 'text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}>
                2
              </div>
              <div className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${step >= 3 ? 'text-white bg-primary' : 'text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}>
                3
              </div>
            </div>
          </div>
        </div>
        
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Step 1: Enter Deposit Amount</h2>
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Minimum deposit amount is $10
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => amount && parseFloat(amount) >= 10 && setStep(2)}
                disabled={!amount || parseFloat(amount) < 10}
                className={`flex items-center px-4 py-2 rounded-md ${
                  !amount || parseFloat(amount) < 10 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Step 2: Upload Payment Receipt</h2>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Payment Instructions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Please send ${amount} to the following account and upload the payment receipt:
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-sm">
                <p><span className="font-medium">Account Name:</span> TDX Investment Ltd</p>
                <p><span className="font-medium">Account Number:</span> 12345-67890</p>
                <p><span className="font-medium">Bank:</span> EasyPaisa / JazzCash</p>
                <p><span className="font-medium">Reference:</span> {user?.username || "Your Username"}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center mb-6 hover:border-primary hover:dark:border-primary transition-colors">
                <div className="mb-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full inline-block">
                    <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <h3 className="font-medium mb-2">Upload Payment Receipt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Please upload a screenshot or photo of your payment receipt.
                  Supported formats: JPG, PNG, PDF
                </p>
                
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    id="receipt"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="receipt"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-4"
                  >
                    Select File
                  </label>
                  
                  {selectedFile && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={!selectedFile || depositMutation.isPending}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    !selectedFile || depositMutation.isPending
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {depositMutation.isPending ? "Processing..." : "Submit Deposit"}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {step === 3 && (
          <div className="text-center py-8">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full inline-block mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Deposit Submitted Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your deposit of ${amount} has been submitted and is pending approval.
              You will be notified once it's approved.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setStep(1)}
                className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Make Another Deposit
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Recent Deposits</h2>
        
        {(!deposits || deposits.length === 0) ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No deposits yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {deposits.map((deposit: any) => (
                  <tr key={deposit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${deposit.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={
                        deposit.status === "approved" ? "status-approved" :
                        deposit.status === "rejected" ? "status-rejected" :
                        "status-pending"
                      }>
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}