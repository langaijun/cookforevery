'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Image,
  RefreshCw,
  Heart,
  Monitor,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/recipes', icon: FileText, label: 'Recipes' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/comments', icon: MessageSquare, label: 'Comments' },
  { href: '/admin/shares', icon: Image, label: 'Shares' },
  { href: '/admin/likes', icon: Heart, label: 'Likes' },
  { href: '/admin/logs', icon: Monitor, label: 'System Logs' },
  { href: '/admin/sync', icon: RefreshCw, label: 'Data Sync' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">HomeCookHub</p>
      </div>

      <nav className="px-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>
    </aside>
  );
}
