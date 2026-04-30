'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Heart, FileText, Image } from 'lucide-react';

interface Like {
  id: string;
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
  share: {
    id: string;
    caption: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function LikeTable() {
  const [likes, setLikes] = useState<Like[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const fetchLikes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const response = await fetch(`/api/admin/likes?${params}`);
      const data = await response.json();
      setLikes(data.likes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [page, search, type]);

  const handleDelete = async (like: Like) => {
    const targetName = like.recipe ? like.recipe.name : like.share?.caption;
    if (!confirm(`Are you sure you want to delete this like from ${like.user.name} on "${targetName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: like.user.id,
          recipeId: like.recipe?.id,
          shareId: like.share?.id,
        }),
      });

      if (response.ok) {
        fetchLikes();
      } else {
        alert('Failed to delete like');
      }
    } catch (error) {
      console.error('Error deleting like:', error);
      alert('Failed to delete like');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search likes by user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="recipe">Recipes</option>
            <option value="share">Shares</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liked Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : likes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No likes found
                </td>
              </tr>
            ) : (
              likes.map((like) => (
                <tr key={like.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={like.user.avatar || '/default-avatar.png'}
                        alt={like.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {like.user.name}
                        </div>
                        <div className="text-xs text-gray-500">{like.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900">
                        {like.recipe ? like.recipe.name : like.share?.caption}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {like.recipe ? (
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                        <FileText className="w-3 h-3" />
                        Recipe
                      </span>
                    ) : like.share ? (
                      <span className="inline-flex items-center gap-1 text-sm text-purple-600">
                        <Image className="w-3 h-3" />
                        Share
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(like.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(like)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete like"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} likes
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
  );
}
