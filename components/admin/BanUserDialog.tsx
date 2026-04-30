'use client';

import { X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string | null;
  isBanned: boolean;
}

interface BanUserDialogProps {
  isOpen: boolean;
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BanUserDialog({
  isOpen,
  user,
  onConfirm,
  onCancel,
}: BanUserDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            user.isBanned ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {user.isBanned ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </h3>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          {user.isBanned
            ? 'This user will be able to access the platform again. Are you sure you want to unban this user?'
            : 'This user will be unable to access the platform. Are you sure you want to ban this user?'}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              user.isBanned
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {user.isBanned ? 'Unban' : 'Ban'}
          </button>
        </div>
      </div>
    </div>
  );
}
