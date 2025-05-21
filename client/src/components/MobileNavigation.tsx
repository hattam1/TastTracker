import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  DollarSign, 
  ArrowDownLeft,
  Users,
  BarChart3,
  Youtube,
  Settings,
  LogOut,
  Shield,
  BadgeCheck,
  ListChecks,
  AlertTriangle,
  X,
  User
} from "lucide-react";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  user: User | null;
}

interface User {
  id: number;
  username: string;
  fullName?: string;
  role: string;
}

export default function MobileNavigation({
  isOpen,
  onClose,
  isAdmin = false,
  user
}: MobileNavigationProps) {
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

  if (!isOpen) return null;

  return (
    <div className="relative z-50 md:hidden">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Mobile menu panel */}
      <div className="fixed inset-y-0 left-0 flex max-w-xs w-full flex-col bg-white dark:bg-gray-800 shadow-xl">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 flex items-center justify-between">
            <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
              <a className="flex items-center" onClick={onClose}>
                <img 
                  src="/logo.svg" 
                  alt="TDX Logo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjNzg1Q0YzIi8+PHBhdGggZD0iTTEwLjUgMTJIMzBWMTZIMTkuNVYyOEgxMC41VjEyWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMjEuNSAyMEgzMFYyOEgyMS41VjIwWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=";
                  }}
                />
                <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {isAdmin ? "TDX Admin" : "TDX"}
                </span>
              </a>
            </Link>
            
            <button
              type="button"
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={onClose}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {user && (
            <div className="mt-6 px-4">
              <div className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                <div className="bg-primary p-2 rounded-full">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-5 px-4">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={onClose}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/auth/login">
            <a 
              className="group flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              Sign Out
            </a>
          </Link>
          
          {isAdmin && (
            <Link href="/dashboard">
              <a 
                className="mt-2 group flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onClose}
              >
                <Shield className="mr-3 h-5 w-5 text-gray-500" />
                Exit Admin
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}