import UserTable from '@/components/admin/UserTable';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all users in the system</p>
      </div>

      <UserTable />
    </div>
  );
}
