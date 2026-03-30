let recipes = [];

async function loadRecipeFiles() {
  const indexResponse = await fetch('data/recipes/recipe_index.json');
  const recipeIndex = await indexResponse.json();
  const files = recipeIndex.files || [];

  const recipeFilePromises = files.map(async (fileName) => {
    const fileResponse = await fetch(`data/recipes/${fileName}`);
    const fileRecipes = await fileResponse.json();
    return fileRecipes;
  });

  const loadedRecipeArrays = await Promise.all(recipeFilePromises);
  return loadedRecipeArrays.flat();
}

async function initializeRecipes() {
  recipes = await loadRecipeFiles();
  console.log("Loaded recipes:", recipes);
}

initializeRecipes();
