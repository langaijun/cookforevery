import { prisma } from './lib/prisma.js';

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  });

  console.log('=== Database Recipe Images ===');
  recipes.forEach((recipe, index) => {
    console.log(`${index + 1}. ${recipe.name}`);
    console.log(`   ID: ${recipe.id}`);
    console.log(`   imageUrl: ${recipe.imageUrl}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());