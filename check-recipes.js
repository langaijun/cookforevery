const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      ingredients: true,
      tasteTags: true,
      steps: true,
    },
    take: 5,
  });

  console.log('Found recipes:', recipes.length);
  recipes.forEach((recipe, index) => {
    console.log(`\nRecipe ${index + 1}:`);
    console.log(`Name: ${recipe.name}`);
    console.log(`Description: ${recipe.description.substring(0, 100)}...`);
    console.log(`Ingredients: ${recipe.ingredients.slice(0, 3).join(', ')}`);
    console.log(`Taste tags: ${recipe.tasteTags.join(', ')}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());