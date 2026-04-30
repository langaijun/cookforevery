import Link from 'next/link';
import { Plus } from 'lucide-react';
import RecipeTable from '@/components/admin/RecipeTable';

export default async function AdminRecipesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Recipe Management</h1>
          <p className="text-gray-600 mt-1">Manage all recipes in the system</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Recipe
        </Link>
      </div>

      <RecipeTable />
    </div>
  );
}
