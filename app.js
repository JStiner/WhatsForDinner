const STORAGE_KEY = 'wfd-demo-settings-v4';

const state = {
  defaultSite: null,
  site: null,
  recipes: [],
  activeServings: 4,
  selected: {
    meats: new Set(),
    veggies: new Set(),
    grains: new Set()
  },
  settings: null,
  activeRecipe: null,
  activeTab: 'grocery',
  activeSettingsTab: 'general'
};

const els = {
  appTitle: document.getElementById('app-title'),
  appTagline: document.getElementById('app-tagline'),
  recipeList: document.getElementById('recipe-list'),
  resultsCount: document.getElementById('results-count'),
  matchSummary: document.getElementById('match-summary'),
  meatChips: document.getElementById('meat-chips'),
  veggieChips: document.getElementById('veggie-chips'),
  grainChips: document.getElementById('grain-chips'),
  groceryList: document.getElementById('grocery-list'),
  groceryRecipeSummary: document.getElementById('grocery-recipe-summary'),
  recipeModal: document.getElementById('recipe-modal'),
  settingsModal: document.getElementById('settings-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalMeta: document.getElementById('modal-meta'),
  tabGrocery: document.getElementById('tab-grocery'),
  tabDirections: document.getElementById('tab-directions'),
  titleInput: document.getElementById('title-input'),
  taglineInput: document.getElementById('tagline-input'),
  themeOptions: document.getElementById('theme-options'),
  manageMeats: document.getElementById('manage-meats'),
  manageVeggies: document.getElementById('manage-veggies'),
  manageGrains: document.getElementById('manage-grains')
};

init();

async function init() {
  const [site, recipes] = await Promise.all([
    fetchJson('./data/site.json'),
    fetchJson('./data/recipes.json')
  ]);

  state.defaultSite = structuredClone(site);
  state.recipes = recipes;
  state.settings = loadSettings(site);
  applySettingsToSite();

  bindEvents();
  renderAll();
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

/* ================= SETTINGS ================= */

function loadSettings(site) {
  const defaults = {
    title: site.branding.title,
    tagline: site.branding.tagline,
    theme: site.defaultTheme,
    ingredients: structuredClone(site.ingredients),
    recipeSelections: {},
    manualGroceryItems: {},
    recipeItemSelections: {},
    recipeServingSelections: {}
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaults;

  try {
    const parsed = JSON.parse(saved);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}

function applySettingsToSite() {
  state.site = structuredClone(state.defaultSite);
  state.site.ingredients = structuredClone(state.settings.ingredients);
}

/* ================= SERVINGS ================= */

function getRecipeServings(recipe) {
  return recipe.servings || 4;
}

function getServingScale(recipe, selected) {
  return selected / getRecipeServings(recipe);
}

/* ================= RENDER ================= */

function renderAll() {
  renderBranding();
  renderChips();
  renderRecipes();
  renderGroceryList();
}

function renderBranding() {
  els.appTitle.textContent = state.settings.title;
  els.appTagline.textContent = state.settings.tagline;
  document.body.className = `theme-${state.settings.theme}`;
}

/* ================= CHIPS ================= */

function renderChips() {
  renderChipGroup('meats', state.site.ingredients.meats, els.meatChips);
  renderChipGroup('veggies', state.site.ingredients.veggies, els.veggieChips);
  renderChipGroup('grains', state.site.ingredients.grains, els.grainChips);
}

function renderChipGroup(group, items, mount) {
  mount.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `chip${state.selected[group].has(item.id) ? ' active' : ''}`;
    btn.textContent = item.name;
    btn.onclick = () => {
      state.selected[group].has(item.id)
        ? state.selected[group].delete(item.id)
        : state.selected[group].add(item.id);
      renderChips();
      renderRecipes();
    };
    mount.appendChild(btn);
  });
}

/* ================= RECIPES ================= */

function getRankedRecipes() {
  return state.recipes.map(r => ({
    ...r,
    addedCount: state.settings.recipeSelections[r.id] || 0
  }));
}

function renderRecipes() {
  els.recipeList.innerHTML = '';

  getRankedRecipes().forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    card.innerHTML = `
      <h3>${recipe.name}</h3>
      <p>${recipe.description}</p>
      <button class="recipe-btn">Open</button>
    `;

    card.querySelector('button').onclick = () => openRecipeModal(recipe.id);

    els.recipeList.appendChild(card);
  });
}

/* ================= MODAL ================= */

function openRecipeModal(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  state.activeRecipe = recipe;

  state.activeServings =
    state.settings.recipeServingSelections[recipeId] ||
    getRecipeServings(recipe);

  const items = buildRecipeListItems(recipe, state.activeServings);
  const addedCount = state.settings.recipeSelections[recipeId] || 0;

  els.modalTitle.textContent = recipe.name;

  els.modalMeta.innerHTML = `
    <span>Base: ${getRecipeServings(recipe)}</span>
    <span>Selected: ${state.activeServings}</span>
  `;

  els.tabGrocery.innerHTML = `
    <button id="add-all">${addedCount > 0 ? `Added x${addedCount}` : 'Add all'}</button>

    <div>
      <select id="servings">
        ${[...Array(10)].map((_, i) => {
          const n = i + 1;
          return `<option ${n === state.activeServings ? 'selected' : ''}>${n}</option>`;
        }).join('')}
      </select>
    </div>

    ${items.map(item => {
      const key = `${recipeId}::${item.key}`;
      const count = state.settings.recipeItemSelections[key] || 0;

      return `
        <div>
          ${item.display}
          <button data-key="${item.key}">
            ${count ? `Added x${count}` : 'Add'}
          </button>
        </div>
      `;
    }).join('')}
  `;

  document.getElementById('servings').onchange = (e) => {
    state.settings.recipeServingSelections[recipeId] = Number(e.target.value);
    saveSettings();
    openRecipeModal(recipeId);
  };

  document.getElementById('add-all').onclick = () => addRecipeToList(recipeId);

  els.tabGrocery.querySelectorAll('[data-key]').forEach(btn => {
    btn.onclick = () => addSingleIngredientToList(recipeId, btn.dataset.key);
  });

  els.recipeModal.classList.remove('hidden');
}

/* ================= ADD LOGIC ================= */

function addRecipeToList(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  state.settings.recipeSelections[recipeId] =
    (state.settings.recipeSelections[recipeId] || 0) + 1;

  const items = buildRecipeListItems(
    recipe,
    state.settings.recipeServingSelections[recipeId] || getRecipeServings(recipe)
  );

  items.forEach(item => {
    const key = `${recipeId}::${item.key}`;
    state.settings.recipeItemSelections[key] =
      (state.settings.recipeItemSelections[key] || 0) + 1;
  });

  saveSettings();
  renderGroceryList();
  openRecipeModal(recipeId);
}

function addSingleIngredientToList(recipeId, itemKey) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  const items = buildRecipeListItems(
    recipe,
    state.settings.recipeServingSelections[recipeId] || getRecipeServings(recipe)
  );

  const item = items.find(i => i.key === itemKey);
  if (!item) return;

  const key = `${recipeId}::${item.key}`;

  state.settings.recipeItemSelections[key] =
    (state.settings.recipeItemSelections[key] || 0) + 1;

  const existing = state.settings.manualGroceryItems[item.key];

  if (existing) {
    existing.quantity += item.quantity || 0;
    existing.count++;
  } else {
    state.settings.manualGroceryItems[item.key] = {
      ...item,
      count: 1
    };
  }

  saveSettings();
  renderGroceryList();
  openRecipeModal(recipeId);
}

/* ================= GROCERY ================= */

function getGroceryAggregation() {
  const map = new Map();

  Object.entries(state.settings.recipeSelections).forEach(([id, count]) => {
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;

    const servings =
      state.settings.recipeServingSelections[id] || getRecipeServings(recipe);

    buildRecipeListItems(recipe, servings).forEach(item => {
      const existing = map.get(item.key);

      const qty = (item.quantity || 0) * count;

      if (existing) {
        existing.quantity += qty;
      } else {
        map.set(item.key, { ...item, quantity: qty });
      }
    });
  });

  return Array.from(map.values());
}

function renderGroceryList() {
  const items = getGroceryAggregation();

  els.groceryList.innerHTML = items.length
    ? items.map(i => `<div>${i.display}</div>`).join('')
    : 'Empty';
}

/* ================= INGREDIENT ================= */

function buildRecipeListItems(recipe, servings) {
  const scale = getServingScale(recipe, servings);

  return recipe.groceryItems.map(item => ({
    ...item,
    quantity: item.quantity * scale,
    display: `${item.quantity * scale} ${item.unit} ${item.name}`,
    key: `${item.name}|${item.unit}`
  }));
}