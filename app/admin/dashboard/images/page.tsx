'use client';

import { useState, useEffect, useCallback } from 'react';
import ImageReviewTable from '@/components/admin/ImageReviewTable';
import { Upload, HardDrive } from 'lucide-react';

interface ImageStatus {
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

interface Stats {
  local: number;
  uploaded: number;
  none: number;
}

type Tab = 'all' | 'local' | 'uploaded';

export default function AdminImagesPage() {
  const [recipes, setRecipes] = useState<ImageStatus[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  const fetchRecipes = useCallback(
    async (tab: Tab, page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (tab !== 'all') {
          params.append('status', tab);
        }

        const response = await fetch(`/api/admin/images/list?${params}`);
        const data = await response.json();

        if (response.ok) {
          setRecipes(data.recipes);
          setPagination(data.pagination);
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          console.error('Failed to fetch recipes:', data.error);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchRecipes(activeTab, currentPage);
  }, [activeTab, currentPage, fetchRecipes]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpload = async (recipeIds: string[]) => {
    if (recipeIds.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchRecipes(activeTab, currentPage);
        alert(`上传完成！成功: ${data.success}, 失败: ${data.failed}`);
      } else {
        alert('上传失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      alert('上传失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!confirm('确定要删除本地图片吗？删除后文件将被移除。')) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/images/delete-local?recipeId=${encodeURIComponent(recipeId)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchRecipes(activeTab, currentPage);
        alert(data.message);
      } else {
        alert('删除失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      alert('删除失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const localCount = stats?.local ?? 0;
  const uploadedCount = stats?.uploaded ?? 0;
  const noneCount = stats?.none ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">图片审核与上传</h1>
        <p className="text-gray-600 mt-1">
          审核食谱图片质量，选择合适的图片上传到云端
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{localCount}</div>
              <div className="text-sm text-gray-600">本地图片</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{uploadedCount}</div>
              <div className="text-sm text-gray-600">已上传</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded">
              <HardDrive className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{noneCount}</div>
              <div className="text-sm text-gray-600">无图片</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('local')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'local'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            未上传
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('uploaded')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'uploaded'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已上传
          </button>
        </div>

        <div className="mt-6">
          <ImageReviewTable
            recipes={recipes}
            pagination={pagination ?? undefined}
            activeTab={activeTab}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
