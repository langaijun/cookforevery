import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [userCount, recipeCount, shareCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.recipe.count(),
    prisma.share.count(),
    prisma.comment.count(),
  ]);

  const recentShares = await prisma.share.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const recentComments = await prisma.comment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your HomeCookHub platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold mt-1">{userCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/recipes" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-3xl font-bold mt-1">{recipeCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/shares" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shares</p>
              <p className="text-3xl font-bold mt-1">{shareCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/admin/comments" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Comments</p>
              <p className="text-3xl font-bold mt-1">{commentCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Shares */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Shares</h2>
            <Link href="/admin/shares" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentShares.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No shares yet</p>
            ) : (
              recentShares.map((share) => (
                <div key={share.id} className="flex items-start gap-3 pb-3 border-b">
                  <img
                    src={share.imageUrl}
                    alt={share.caption}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{share.caption}</p>
                    <p className="text-xs text-gray-500">by {share.user.name}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(share.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Comments</h2>
            <Link href="/admin/comments" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentComments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              recentComments.map((comment) => (
                <div key={comment.id} className="pb-3 border-b last:border-b-0">
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
