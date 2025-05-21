import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useAuth } from "../hooks/auth-provider";
import { Upload, Check, AlertCircle } from "lucide-react";

export default function VerificationStatus() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: verification, isLoading } = useQuery({
    queryKey: ['/api/youtube/status'],
    enabled: !!user,
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/youtube/verify", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload verification screenshot");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/youtube/status'] });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("screenshot", selectedFile);
    
    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="dashboard-card animate-pulse h-64">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (verification && verification.status === "approved") {
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900 flex items-start">
          <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full mr-3">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-400">
              YouTube Account Verified
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your YouTube account has been verified. You now have full access to all platform features.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              Verified on {new Date(verification.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verification && verification.status === "pending") {
    return (
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 flex items-start">
          <div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-full mr-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400">
              Verification Pending
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your YouTube verification is being reviewed. This typically takes 1-2 business days.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              Submitted on {new Date(verification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold mb-4">YouTube Verification</h2>
      
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center mb-6 hover:border-primary hover:dark:border-primary transition-colors">
        <div className="mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full inline-block">
            <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        <h3 className="font-medium mb-2">Upload YouTube Verification</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please take a screenshot of your YouTube channel showing your subscriber count
          and upload it here for verification.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            <input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="screenshot"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-4"
            >
              Select Image
            </label>
            
            {selectedFile && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selected: {selectedFile.name}
              </div>
            )}
            
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className={`w-full px-4 py-2 rounded-md ${
                !selectedFile || uploadMutation.isPending
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Screenshot"}
            </button>
          </div>
        </form>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Requirements for verification:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>YouTube channel with at least 100 subscribers</li>
          <li>Channel must be at least 30 days old</li>
          <li>Screenshot must clearly show your channel name</li>
        </ul>
      </div>
    </div>
  );
}