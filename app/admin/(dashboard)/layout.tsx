import { requireAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await requireAdmin();
  } catch (error) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
