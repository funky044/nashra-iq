'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminScreenersPage() {
  const router = useRouter();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: '',
  });

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await fetch('/api/admin/screeners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate JSON
      JSON.parse(formData.criteria);
      
      const url = editingPreset 
        ? `/api/admin/screeners/${editingPreset.id}`
        : '/api/admin/screeners';
      
      const method = editingPreset ? 'PUT' : 'POST';
      
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
        setEditingPreset(null);
        setFormData({ name: '', description: '', criteria: '' });
        loadPresets();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save preset');
      }
    } catch (err) {
      alert('Invalid JSON in criteria');
    }
  };

  const handleEdit = (preset: any) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      description: preset.description || '',
      criteria: JSON.stringify(preset.criteria, null, 2),
    });
    setShowModal(true);
  };

  const handleDelete = async (presetId: number) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      const response = await fetch(`/api/admin/screeners/${presetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        loadPresets();
      }
    } catch (err) {
      console.error('Error deleting preset:', err);
    }
  };

  const handleGeneratePresets = async () => {
    if (!confirm('Generate default screener presets?')) return;

    try {
      const response = await fetch('/api/admin/screeners/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Generated ${data.count} presets`);
        loadPresets();
      }
    } catch (err) {
      console.error('Error generating presets:', err);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Screener Presets</h1>
          <p className="text-gray-600 mt-1">Manage stock screening criteria and filters</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleGeneratePresets}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Generate Defaults
          </button>
          <button
            onClick={() => {
              setEditingPreset(null);
              setFormData({ name: '', description: '', criteria: '{}' });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Preset
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {presets.map((preset: any) => (
          <div key={preset.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{preset.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(preset)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Criteria:</div>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(preset.criteria, null, 2)}
              </pre>
            </div>
          </div>
        ))}
        
        {presets.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No screener presets yet. Click "Generate Defaults" to create some.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPreset ? 'Edit Preset' : 'Add New Preset'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="High Growth Stocks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Companies with strong revenue growth..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criteria (JSON) *</label>
                <textarea
                  required
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder='{"minGrowth": 20, "minMarketCap": 1000000000}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example fields: minGrowth, maxPE, minDividend, minVolume, minMarketCap
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingPreset ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPreset(null);
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
