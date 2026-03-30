# What's for Dinner

GitHub Pages demo for a tablet-friendly cooking app.

## Demo concept
- Left side: ranked recipe list
- Right side: ingredient chips for meats, veggies, and grains
- Recipes rise to the top based on what is selected
- Recipe modal includes:
  - Grocery list
  - How to cook it
- Settings modal includes:
  - Editable app title
  - Editable tag line
  - Basic color themes

## Files
- `index.html` - app shell and modals
- `styles.css` - layout, themes, tablet/mobile styling
- `app.js` - filter logic, ranking, modals, local settings
- `data/site.json` - branding defaults, themes, ingredients
- `data/recipes.json` - starter recipe data

## GitHub Pages setup
1. Create a repo named `whats-for-dinner` or any repo name you prefer.
2. Upload these files to the repo root.
3. In GitHub, go to **Settings > Pages**.
4. Set the source to deploy from the main branch root.
5. Open the GitHub Pages URL once deployment completes.

## Content editing
### Ingredient chips
Edit `data/site.json`
- `ingredients.meats`
- `ingredients.veggies`
- `ingredients.grains`

### Recipes
Edit `data/recipes.json`
Each recipe has:
- `name`
- `description`
- `time`
- `difficulty`
- `servings`
- `ingredients.meats`
- `ingredients.veggies`
- `ingredients.grains`
- `groceryList`
- `directions`

## Notes
- Settings are saved in browser local storage.
- This is a static starter demo, so it works well on GitHub Pages.
- The recipe ranking is intentionally simple and easy to adjust later.
