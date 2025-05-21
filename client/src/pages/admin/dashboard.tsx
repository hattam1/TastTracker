import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ADMIN_PAGES } from "@/lib/constants";

export default function AdminDashboard() {
  const [_, navigate] = useLocation();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "ri-user-line",
      color: "bg-blue-500",
      action: {
        label: "View Users",
        onClick: () => navigate(ADMIN_PAGES.USERS)
      }
    },
    {
      title: "Total Deposits",
      value: formatCurrency(stats?.totalDeposits || 0),
      icon: "ri-money-dollar-circle-line",
      color: "bg-green-500",
      badge: stats?.pendingDeposits ? `${stats.pendingDeposits} pending` : undefined,
      action: {
        label: "View Deposits",
        onClick: () => navigate(ADMIN_PAGES.DEPOSITS)
      }
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(stats?.totalWithdrawals || 0),
      icon: "ri-wallet-3-line",
      color: "bg-purple-500",
      badge: stats?.pendingWithdrawals ? `${stats.pendingWithdrawals} pending` : undefined,
      action: {
        label: "View Withdrawals",
        onClick: () => navigate(ADMIN_PAGES.WITHDRAWALS)
      }
    },
    {
      title: "Active Reward Programs",
      value: stats?.activeRewardPrograms || 0,
      icon: "ri-award-line",
      color: "bg-yellow-500"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate(ADMIN_PAGES.ANNOUNCEMENTS)}
          className="flex items-center gap-2"
        >
          <i className="ri-notification-line"></i>
          Manage Announcements
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.color} p-2 rounded-full text-white`}>
                <i className={`${card.icon}`}></i>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex justify-between items-center mt-2">
                {card.badge && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {card.badge}
                  </span>
                )}
                {card.action && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={card.action.onClick}
                    className="text-xs"
                  >
                    {card.action.label}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line text-lg text-green-500"></i>
                  <span>Deposit Approvals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats?.pendingDeposits || 0}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`${ADMIN_PAGES.DEPOSITS}?status=pending`)}
                    disabled={!stats?.pendingDeposits}
                  >
                    Review
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <i className="ri-youtube-line text-lg text-red-500"></i>
                  <span>YouTube Verifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats?.pendingYoutubeVerifications || 0}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/admin/youtube-verifications")}
                    disabled={!stats?.pendingYoutubeVerifications}
                  >
                    Review
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <i className="ri-wallet-3-line text-lg text-purple-500"></i>
                  <span>Withdrawal Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats?.pendingWithdrawals || 0}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`${ADMIN_PAGES.WITHDRAWALS}?status=pending`)}
                    disabled={!stats?.pendingWithdrawals}
                  >
                    Review
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full justify-start" 
                onClick={() => navigate(ADMIN_PAGES.USERS)}
              >
                <i className="ri-user-line mr-2"></i>
                Manage Users
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(ADMIN_PAGES.DEPOSITS)}
              >
                <i className="ri-money-dollar-circle-line mr-2"></i>
                Manage Deposits
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(ADMIN_PAGES.WITHDRAWALS)}
              >
                <i className="ri-wallet-3-line mr-2"></i>
                Manage Withdrawals
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(ADMIN_PAGES.ANNOUNCEMENTS)}
              >
                <i className="ri-notification-line mr-2"></i>
                Manage Announcements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
