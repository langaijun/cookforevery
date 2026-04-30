import ShareTable from '@/components/admin/ShareTable';

export default function AdminSharesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Share Moderation</h1>
        <p className="text-gray-600 mt-1">Manage all user shares in the system</p>
      </div>

      <ShareTable />
    </div>
  );
}
