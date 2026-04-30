import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RecipeForm from '@/components/admin/RecipeForm';

export default function NewRecipePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/recipes"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>
        <RecipeForm />
      </div>
    </div>
  );
}
