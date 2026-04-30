'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import { Difficulty } from '@prisma/client';

interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  tasteTags: string[];
  time: number;
  isActive: boolean;
  _count: {
    comments: number;
    likes: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function RecipeTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [page, setPage] = useState(1);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`/api/admin/recipes?${params}`);
      const data = await response.json();
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [page, search, difficulty]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRecipes();
      } else {
        alert('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={difficulty || ''}
            onChange={(e) => {
              setDifficulty(e.target.value as Difficulty | null);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : recipes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No recipes found
                </td>
              </tr>
            ) : (
              recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{recipe.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {recipe.description}
                    </div>
                    {recipe.tasteTags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {recipe.tasteTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        difficultyColors[recipe.difficulty]
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{recipe.time} min</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{recipe._count.likes} likes</span>
                      <span>{recipe._count.comments} comments</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        recipe.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {recipe.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/recipes/${recipe.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} recipes
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
