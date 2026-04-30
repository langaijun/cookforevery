'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Ban, Trash2, ShieldCheck } from 'lucide-react';
import BanUserDialog from './BanUserDialog';

interface User {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  provider: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  _count: {
    shares: number;
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

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleBan = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleBanConfirm = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !selectedUser.isBanned }),
      });

      if (response.ok) {
        setBanDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user ban status:', error);
      alert('Failed to update user status');
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
              placeholder="Search users by name or email..."
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {user.provider}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>{user._count.shares} shares</div>
                        <div>{user._count.comments} comments</div>
                        <div>{user._count.likes} likes</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          <Ban className="w-3 h-3 mr-1" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!user.isAdmin && (
                          <>
                            <button
                              onClick={() => handleBan(user)}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title={user.isBanned ? 'Unban user' : 'Ban user'}
                            >
                              {user.isBanned ? (
                                <Shield className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
              {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* Ban Dialog */}
      {selectedUser && (
        <BanUserDialog
          isOpen={banDialogOpen}
          user={selectedUser}
          onConfirm={handleBanConfirm}
          onCancel={() => {
            setBanDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
}
