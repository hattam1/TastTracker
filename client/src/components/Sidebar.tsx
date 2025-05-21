import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  DollarSign, 
  ArrowDownLeft,
  Users,
  BarChart3,
  Youtube,
  Shield,
  BadgeCheck,
  ListChecks,
  AlertTriangle,
  Settings
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const [location] = useLocation();
  
  const userNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Deposit",
      href: "/deposit",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: "Withdraw",
      href: "/withdraw",
      icon: <ArrowDownLeft className="h-5 w-5" />,
    },
    {
      name: "Referrals",
      href: "/referrals",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Statistics",
      href: "/statistics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "YouTube Verification",
      href: "/youtube-verification",
      icon: <Youtube className="h-5 w-5" />,
    },
  ];
  
  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Deposits",
      href: "/admin/deposits",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: "Withdrawals",
      href: "/admin/withdrawals",
      icon: <ArrowDownLeft className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "YouTube Verifications",
      href: "/admin/youtube-verifications",
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      name: "Reward Programs",
      href: "/admin/reward-programs",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      name: "Announcements",
      href: "/admin/announcements",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href={isAdmin ? "/admin" : "/"}>
              <a className="flex items-center">
                <img
                  src="/logo.svg"
                  alt="TDX Logo"
                  className="h-8 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjNzg1Q0YzIi8+PHBhdGggZD0iTTEwLjUgMTJIMzBWMTZIMTkuNVYyOEgxMC41VjEyWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMjEuNSAyMEgzMFYyOEgyMS41VjIwWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=";
                  }}
                />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  {isAdmin ? "TDX Admin" : "TDX"}
                </span>
              </a>
            </Link>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {isAdmin && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link href="/dashboard">
              <a className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Shield className="mr-3 h-5 w-5 text-gray-500" />
                Exit Admin
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}