import SyncDashboard from '@/components/admin/SyncDashboard';

export default function AdminSyncPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Sync</h1>
        <p className="text-gray-600 mt-1">Sync recipe data from GitHub repository</p>
      </div>

      <SyncDashboard />
    </div>
  );
}
