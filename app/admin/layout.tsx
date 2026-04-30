import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated and is admin
  if (!session?.user?.email || !session.user.isAdmin) {
    redirect('/');
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
