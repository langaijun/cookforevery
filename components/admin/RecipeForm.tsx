'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@prisma/client';
import { Save, ArrowLeft, Plus, X, Video } from 'lucide-react';

interface RecipeFormProps {
  recipeId?: string;
}

const TASTE_OPTIONS = [
  '酸', '甜', '辣', '咸', '鲜', '麻', '清淡',
  'sour', 'sweet', 'spicy', 'salty', 'umami', 'numbing', 'mild',
];

const DIFFICULTY_OPTIONS: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

export default function RecipeForm({ recipeId }: RecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [time, setTime] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);

  // Existing taste tags
  const [newTasteTag, setNewTasteTag] = useState('');

  // Load existing recipe
  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setName(data.name);
        setNameEn(data.nameEn || '');
        setDescription(data.description);
        setDifficulty(data.difficulty);
        setTime(data.time.toString());
        setVideoUrl(data.videoUrl || '');
        setTasteTags(data.tasteTags || []);
        setIngredients(data.ingredients || ['']);
        setSteps(data.steps || ['']);
        setIsActive(data.isActive);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to load recipe');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate
    if (!name || !description || !time || !ingredients.filter(i => i.trim()).length || !steps.filter(s => s.trim()).length) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        nameEn: nameEn || null,
        description,
        difficulty,
        time: parseInt(time),
        videoUrl: videoUrl || null,
        tasteTags,
        ingredients: ingredients.filter(i => i.trim()),
        steps: steps.filter(s => s.trim()),
        isActive,
      };

      const url = recipeId ? `/api/admin/recipes/${recipeId}` : '/api/admin/recipes';
      const method = recipeId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/recipes');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const addTasteTag = () => {
    if (newTasteTag && !tasteTags.includes(newTasteTag)) {
      setTasteTags([...tasteTags, newTasteTag]);
      setNewTasteTag('');
    }
  };

  const removeTasteTag = (tag: string) => {
    setTasteTags(tasteTags.filter(t => t !== tag));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Name
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="For search"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty *
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cooking Time (minutes) *
            </label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {recipeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Video URL */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Video Tutorial</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (YouTube, Bilibili, or direct video link)
          </label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Supports YouTube, Bilibili, and direct video URLs
          </p>
        </div>
      </div>

      {/* Taste Tags */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Taste Tags</h2>

        <div className="flex gap-2">
          <select
            value={newTasteTag}
            onChange={(e) => setNewTasteTag(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a taste tag...</option>
            {TASTE_OPTIONS.filter(t => !tasteTags.includes(t)).map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTasteTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {tasteTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tasteTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTasteTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ingredients *</h2>

        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cooking Steps *</h2>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows={2}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : recipeId ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>
    </form>
  );
}
