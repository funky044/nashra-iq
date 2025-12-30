'use client';

import { useState, useEffect } from 'react';

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    summaryEn: '',
    contentEn: '',
    source: '',
    sentiment: 'neutral',
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch('/api/admin/news', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingNews 
        ? `/api/admin/news/${editingNews.id}`
        : '/api/admin/news';
      
      const method = editingNews ? 'PUT' : 'POST';
      
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
        setEditingNews(null);
        setFormData({ titleEn: '', summaryEn: '', contentEn: '', source: '', sentiment: 'neutral' });
        loadNews();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save news');
      }
    } catch (err) {
      console.error('Error saving news:', err);
      alert('Failed to save news');
    }
  };

  const handleDelete = async (newsId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        loadNews();
      }
    } catch (err) {
      console.error('Error deleting news:', err);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600 mt-1">Create and manage news articles</p>
        </div>
        <button
          onClick={() => {
            setEditingNews(null);
            setFormData({ titleEn: '', summaryEn: '', contentEn: '', source: '', sentiment: 'neutral' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add News Article
        </button>
      </div>

      <div className="space-y-4">
        {news.map((article: any) => (
          <div key={article.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{article.title_en}</h3>
                <p className="text-sm text-gray-600 mt-2">{article.summary_en}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {article.sentiment}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleDelete(article.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {news.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No news articles yet. The auto-refresh will add articles every 30 minutes.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add News Article</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                <textarea
                  required
                  value={formData.summaryEn}
                  onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  required
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Reuters, Bloomberg, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
                <select
                  value={formData.sentiment}
                  onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNews(null);
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
