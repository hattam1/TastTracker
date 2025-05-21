import React from "react";
import { useAuth } from "../hooks/auth-provider";
import StatusCards from "../components/StatusCards";
import RewardProgramSection from "../components/RewardProgramSection";
import VerificationStatus from "../components/VerificationStatus";
import RecentActivities from "../components/RecentActivities";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your dashboard.
          </p>
          <a 
            href="/auth/login" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Log In
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user.fullName || user.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your investment overview for today
          </p>
        </div>

        <div className="mb-8">
          <StatusCards />
        </div>

        <div className="mb-8">
          <RewardProgramSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <VerificationStatus />
          </div>
          <div>
            <RecentActivities />
          </div>
        </div>
      </div>
    </Layout>
  );
}