'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    ticker: '',
    nameEn: '',
    nameAr: '',
    market: 'saudi',
    sector: '',
    industry: '',
    marketCap: '',
    website: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCompany 
        ? `/api/admin/companies/${editingCompany.id}`
        : '/api/admin/companies';
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingCompany(null);
        setFormData({ ticker: '', nameEn: '', nameAr: '', market: 'saudi', sector: '', industry: '', marketCap: '', website: '' });
        loadCompanies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save company');
      }
    } catch (err) {
      console.error('Error saving company:', err);
      alert('Failed to save company');
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      ticker: company.ticker,
      nameEn: company.name_en,
      nameAr: company.name_ar || '',
      market: company.market,
      sector: company.sector || '',
      industry: company.industry || '',
      marketCap: company.market_cap || '',
      website: company.website || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (companyId: number) => {
    if (!confirm('Are you sure? This will delete all related data (prices, news, etc.)')) return;

    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        loadCompanies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete company');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Failed to delete company');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-600 mt-1">Manage listed companies and their information</p>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setFormData({ ticker: '', nameEn: '', nameAr: '', market: 'saudi', sector: '', industry: '', marketCap: '', website: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Company
        </button>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Cap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company: any) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                  {company.ticker}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{company.name_en}</div>
                  {company.name_ar && (
                    <div className="text-sm text-gray-500">{company.name_ar}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {company.market}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {company.sector || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {company.market_cap ? `$${(company.market_cap / 1000000000).toFixed(2)}B` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticker *</label>
                  <input
                    type="text"
                    required
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!!editingCompany}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market *</label>
                  <select
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="saudi">Saudi</option>
                    <option value="uae">UAE</option>
                    <option value="qatar">Qatar</option>
                    <option value="kuwait">Kuwait</option>
                    <option value="bahrain">Bahrain</option>
                    <option value="oman">Oman</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Cap</label>
                <input
                  type="number"
                  value={formData.marketCap}
                  onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="In USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCompany ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCompany(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
