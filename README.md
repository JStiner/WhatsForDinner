# What's for Dinner

GitHub Pages demo for a tablet-friendly cooking app.

Live site: https://jstiner.github.io/WhatsForDinner/

## What it does
- Ranks recipes based on what is in your pantry.
- Lets you track pantry quantities by tapping ingredient chips.
- Splits ingredients into cookbook-style sections:
  - meats
  - veggies
  - grains
  - dairy
  - spices
  - sauces
  - bakery
  - pantry
- Supports multiple recipe files through a cookbook filter.
- Opens each recipe in a modal with:
  - scaled grocery list
  - serving size selector
  - add missing items to grocery list
  - add or remove from weekly meal plan
  - directions tab
- Maintains a grocery list with merged structured items.
- Maintains a weekly meal plan and calculates shortages against one shared pantry.
- Saves theme, pantry counts, grocery list, meal plan, and local ingredient edits in browser local storage.

## Ingredient behavior
- Tap an ingredient chip to cycle quantity from `0` to `9`, then back to `0`.
- Recipe scoring looks at quantity coverage, not just yes/no matching.
- In the recipe detail grocery tab, trackable ingredients are grouped visually:
  - **Have** — alphabetized
  - **Need / Available** — alphabetized
  - a thin divider appears between the groups when both exist
- Structured grocery items merge automatically by ingredient and unit.

## File structure
- `index.html` — app shell, panels, recipe modal, settings modal
- `styles.css` — layout, themes, tablet/mobile styling
- `app.js` — app logic, recipe scoring, pantry tracking, grocery list logic, meal plan logic, settings rendering
- `data/site.json` — branding defaults and theme list
- `data/ingredients/` — ingredient catalog split by category
  - `meats.json`
  - `veggies.json`
  - `grains.json`
  - `dairy.json`
  - `spices.json`
  - `sauces.json`
  - `bakery.json`
  - `pantry.json`
- `data/recipes/recipe_index.json` — cookbook file index when using split recipe files
- `data/recipes/*.json` — recipe files
- `data/recipes.json` — fallback single-file recipe source

## Ingredient catalog notes
The ingredient files under `data/ingredients/` are the master selectable pantry catalog.

Each file should contain:
- common household ingredients for that category
- any normalized recipe ingredients that should be selectable in the pantry UI

Use normalized ingredient names such as:
- `Mozzarella Cheese`
- `Soy Sauce`
- `Garlic`
- `Chicken Broth`

Do not use full grocery phrases such as:
- `2 cups mozzarella cheese`
- `3 tbsp soy sauce`
- `2 cloves garlic`

## Recipe data shape
Each recipe should include the fields below.

```json
{
  "id": "chicken-broccoli-rice-bowls",
  "name": "Chicken Broccoli Rice Bowls",
  "description": "A fast skillet dinner with tender chicken, broccoli, and a simple savory sauce over rice.",
  "time": "30 min",
  "difficulty": "Easy",
  "servings": 4,
  "ingredients": {
    "meats": ["chicken breast"],
    "veggies": ["broccoli", "onion"],
    "grains": ["white rice"],
    "sauces": ["soy sauce"],
    "spices": ["garlic powder"]
  },
  "groceryList": [
    "1.5 lb chicken breast",
    "3 cups broccoli florets",
    "1 small onion",
    "2 cups cooked rice"
  ],
  "groceryItems": [
    { "quantity": 1.5, "unit": "lb", "name": "Chicken Breast", "pantryKey": "chicken breast" },
    { "quantity": 3, "unit": "cup", "name": "Broccoli", "pantryKey": "broccoli" }
  ],
  "directions": [
    "Cook the rice.",
    "Cook the chicken.",
    "Add the vegetables and sauce."
  ]
}
```

## Recipe and ingredient maintenance
When you add recipes:
1. Put normalized ingredient tags under the proper `ingredients` category.
2. Make sure those tags also exist in one of the files under `data/ingredients/`.
3. Keep `groceryItems` structured when possible so shortages and grocery merging stay accurate.
4. Use `groceryList` for display-friendly text when needed.

## Settings behavior
The settings modal lets you:
- edit app title
- edit tag line
- switch color themes
- add, rename, assign unit hints, and remove ingredient chips by category

These changes are local to the browser unless you also update the JSON files in the repo.

## GitHub Pages setup
1. Create a repo named `whats-for-dinner` or any repo name you prefer.
2. Upload these files to the repo root.
3. In GitHub, go to **Settings > Pages**.
4. Set the source to deploy from the main branch root.
5. Open the GitHub Pages URL once deployment completes.

## Notes
- This is a static site and works well on GitHub Pages.
- Browser storage is used for local customizations and pantry state.
- Reset Settings clears local pantry, grocery list, meal plan, theme, and ingredient edits.
- The fallback loader still supports `data/recipes.json` if split recipe files are not present.
