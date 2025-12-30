'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    companies: 0,
    news: 0,
    users: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your platform</p>
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
          <h2 className="text-xl font-bold mb-4">Users</h2>
          <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
          <button 
            onClick={() => router.push('/en/admin/users')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Manage Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">API Settings</h2>
          <p className="text-gray-600 mb-4">Configure API integrations</p>
          <button 
            onClick={() => router.push('/en/admin/api-settings')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            API Settings
          </button>
        </div>
      </div>
    </div>
  );
}
