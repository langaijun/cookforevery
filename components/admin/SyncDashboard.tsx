'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, GitBranch, CheckCircle2, AlertCircle, Database, History, PlayCircle, AlertTriangle } from 'lucide-react';

interface SyncStatus {
  totalRecipes: number;
  activeRecipes: number;
  lastSync: string | null;
}

interface SyncResult {
  success: boolean;
  logId?: string;
  added?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  error?: string;
  details?: string;
}

interface SyncLog {
  id: string;
  added: number;
  updated: number;
  errors: number;
  status: string;
  startTime: string;
  endTime: string | null;
  totalFiles: number;
  failedFiles: string[];
}

export default function SyncDashboard() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [forceSync, setForceSync] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/sync/log');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, []);

  const handleSync = async () => {
    const mode = forceSync ? 'full' : 'incremental';
    if (!confirm(`This will perform a ${mode} sync from GitHub. Continue?`)) {
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/admin/sync/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: forceSync }),
      });

      const data = await response.json();
      setSyncResult(data);

      if (data.success) {
        // Refresh status and logs after successful sync
        setTimeout(() => {
          fetchStatus();
          fetchLogs();
        }, 1000);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error: 'Failed to sync recipes',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Success';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Running';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-3xl font-bold mt-1">{status?.totalRecipes || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Recipes</p>
              <p className="text-3xl font-bold mt-1">{status?.activeRecipes || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold mt-2">
                {status?.lastSync
                  ? new Date(status.lastSync).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sync Button with Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">GitHub Recipe Sync</h3>
              <p className="text-sm text-gray-600">
                Sync recipes from the GitHub repository
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceSync}
              onChange={(e) => setForceSync(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Force full sync (ignore file timestamps)</span>
          </label>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : (forceSync ? 'Full Sync' : 'Incremental Sync')}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div
          className={`rounded-lg p-6 ${
            syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {syncResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                {syncResult.success ? 'Sync Completed' : 'Sync Failed'}
              </h3>

              {syncResult.success && (
                <div className="space-y-2 text-sm">
                  <div className="flex gap-6">
                    <span className="text-gray-600">Added:</span>
                    <span className="font-semibold text-green-600">{syncResult.added || 0}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-semibold text-blue-600">{syncResult.updated || 0}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-gray-600">Skipped:</span>
                    <span className="font-semibold text-gray-600">{syncResult.skipped || 0}</span>
                  </div>
                  {syncResult.errors && syncResult.errors > 0 && (
                    <div className="flex gap-6">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-semibold text-red-600">{syncResult.errors}</span>
                    </div>
                  )}
                  {syncResult.logId && (
                    <div className="flex gap-6">
                      <span className="text-gray-600">Log ID:</span>
                      <span className="font-mono text-xs">{syncResult.logId}</span>
                    </div>
                  )}
                </div>
              )}

              {!syncResult.success && (
                <div className="text-sm">
                  <p className="text-red-600 mb-2">{syncResult.error}</p>
                  {syncResult.details && (
                    <p className="text-gray-600">{syncResult.details}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="font-semibold">Sync History</h3>
          </div>
          <button
            onClick={() => {
              fetchLogs();
              setShowLogs(!showLogs);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showLogs ? 'Hide' : 'Show'} Logs
          </button>
        </div>

        {showLogs && (
          <div className="divide-y">
            {logs.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No sync logs found</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{getStatusText(log.status)}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.startTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>Added: {log.added}</span>
                          <span>Updated: {log.updated}</span>
                          <span>Files: {log.totalFiles}</span>
                        </div>
                        {log.errors > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-red-600 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              {log.errors} errors
                            </span>
                            {log.failedFiles.length > 0 && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                                  View failed files
                                </summary>
                                <ul className="mt-1 ml-4 text-xs text-gray-600 list-disc">
                                  {log.failedFiles.map((file, i) => (
                                    <li key={i} className="truncate max-w-md">{file}</li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {log.endTime && (
                      <span className="text-xs text-gray-500">
                        {log.endTime && log.startTime
                          ? `${Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000)}s`
                          : '-'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sync Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">About Sync</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • <strong>Incremental sync</strong> only processes files modified since last sync
          </p>
          <p>
            • <strong>Full sync</strong> processes all files regardless of modification time
          </p>
          <p>
            • New recipes are added, existing recipes are updated based on providerId
          </p>
          <p>
            • Recipe metadata includes name, description, ingredients, steps, and taste tags
          </p>
          <p>
            • Video URLs can be manually added to recipes after sync
          </p>
        </div>
      </div>
    </div>
  );
}
