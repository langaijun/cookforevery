import LikeTable from '@/components/admin/LikeTable';

export default function AdminLikesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Like Management</h1>
        <p className="text-gray-600 mt-1">Manage all likes in the system</p>
      </div>

      <LikeTable />
    </div>
  );
}
