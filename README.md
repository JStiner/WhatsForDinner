# What's for Dinner

GitHub Pages demo for a tablet-friendly cooking app.

## Demo concept
- Left side: ranked recipe list
- Right side: ingredient chips for meats, veggies, and grains
- Main screen grocery list with quantity rollups
- Recipes rise to the top based on what is selected
- Recipe modal includes:
  - Grocery list
  - Add to List button
  - How to cook it
  - Copy to clipboard actions
- Grocery list includes:
  - Remove per item
  - Copy shopping list
  - Clear with confirmation
- Settings modal includes:
  - Editable app title
  - Editable tag line
  - Basic color themes
  - Ingredient add, edit, and remove tools for meats, veggies, and grains

## Files
- `index.html` - app shell and modals
- `styles.css` - layout, themes, tablet/mobile styling
- `app.js` - filter logic, ranking, grocery list logic, modals, local settings
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
You can either:
- edit `data/site.json`, or
- use the in-app settings panel for local browser-managed chip changes

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
- `groceryItems`
- `directions`

## Notes
- Settings, ingredient edits, and grocery selections are saved in browser local storage.
- Grocery quantity rollups work best with structured `groceryItems` entries.
- This is a static starter demo, so it works well on GitHub Pages.
- The recipe ranking is intentionally simple and easy to adjust later.
