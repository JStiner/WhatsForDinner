# What's for Dinner

Static GitHub Pages cooking app for browsing recipes, tracking what you have on hand, building a grocery list, and planning meals.

Live site:
https://jstiner.github.io/WhatsForDinner/

## What it does
- Shows recipes in a left-side cookbook list on desktop
- Shows ingredient panels on the right for meats, veggies, and grains
- On mobile, stacks the sections for easier use
- Ranks recipes based on how much of the recipe your pantry currently covers
- Supports recipe paging at 10 recipes per page
- Supports multiple recipe files through a recipe index with an in-app Cook Book filter
- Lets you open a recipe and switch between grocery details and cooking directions
- Scales recipe grocery math by serving size
- Tracks pantry quantities locally in the browser
- Builds a grocery list from missing ingredients only
- Supports a meal plan with aggregated shortages across planned recipes
- Lets you customize app title, tagline, theme, and ingredient lists locally
- Supports collapsible desktop sections

## Ingredient panels
Each ingredient section now renders in two visual groups:
- **Have**: items currently marked on hand, sorted A to Z
- **Need / Available**: items not currently on hand, sorted A to Z

A thin divider is shown between the groups when both groups contain items.

Ingredient chips cycle quantity when tapped:
- 0 = not on hand
- 1 through 9 = quantity on hand
- the next tap after 9 resets back to 0

The unit hint shown on each chip comes from the ingredient's pantry unit.

## Recipe ranking
Recipes are scored from your pantry state using structured grocery items.

Ranking priority is:
1. Recipes with everything covered
2. Higher coverage percentage
3. Lower total missing amount
4. Recipe name A to Z

## Recipe modal
Each recipe modal includes:
- Grocery tab
- Directions tab
- Serving size selector
- Add missing to grocery list
- Add or remove from meal plan
- Per-line status such as Have it, partial, or need

Manual grocery lines are still supported for items that cannot be parsed into structured pantry math.

## Grocery list
The grocery list:
- rolls up matching structured ingredients automatically
- keeps track of which recipes contributed items
- supports copy shopping list
- supports clearing the full list
- avoids adding ingredients already covered by the pantry when using recipe shortage actions

## Meal plan
The meal plan:
- stores recipes with a serving count
- lets you adjust servings per planned meal
- calculates combined shortages across all planned meals
- can add aggregated plan shortages into the grocery list

## Settings
The settings modal supports:
- app title edit
- tagline edit
- theme selection
- add ingredient
- rename ingredient
- change pantry unit hint
- remove ingredient

These changes are stored locally in the current browser.

## Data structure
### Core files
- `index.html` - app shell and modal markup
- `styles.css` - layout, themes, responsive styling, grouping styles
- `app.js` - app logic, ranking, pantry math, grocery list, meal plan, settings
- `data/site.json` - branding, themes, default ingredient lists
- `data/recipes.json` - fallback single-file recipe source

### Multi-file recipe support
Preferred structure:
- `data/recipes/recipe_index.json`
- `data/recipes/<file>.json`

Example `recipe_index.json`:

```json
{
  "files": [
    "chicken_recipes.json",
    "beef_recipes.json",
    "pasta_recipes.json"
  ]
}
```

If the recipe index is not present, the app falls back to `data/recipes.json`.

### Recipe format
Each recipe should include:

```json
{
  "id": "chicken-broccoli-rice-bowls",
  "name": "Chicken Broccoli Rice Bowls",
  "description": "A fast skillet dinner with tender chicken, broccoli, and a simple savory sauce over rice.",
  "time": "30 min",
  "difficulty": "Easy",
  "servings": 4,
  "ingredients": {
    "meats": ["chicken"],
    "veggies": ["broccoli", "onion"],
    "grains": ["rice"]
  },
  "groceryList": [
    "1.5 lb chicken breast or thighs",
    "3 cups broccoli florets",
    "1 small onion, sliced",
    "2 cups cooked rice"
  ],
  "groceryItems": [
    { "quantity": 1.5, "unit": "lb", "name": "chicken breast or thighs", "pantryKey": "chicken" },
    { "quantity": 3, "unit": "cup", "name": "broccoli florets", "pantryKey": "broccoli" },
    { "quantity": 1, "unit": "count", "name": "onion", "pantryKey": "onion" },
    { "quantity": 2, "unit": "cup", "name": "cooked rice", "pantryKey": "rice" }
  ],
  "directions": [
    "Cook rice according to package directions.",
    "Cook the chicken.",
    "Add vegetables and sauce.",
    "Serve over rice."
  ]
}
```

### Notes on grocery data
- `groceryItems` is preferred because it enables pantry coverage math and shortage rollups
- `groceryList` can still be used as a fallback
- freeform display lines are supported, but they do not participate in pantry quantity math unless they can be normalized into a structured item

## How to use it
### Everyday use
1. Open the app.
2. In Ingredients, tap chips to mark what you have.
3. Review the ranked recipe list.
4. Open a recipe.
5. Adjust servings if needed.
6. Add missing items to the grocery list or add the recipe to the meal plan.
7. Copy the grocery list when you are ready to shop.

### Managing recipes
1. Add or edit recipe JSON files.
2. If using multiple files, update `data/recipes/recipe_index.json`.
3. Commit and push to GitHub.
4. GitHub Pages will publish the update.

### Managing ingredients and branding
You can either:
- edit `data/site.json` for repo-backed defaults, or
- use the in-app settings panel for browser-local customization

## Local storage keys
The app stores data in browser local storage for:
- site branding and ingredient edits
- selected theme
- pantry counts
- grocery list
- meal plan
- collapsed section state

Clearing browser storage or using Reset Settings will remove local customizations.

## GitHub Pages setup
1. Create or use a GitHub repository.
2. Put the app files at the repo root.
3. In GitHub, go to **Settings > Pages**.
4. Deploy from the main branch root.
5. Open the published Pages URL.

## Current limitations
- Login, shared accounts, and sync across devices are not included in this static version
- Pantry, settings, grocery list, and meal plan are local to one browser
- Quantity math depends on reasonably structured `groceryItems`
- This project is front-end only; there is no database in the current build
