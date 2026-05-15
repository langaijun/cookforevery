import { PrismaClient } from '@prisma/client';
import { generateAndStoreRecipeImage } from './lib/recipe-image-generator-enhanced.js';

const prisma = new PrismaClient();

async function main() {
  // 选择第一个食谱：咖喱炒蟹
  const recipe = await prisma.recipe.findFirst({
    where: {
      name: '咖喱炒蟹'
    }
  });

  if (!recipe) {
    console.log('Recipe not found');
    return;
  }

  console.log(`Generating image for: ${recipe.name}`);
  console.log('Description:', recipe.description);
  console.log('Ingredients:', recipe.ingredients.join(', '));
  console.log('Taste tags:', recipe.tasteTags.join(', '));
  console.log('Steps:', recipe.steps.slice(0, 2).join(' | '));

  const result = await generateAndStoreRecipeImage(recipe.id);

  console.log('\n=== Result ===');
  console.log('Success:', !!result.imageUrl);
  console.log('Image URL:', result.imageUrl);
  console.log('From fallback:', result.fromFallback);
  console.log('Error:', result.error);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());