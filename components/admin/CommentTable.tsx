'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
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

export default function CommentTable() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/comments?${params}`);
      const data = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments by content or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Related To
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
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900 line-clamp-3">
                        {comment.content}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={comment.user.avatar || '/default-avatar.png'}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {comment.user.name}
                        </div>
                        <div className="text-xs text-gray-500">{comment.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {comment.recipe ? (
                      <span className="text-sm text-blue-600">
                        Recipe: {comment.recipe.name}
                      </span>
                    ) : comment.share ? (
                      <span className="text-sm text-purple-600">
                        Share: {comment.share.caption}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete comment"
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
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} comments
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
