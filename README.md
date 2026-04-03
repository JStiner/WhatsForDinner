What's for Dinner

GitHub Pages + Supabase powered cooking app designed for tablet and mobile use.

Live site: https://jstiner.github.io/WhatsForDinner/

---

Overview

What's for Dinner helps you decide what to cook based on what you already have.

- Select ingredients you have on hand
- Recipes are ranked based on coverage
- Missing items are automatically organized into a grocery list
- Meal planning and pantry tracking are built in

---

Core Features

Recipe Discovery

- Recipes are ranked dynamically based on pantry coverage
- Supports multiple cookbook files
- Minimum recipe paging for performance and usability

Pantry Tracking

- Ingredient chips track quantity (0–9)
- Used to score recipes and determine shortages
- Organized by category:
  - meats
  - veggies
  - grains
  - dairy
  - spices
  - sauces
  - bakery
  - pantry

Recipe Details

- Modal view with:
  - Grocery list (structured + display)
  - Serving size scaling
  - Directions
- “Have it” logic reflected inside recipe view

Grocery List

- Aggregates ingredients across recipes
- Merges structured items (quantity + unit)
- Shows required purchase quantities
- Supports:
  - add/remove items
  - clear list with confirmation

Meal Planning

- Weekly planning tied to shared pantry
- Shortages calculated automatically

---

Architecture

Frontend

- Static site (GitHub Pages)
- Vanilla JavaScript (no framework)
- Mobile-first responsive layout

Backend (Supabase)

Supabase is used as the system of record for:

- Ingredients
- Recipes
- Recipe ingredients / structure
- (Planned) Admin-managed settings

The app communicates directly with Supabase using the client SDK.

---

Data Model (High-Level)

Ingredients

- id
- name
- category
- unit_hint
- always_stocked (planned)

Recipes

- id
- name
- description
- time
- difficulty
- servings

Recipe_Ingredients

- recipe_id
- ingredient_id
- quantity
- unit

Recipe_Steps

- recipe_id
- step_order
- instruction

---

Local vs Cloud Behavior

Stored in Supabase (shared)

- Ingredients catalog
- Recipes and structure
- Admin updates

Stored in Browser (localStorage)

- Pantry quantities
- Grocery list
- Meal plan
- Theme/settings preferences

This allows:

- Shared data across users
- Personalized pantry per device

---

Ingredient Behavior

- Ingredient chips cycle from "0 → 9 → 0"
- Recipe scoring uses quantity coverage, not just presence
- Recipe detail view groups ingredients:
  - Have (alphabetized)
  - Need / Available (alphabetized)

---

Grocery Logic

- Structured grocery items are merged automatically
- Quantities are calculated across all selected recipes
- Purchase quantities are rounded appropriately:
  - Whole-item ingredients (meat, produce) → rounded to whole units
- Add All respects current pantry state

---

File Structure

index.html      → app layout
styles.css      → themes + layout
app.js          → core logic + Supabase integration

data/
site.json     → branding + themes
ingredients/  → fallback ingredient data
recipes/      → fallback recipe data

Fallback JSON files are used only if Supabase is unavailable.

---

Settings

Settings panel allows:

- Theme selection
- Ingredient management (add/edit/remove)
- (Planned) Admin-only controls for shared data

Note:

- Local changes persist in browser
- Admin changes persist to Supabase

---

GitHub Pages Setup

1. Create repo (e.g. "whats-for-dinner")
2. Upload files to root
3. Go to Settings → Pages
4. Deploy from main branch root
5. Access via GitHub Pages URL

---

Supabase Setup (Required for Full Functionality)

1. Create a Supabase project
2. Add tables:
   - ingredients
   - recipes
   - recipe_ingredients
   - recipe_steps
3. Enable Row Level Security (RLS)
4. Configure policies:
   - read access for all users
   - write access for admin/editor roles (optional)
5. Add keys to app.js:

const SUPABASE_URL = 'YOUR_URL';
const SUPABASE_ANON_KEY = 'YOUR_KEY';

---

Notes

- Designed for tablet kitchen use but fully mobile responsive
- Works offline with last-loaded data (limited)
- Supabase enables future expansion:
  - multi-user support
  - shared meal plans
  - admin dashboards

---

Roadmap (Active Work)

- Admin UI for managing recipes and ingredients
- Always stocked ingredient toggle
- Improved quantity handling (partial vs full)
- UI/UX polish (themes, contrast, accessibility)
- Full two-way sync validation