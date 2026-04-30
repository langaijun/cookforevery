'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, FileText, User, MessageSquare, Image, RefreshCw, Heart, Monitor } from 'lucide-react';

interface AdminLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const actionColors: Record<string, string> = {
  CREATE_RECIPE: 'bg-green-100 text-green-700',
  UPDATE_RECIPE: 'bg-blue-100 text-blue-700',
  DELETE_RECIPE: 'bg-red-100 text-red-700',
  BAN_USER: 'bg-red-100 text-red-700',
  UNBAN_USER: 'bg-green-100 text-green-700',
  DELETE_USER: 'bg-red-100 text-red-700',
  DELETE_COMMENT: 'bg-red-100 text-red-700',
  DELETE_SHARE: 'bg-red-100 text-red-700',
  START_SYNC: 'bg-blue-100 text-blue-700',
  SYNC_COMPLETE: 'bg-green-100 text-blue-700',
  DELETE_LIKE: 'bg-red-100 text-red-700',
  BULK_DELETE_LIKES: 'bg-red-100 text-red-700',
};

const entityIcons: Record<string, any> = {
  RECIPE: FileText,
  USER: User,
  COMMENT: MessageSquare,
  SHARE: Image,
  SYNC: RefreshCw,
  LIKE: Heart,
};

const entityLabels: Record<string, string> = {
  RECIPE: 'Recipe',
  USER: 'User',
  COMMENT: 'Comment',
  SHARE: 'Share',
  SYNC: 'Sync',
  LIKE: 'Like',
};

export default function LogsTable() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('adminId', search);
      if (actionFilter) params.append('action', actionFilter);
      if (entityTypeFilter) params.append('entityType', entityTypeFilter);

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter, entityTypeFilter]);

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getUniqueActions = () => {
    const actions = logs.map((log) => log.action);
    return Array.from(new Set(actions)).sort();
  };

  const getUniqueEntityTypes = () => {
    const types = logs.map((log) => log.entityType);
    return Array.from(new Set(types)).sort();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-4 flex-wrap">
          {/* Search by Admin */}
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by admin..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            {getUniqueActions().map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {getUniqueEntityTypes().map((type) => (
              <option key={type} value={type}>
                {entityLabels[type] || type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const EntityIcon = entityIcons[log.entityType] || FileText;
                const isExpanded = expandedRow === log.id;

                return (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : log.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.admin.name}
                            </div>
                            <div className="text-xs text-gray-500">{log.admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            actionColors[log.action] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <EntityIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {entityLabels[log.entityType] || log.entityType}
                          </span>
                          {log.entityName && (
                            <span className="text-xs text-gray-500">
                              ({log.entityName})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-3">
                            {/* IP Address & User Agent */}
                            <div className="flex gap-6 text-sm">
                              {log.ipAddress && (
                                <div>
                                  <span className="text-gray-500">IP:</span>{' '}
                                  <span className="text-gray-900">{log.ipAddress}</span>
                                </div>
                              )}
                              {log.userAgent && (
                                <div>
                                  <span className="text-gray-500">User Agent:</span>{' '}
                                  <span className="text-gray-900 max-w-2xl inline-block truncate">
                                    {log.userAgent}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            {log.details && (
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                  Additional Details
                                </div>
                                <div className="bg-gray-900 rounded-lg p-4 text-sm overflow-auto max-h-64">
                                  <pre className="text-green-400">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Entity ID */}
                            {log.entityId && (
                              <div className="text-sm">
                                <span className="text-gray-500">Entity ID:</span>{' '}
                                <span className="text-gray-900 font-mono">{log.entityId}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} logs
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
