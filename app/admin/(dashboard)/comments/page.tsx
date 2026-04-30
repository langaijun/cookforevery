import CommentTable from '@/components/admin/CommentTable';

export default function AdminCommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comment Moderation</h1>
        <p className="text-gray-600 mt-1">Manage all comments in the system</p>
      </div>

      <CommentTable />
    </div>
  );
}
