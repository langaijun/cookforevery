import { getAuthenticatedUserWithDb } from '@/lib/unified-auth';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLoginPage() {
  const user = await getAuthenticatedUserWithDb();

  // If already logged in and is admin, redirect to admin dashboard
  if (user?.email && user.isAdmin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">HomeCookHub Admin Panel</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
