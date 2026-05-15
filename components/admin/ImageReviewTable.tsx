'use client';

import { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Eye } from 'lucide-react';

interface RecipeImage {
  recipeId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  status: 'local' | 'uploaded' | 'none';
  localPath: string;
  bucketUrl: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ImageReviewTableProps {
  recipes: RecipeImage[];
  pagination?: Pagination;
  activeTab: 'all' | 'local' | 'uploaded';
  onUpload?: (recipeIds: string[]) => void;
  onDelete?: (recipeId: string) => void;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

const statusLabels = {
  local: '本地图片',
  uploaded: '已上传',
  none: '无图片'
};

const statusColors = {
  local: 'bg-yellow-100 text-yellow-800',
  uploaded: 'bg-green-100 text-green-800',
  none: 'bg-gray-100 text-gray-800'
};

export default function ImageReviewTable({
  recipes,
  pagination,
  activeTab,
  onUpload,
  onDelete,
  onPageChange,
  loading: propsLoading
}: ImageReviewTableProps) {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());

  // Empty state when loading
  if (propsLoading && recipes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // Empty state when no recipes
  if (!propsLoading && recipes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600">
            {activeTab === 'all' && '没有找到任何食谱'}
            {activeTab === 'local' && '没有找到未上传的图片'}
            {activeTab === 'uploaded' && '没有找到已上传的图片'}
          </p>
        </div>
      </div>
    );
  }

  const handleSelect = (recipeId: string, checked: boolean) => {
    const newSelected = new Set(selectedRecipeIds);
    if (checked) {
      newSelected.add(recipeId);
    } else {
      newSelected.delete(recipeId);
    }
    setSelectedRecipeIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = recipes.map(r => r.recipeId)
      setSelectedRecipeIds(new Set(allIds));
    } else {
      setSelectedRecipeIds(new Set());
    }
  };

  const handleBatchUpload = async () => {
    if (selectedRecipeIds.size === 0) return;

    try {
      onUpload?.(Array.from(selectedRecipeIds));
      setSelectedRecipeIds(new Set());
    } catch (error) {
      alert('上传失败: ' + error);
    }
  };

  const selectedCount = selectedRecipeIds.size;
  const localCount = recipes.filter(r => r.status === 'local').length;

  // Main table component
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 批量操作栏 */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedRecipeIds.size === recipes.length && recipes.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-600">
            已选择 {selectedCount} 项
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBatchUpload}
            disabled={selectedCount === 0 || propsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            批量上传 {selectedCount > 0 && `(${selectedCount})`}
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRecipeIds.size === recipes.length && recipes.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                食谱名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                图片预览
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recipes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  没有找到食谱
                </td>
              </tr>
            ) : (
              recipes.map((recipe) => (
                <tr key={recipe.recipeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecipeIds.has(recipe.recipeId)}
                      onChange={(e) => handleSelect(recipe.recipeId, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{recipe.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {recipe.description}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {recipe.status === 'none' ? (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
                      <div className="relative group">
                        <img
                          src={recipe.imageUrl || recipe.localPath || recipe.bucketUrl}
                          alt={recipe.name}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() =>
                            window.open(
                              recipe.imageUrl || recipe.localPath || recipe.bucketUrl,
                              '_blank'
                            )
                          }
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        statusColors[recipe.status]
                      }`}
                    >
                      {statusLabels[recipe.status]}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {recipe.status === 'local' && (
                        <>
                          <button
                            onClick={() => onUpload?.([recipe.recipeId])}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="上传图片"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete?.(recipe.recipeId)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="删除本地图片"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {recipe.imageUrl && (
                        <a
                          href={recipe.imageUrl || recipe.localPath || recipe.bucketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                          title="查看大图"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {pagination ? (
            <>
              第 {pagination.page} / {pagination.pages || 1} 页，本页 {recipes.length} 条，共{' '}
              {pagination.total} 条；本页本地 {localCount} 个
            </>
          ) : (
            <>本页 {recipes.length} 个食谱，本地图片 {localCount} 个</>
          )}
        </div>
        {pagination && pagination.pages > 1 && onPageChange && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={propsLoading || pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
            >
              上一页
            </button>
            <button
              type="button"
              disabled={propsLoading || pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}