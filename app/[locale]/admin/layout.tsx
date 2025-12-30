'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/en/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/en');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/en');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">{user.fullName}</p>
          </div>
          
          <nav className="p-4">
            <Link 
              href="/en/admin"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Dashboard
            </Link>
            
            <Link 
              href="/en/admin/users"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/users') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 Users
            </Link>
            
            <Link 
              href="/en/admin/companies"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/companies') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏢 Companies
            </Link>

            <Link 
              href="/en/admin/news"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/news') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📰 News
            </Link>

            <Link 
              href="/en/admin/calendar"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/calendar') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📅 Calendar
            </Link>

            <Link 
              href="/en/admin/screeners"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/screeners') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔍 Screeners
            </Link>
            
            <Link 
              href="/en/admin/api-settings"
              className={`block px-4 py-2 rounded-lg mb-2 ${
                isActive('/en/admin/api-settings') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔌 API Settings
            </Link>
            
            <div className="border-t mt-4 pt-4">
              <Link 
                href="/en"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg mb-2"
              >
                🏠 Back to Site
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                🚪 Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
