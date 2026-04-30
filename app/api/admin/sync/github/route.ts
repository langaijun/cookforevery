import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Octokit } from '@octokit/rest';

// 难度映射
function parseDifficulty(stars: string): 'EASY' | 'MEDIUM' | 'HARD' {
  const count = (stars.match(/[★]/g) || []).length;
  if (count <= 2) return 'EASY';
  if (count <= 4) return 'MEDIUM';
  return 'HARD';
}

// 口味标签推断
function inferTasteTags(description: string, ingredients: string[]): string[] {
  const tasteKeywords: Record<string, string[]> = {
    'sour': ['酸', '醋', '柠檬', '番茄'],
    'sweet': ['甜', '糖', '蜂蜜', '冰糖'],
    'spicy': ['辣', '辣椒', '麻', '花椒', '小米辣'],
    'salty': ['咸', '酱油', '盐'],
    'savory': ['鲜', '味精', '鸡精', '蚝油'],
    'numb': ['麻', '花椒'],
    'mild': ['清淡', '素', '蔬菜', '水果'],
  };

  const tags: string[] = [];
  const text = description + ' ' + ingredients.join(' ');

  for (const [taste, keywords] of Object.entries(tasteKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(taste);
    }
  }

  return tags.length > 0 ? tags : ['mild'];
}

// 解析 markdown 文件
function parseMarkdown(content: string) {
  const lines = content.split('\n');
  const result: any = {
    name: '',
    description: '',
    difficulty: 'EASY' as const,
    ingredients: [] as string[],
    steps: [] as string[],
    videoUrl: null as string | null,
  };

  let currentSection = '';
  let inIngredients = false;
  let inSteps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('# ')) {
      result.name = trimmedLine.substring(2).trim().replace('的做法', '');
      continue;
    }

    if (trimmedLine.includes('预估烹饪难度')) {
      const match = trimmedLine.match(/[★]+/);
      if (match) {
        result.difficulty = parseDifficulty(match[0]);
      }
      continue;
    }

    if (trimmedLine.startsWith('## ')) {
      currentSection = trimmedLine.substring(3).trim();
      inIngredients = currentSection.includes('必备原料') || currentSection.includes('计算');
      inSteps = currentSection.includes('操作');
      continue;
    }

    if (!currentSection && trimmedLine && !trimmedLine.startsWith('![')) {
      result.description = trimmedLine;
      continue;
    }

    if (inIngredients && trimmedLine && !trimmedLine.startsWith('#')) {
      if (!trimmedLine.includes('锅') && !trimmedLine.includes('勺') && !trimmedLine.includes('容器') && !trimmedLine.includes('定时器')) {
        const cleanIngredient = trimmedLine
          .replace(/[-*•]\s*/, '')
          .replace(/\([^)]*\)/g, '')
          .replace(/\d+\.?\d*\s*[克mlml条颗片片厘米厘米]/g, '')
          .trim();
        if (cleanIngredient && cleanIngredient.length > 0 && cleanIngredient.length < 50) {
          result.ingredients.push(cleanIngredient);
        }
      }
    }

    if (inSteps && trimmedLine) {
      const cleanStep = trimmedLine
        .replace(/[-*•]\s*/, '')
        .replace(/\d+[\.)]\s*/, '')
        .trim();
      if (cleanStep && cleanStep.length > 5) {
        result.steps.push(cleanStep);
      }
    }

    if (trimmedLine.includes('bilibili.com') || trimmedLine.includes('youtube.com')) {
      const urlMatch = trimmedLine.match(/https?:\/\/[^\s\)]+/);
      if (urlMatch) {
        result.videoUrl = urlMatch[0];
      }
    }
  }

  result.tasteTags = inferTasteTags(result.description, result.ingredients);
  return result;
}

// 从 GitHub 获取食谱
async function fetchRecipesFromGitHub(
  owner: string = 'Anduin2017',
  repo: string = 'HowToCook',
  token?: string
): Promise<Array<{ path: string; content: string }>> {
  const octokit = new Octokit({
    auth: token,
  });

  const recipes: Array<{ path: string; content: string }> = [];

  const { data: files } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: 'dishes',
    headers: {
      accept: 'application/vnd.github.v3+json',
    },
  });

  if (!Array.isArray(files)) {
    throw new Error('Failed to fetch repository contents');
  }

  const markdownFiles = (files as any[]).filter((f: any) => f.type === 'file' && f.path.endsWith('.md'));

  // 获取每个文件的内容（分批处理以避免超时）
  const batchSize = 10;
  for (let i = 0; i < markdownFiles.length; i += batchSize) {
    const batch = markdownFiles.slice(i, i + batchSize);

    await Promise.all(batch.map(async (file) => {
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
          headers: {
            accept: 'application/vnd.github.v3+json',
          },
        });

        if ((fileData as any).type === 'file' && 'content' in fileData) {
          const content = Buffer.from((fileData as any).content as string, 'base64').toString('utf-8');
          recipes.push({
            path: file.path.replace('dishes/', ''),
            content,
          });
        }
      } catch (error) {
        console.error(`获取文件 ${file.path} 失败:`, error);
      }
    }));
  }

  return recipes;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // 从环境变量获取 GitHub 配置
    const owner = process.env.GITHUB_REPO_OWNER || 'Anduin2017';
    const repo = process.env.GITHUB_REPO_NAME || 'HowToCook';
    const token = process.env.GITHUB_TOKEN;

    // 创建同步日志
    const syncLog = await prisma.syncLog.create({
      data: {
        status: 'RUNNING',
        startTime: new Date(),
      },
    });

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const failedFiles: string[] = [];

    try {
      // 从 GitHub 获取食谱
      const recipes = await fetchRecipesFromGitHub(owner, repo, token);

      // 预加载所有现有食谱
      const existingRecipes = await prisma.recipe.findMany({
        select: { id: true, providerId: true, syncedAt: true },
      });

      const existingMap = new Map(
        existingRecipes.map(r => [r.providerId, { id: r.id, syncedAt: r.syncedAt }])
      );

      for (const { path, content } of recipes) {
        try {
          const existing = existingMap.get(path);

          // 增量同步：如果已存在且不是强制同步，跳过
          if (!force && existing) {
            skipped++;
            continue;
          }

          const parsed = parseMarkdown(content);

          const recipeData = {
            name: parsed.name,
            nameEn: null,
            description: parsed.description || '',
            difficulty: parsed.difficulty,
            tasteTags: parsed.tasteTags,
            time: 30,
            ingredients: parsed.ingredients,
            steps: parsed.steps,
            videoUrl: parsed.videoUrl,
            isActive: true,
            providerId: path,
            syncedAt: new Date(),
          };

          if (existing) {
            await prisma.recipe.update({
              where: { id: existing.id },
              data: recipeData,
            });
            updated++;
          } else {
            await prisma.recipe.create({
              data: recipeData,
            });
            added++;
          }
        } catch (error) {
          console.error(`处理文件 ${path} 时出错:`, error);
          errors++;
          failedFiles.push(path);
        }
      }

      // 更新同步日志
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: errors > 0 ? 'FAILED' : 'SUCCESS',
          endTime: new Date(),
          added,
          updated,
          errors,
          failedFiles,
          totalFiles: recipes.length,
        },
      });

      return NextResponse.json({
        success: true,
        logId: syncLog.id,
        added,
        updated,
        skipped,
        errors,
        totalFiles: recipes.length,
      });
    } catch (error) {
      // 同步失败，更新日志
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          errors: 1,
          failedFiles,
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Error syncing recipes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync recipes',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}