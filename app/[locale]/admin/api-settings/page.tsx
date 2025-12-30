'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface APIConfig {
  name: string;
  key: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  callsToday?: number;
  limit?: number;
}

export default function AdminAPIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [configs, setConfigs] = useState<Record<string, APIConfig>>({
    alphaVantage: {
      name: 'Alpha Vantage (Stock Data)',
      key: '',
      enabled: false,
      status: 'inactive',
      limit: 500
    },
    newsApi: {
      name: 'NewsAPI (News)',
      key: '',
      enabled: false,
      status: 'inactive',
      limit: 100
    },
    openai: {
      name: 'OpenAI (AI Analysis)',
      key: '',
      enabled: false,
      status: 'inactive'
    },
    anthropic: {
      name: 'Anthropic Claude (AI)',
      key: '',
      enabled: false,
      status: 'inactive'
    },
    googleTranslate: {
      name: 'Google Translate',
      key: '',
      enabled: false,
      status: 'inactive'
    },
    argaam: {
      name: 'Argaam (GCC News)',
      key: '',
      enabled: false,
      status: 'inactive'
    }
  });

  const [cronConfig, setCronConfig] = useState({
    enabled: true,
    frequency: 30,
    lastRun: '',
    nextRun: '',
    status: 'active'
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin/settings/apis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.apis || configs);
        setCronConfig(data.cron || cronConfig);
      }
    } catch (err) {
      console.error('Failed to load configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/apis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apis: configs, cron: cronConfig }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (apiKey: string) => {
    try {
      const response = await fetch('/api/admin/settings/test-api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('API connection successful!');
        setConfigs(prev => ({
          ...prev,
          [apiKey]: { ...prev[apiKey], status: 'active' }
        }));
      } else {
        alert('API connection failed: ' + data.error);
        setConfigs(prev => ({
          ...prev,
          [apiKey]: { ...prev[apiKey], status: 'error' }
        }));
      }
    } catch (err) {
      alert('Failed to test API');
    }
  };

  const handleManualSync = async () => {
    if (!confirm('This will trigger an immediate data refresh. Continue?')) return;
    
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/trigger-sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Sync completed!\nStocks updated: ${data.results.stocksUpdated}\nNews added: ${data.results.newsAdded}`);
        loadConfigs();
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (err) {
      alert('Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
        <p className="text-gray-600 mt-1">Configure and manage all API integrations</p>
      </div>

      {/* Cron Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Auto-Refresh Status</h2>
            <p className="text-sm text-gray-600">Automated data updates every {cronConfig.frequency} minutes</p>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600">Status</div>
            <div className={`text-lg font-bold ${cronConfig.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {cronConfig.status === 'active' ? '● Active' : '● Inactive'}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600">Last Run</div>
            <div className="text-lg font-bold text-gray-900">
              {cronConfig.lastRun || 'Never'}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600">Next Run</div>
            <div className="text-lg font-bold text-gray-900">
              {cronConfig.nextRun || 'Calculating...'}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={cronConfig.enabled}
              onChange={(e) => setCronConfig({ ...cronConfig, enabled: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Enable automatic data refresh</span>
          </label>
        </div>
      </div>

      {/* API Configurations */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h2 className="text-lg font-bold">API Integrations</h2>
        </div>

        <div className="divide-y">
          {Object.entries(configs).map(([key, config]) => (
            <div key={key} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      config.status === 'active' ? 'bg-green-100 text-green-800' :
                      config.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {config.status}
                    </span>
                  </div>
                  {config.limit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Daily limit: {config.callsToday || 0} / {config.limit} calls
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setConfigs({
                        ...configs,
                        [key]: { ...config, enabled: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                  <button
                    onClick={() => handleTest(key)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Test
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.key}
                  onChange={(e) => setConfigs({
                    ...configs,
                    [key]: { ...config, key: e.target.value }
                  })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {config.lastSync && (
                <div className="mt-2 text-sm text-gray-500">
                  Last synced: {config.lastSync}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => router.push('/en/admin')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* API Setup Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Setup Guide</h3>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Alpha Vantage (Free):</strong>
            <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="ml-2 underline">
              Get API Key →
            </a>
          </div>
          <div>
            <strong>NewsAPI (Free):</strong>
            <a href="https://newsapi.org/register" target="_blank" className="ml-2 underline">
              Get API Key →
            </a>
          </div>
          <div>
            <strong>OpenAI ($5 free):</strong>
            <a href="https://platform.openai.com/signup" target="_blank" className="ml-2 underline">
              Get API Key →
            </a>
          </div>
          <div>
            <strong>Google Translate:</strong>
            <a href="https://cloud.google.com/translate" target="_blank" className="ml-2 underline">
              Get API Key →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
