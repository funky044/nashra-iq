'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    companies: 0,
    news: 0,
    users: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Check auth
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
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/en');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Companies</div>
            <div className="text-3xl font-bold text-gray-900">{stats.companies}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">News Articles</div>
            <div className="text-3xl font-bold text-gray-900">{stats.news}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.users}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Companies</h2>
            <p className="text-gray-600 mb-4">Manage listed companies and their data</p>
            <button 
              onClick={() => router.push('/en/admin/companies')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Manage Companies
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">News</h2>
            <p className="text-gray-600 mb-4">Create and manage news articles</p>
            <button 
              onClick={() => router.push('/en/admin/news')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Manage News
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
            <button 
              onClick={() => router.push('/en/admin/users')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Manage Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Market Data</h2>
            <p className="text-gray-600 mb-4">Update market indices and prices</p>
            <button 
              onClick={() => router.push('/en/admin/api-settings')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              API Settings
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-600 mb-4">View platform analytics and insights</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600 mb-4">Configure platform settings</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Settings
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
