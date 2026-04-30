'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Image as ImageIcon, MessageSquare, Heart } from 'lucide-react';

interface Share {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    avatar: string | null;
  };
  recipe: {
    id: string;
    name: string;
  } | null;
  _count: {
    comments: number;
    likes: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ShareTable() {
  const [shares, setShares] = useState<Share[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/shares?${params}`);
      const data = await response.json();
      setShares(data.shares);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this share?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shares/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchShares();
      } else {
        alert('Failed to delete share');
      }
    } catch (error) {
      console.error('Error deleting share:', error);
      alert('Failed to delete share');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shares by caption or user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : shares.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No shares found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shares.map((share) => (
                <div key={share.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square">
                    <img
                      src={share.imageUrl}
                      alt={share.caption}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(share.imageUrl)}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-900 line-clamp-2 mb-3">
                      {share.caption}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={share.user.avatar || '/default-avatar.png'}
                        alt={share.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-gray-600">{share.user.name}</span>
                    </div>

                    {share.recipe && (
                      <div className="text-xs text-blue-600 mb-3">
                        Recipe: {share.recipe.name}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {share._count.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {share._count.comments}
                        </span>
                      </div>
                      <span>{new Date(share.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(share.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete share"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} shares
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
