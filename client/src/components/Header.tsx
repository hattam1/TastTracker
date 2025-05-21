import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, Bell, User, ChevronDown } from 'lucide-react';
import AnnouncementBanner from './AnnouncementBanner';

interface HeaderProps {
  user: User | null;
  onMobileMenuOpen: () => void;
  isAdmin?: boolean;
}

interface User {
  id: number;
  username: string;
  fullName?: string;
  role: string;
}

export default function Header({ user, onMobileMenuOpen, isAdmin = false }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <AnnouncementBanner />
      
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  type="button"
                  className="md:hidden px-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  onClick={onMobileMenuOpen}
                >
                  <span className="sr-only">Open menu</span>
                  <Menu className="h-6 w-6" />
                </button>
                
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
                    <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                      {isAdmin ? "TDX Admin" : "TDX"}
                    </span>
                  </a>
                </Link>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center">
                <div className="hidden md:ml-4 md:flex md:items-center">
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                  </button>
                  
                  <div className="ml-4 relative">
                    <div>
                      <button
                        type="button"
                        className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="bg-primary text-white p-2 rounded-full">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-2 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </p>
                        </div>
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    {userMenuOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        onBlur={() => setUserMenuOpen(false)}
                      >
                        <div className="py-1">
                          <Link href="/profile">
                            <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                              Your Profile
                            </a>
                          </Link>
                          
                          {isAdmin && (
                            <Link href="/dashboard">
                              <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                                Exit Admin
                              </a>
                            </Link>
                          )}
                          
                          <Link href="/auth/login">
                            <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                              Sign out
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link href="/auth/login">
                  <a className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light px-3 py-2 rounded-md text-sm font-medium">
                    Sign in
                  </a>
                </Link>
                <Link href="/auth/register">
                  <a className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium">
                    Register
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}