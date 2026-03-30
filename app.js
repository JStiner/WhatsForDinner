<<<<<<< HEAD

const STORAGE_KEYS = {
  site: 'wfd-site-config-v1',
  theme: 'wfd-theme-v1',
  pantry: 'wfd-pantry-v2',
  grocery: 'wfd-grocery-v2',
  mealPlan: 'wfd-meal-plan-v1',
  sections: 'wfd-sections-v1',
=======
const STORAGE_KEYS = {
  site: 'wfd-site-config-v1',
  theme: 'wfd-theme-v1',
  pantry: 'wfd-pantry-v1',
  grocery: 'wfd-grocery-v1',
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
};

const PAGE_SIZE = 10;
const CATEGORY_KEYS = ['meats', 'veggies', 'grains'];
<<<<<<< HEAD
const UNIT_ALIASES = {
  '': 'count',
  count: 'count',
  piece: 'count',
  pieces: 'count',
  each: 'count',
  whole: 'count',
  medium: 'count',
  small: 'count',
  large: 'count',
  clove: 'clove',
  cloves: 'clove',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  cup: 'cup',
  cups: 'cup',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  can: 'can',
  cans: 'can',
  package: 'package',
  packages: 'package',
  packet: 'packet',
  packets: 'packet',
  slice: 'slice',
  slices: 'slice',
  bunch: 'bunch',
  bunches: 'bunch',
};
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5

let recipes = [];
let siteConfig = null;
let currentTheme = 'citrus';
let currentPage = 1;
let activeRecipe = null;
let activeRecipeServings = 4;
let pantryCounts = {};
let groceryItems = [];
<<<<<<< HEAD
let mealPlan = [];
let sectionState = { recipes: false, shopping: false, 'meal-plan': false, ingredients: false };
let activeRecipeFile = 'all';
let recipeFileOptions = [];
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5

const el = {};

document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  bindStaticEvents();
  await initializeApp();
});

function cacheElements() {
  el.appTitle = document.getElementById('app-title');
  el.appTagline = document.getElementById('app-tagline');
  el.recipeList = document.getElementById('recipe-list');
  el.resultsCount = document.getElementById('results-count');
  el.matchSummary = document.getElementById('match-summary');
  el.recipePagination = document.getElementById('recipe-pagination');
<<<<<<< HEAD
  el.recipeFileFilter = document.getElementById('recipe-file-filter');
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  el.meatChips = document.getElementById('meat-chips');
  el.veggieChips = document.getElementById('veggie-chips');
  el.grainChips = document.getElementById('grain-chips');
  el.groceryList = document.getElementById('grocery-list');
  el.groceryRecipeSummary = document.getElementById('grocery-recipe-summary');
<<<<<<< HEAD
  el.mealPlanSummary = document.getElementById('meal-plan-summary');
  el.mealPlanList = document.getElementById('meal-plan-list');
  el.mealPlanShopping = document.getElementById('meal-plan-shopping');
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  el.recipeModal = document.getElementById('recipe-modal');
  el.modalTitle = document.getElementById('modal-title');
  el.modalMeta = document.getElementById('modal-meta');
  el.tabGrocery = document.getElementById('tab-grocery');
  el.tabDirections = document.getElementById('tab-directions');
  el.settingsModal = document.getElementById('settings-modal');
  el.themeOptions = document.getElementById('theme-options');
  el.titleInput = document.getElementById('title-input');
  el.taglineInput = document.getElementById('tagline-input');
  el.manageMeats = document.getElementById('manage-meats');
  el.manageVeggies = document.getElementById('manage-veggies');
  el.manageGrains = document.getElementById('manage-grains');
}

function bindStaticEvents() {
  document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
    pantryCounts = {};
    persistPantry();
    currentPage = 1;
    renderAll();
  });

  document.getElementById('settings-btn')?.addEventListener('click', openSettingsModal);
<<<<<<< HEAD
  document.getElementById('recipe-file-filter')?.addEventListener('change', onRecipeFileFilterChange);
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  document.getElementById('save-settings-btn')?.addEventListener('click', saveSettings);
  document.getElementById('reset-settings-btn')?.addEventListener('click', resetSettings);
  document.getElementById('copy-shopping-list-btn')?.addEventListener('click', copyShoppingList);
  document.getElementById('clear-grocery-btn')?.addEventListener('click', () => {
    groceryItems = [];
    persistGrocery();
    renderGroceryList();
<<<<<<< HEAD
    if (activeRecipe) renderRecipeModal();
  });

  document.getElementById('clear-meal-plan-btn')?.addEventListener('click', () => {
    mealPlan = [];
    persistMealPlan();
    renderMealPlan();
    renderRecipes();
    if (activeRecipe) renderRecipeModal();
  });

  document.getElementById('add-plan-shortages-btn')?.addEventListener('click', addMealPlanShortagesToGrocery);

=======
  });

>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  document.querySelectorAll('[data-close-modal="true"]').forEach(node => {
    node.addEventListener('click', closeRecipeModal);
  });

  document.querySelectorAll('[data-close-settings="true"]').forEach(node => {
    node.addEventListener('click', closeSettingsModal);
  });

  document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setRecipeModalTab(btn.dataset.tab));
  });

  document.querySelectorAll('.settings-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setSettingsTab(btn.dataset.settingsTab));
  });

<<<<<<< HEAD
  document.querySelectorAll('[data-toggle-section]').forEach(btn => {
    btn.addEventListener('click', () => toggleSection(btn.dataset.toggleSection));
  });

=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  document.querySelectorAll('[data-add-ingredient]').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.addIngredient;
      addIngredient(category);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeRecipeModal();
      closeSettingsModal();
    }
  });
}

async function initializeApp() {
<<<<<<< HEAD
  const siteResponse = await fetch('data/site.json').then(r => r.json());
  siteConfig = buildSiteConfig(siteResponse, readStoredSiteConfig());
  const { loadedRecipes, recipeFiles } = await loadRecipeFiles();

  recipeFileOptions = recipeFiles;
  recipes = loadedRecipes.map(recipe => normalizeRecipe(recipe)).filter(Boolean);
  pantryCounts = migratePantryStore(readJson(STORAGE_KEYS.pantry, {}));
  groceryItems = migrateGroceryStore(readJson(STORAGE_KEYS.grocery, []));
  mealPlan = migrateMealPlanStore(readJson(STORAGE_KEYS.mealPlan, []));
  sectionState = { ...sectionState, ...(readJson(STORAGE_KEYS.sections, {}) || {}) };
  currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || siteConfig.defaultTheme || 'citrus';

  enrichIngredientProfiles();
  applyBranding();
  applyTheme(currentTheme);
  populateRecipeFileFilter();
=======
  const [siteResponse, loadedRecipes] = await Promise.all([
    fetch('data/site.json').then(r => r.json()),
    loadRecipeFiles(),
  ]);

  siteConfig = buildSiteConfig(siteResponse, readStoredSiteConfig());
  recipes = loadedRecipes;
  pantryCounts = readJson(STORAGE_KEYS.pantry, {});
  groceryItems = readJson(STORAGE_KEYS.grocery, []);
  currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || siteConfig.defaultTheme || 'citrus';

  applyBranding();
  applyTheme(currentTheme);
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
  renderAll();
}

async function loadRecipeFiles() {
<<<<<<< HEAD
  try {
    const indexResponse = await fetch('data/recipes/recipe_index.json');
    if (!indexResponse.ok) throw new Error('missing recipe index');
    const recipeIndex = await indexResponse.json();
    const files = recipeIndex.files || [];
    const recipeFiles = files.map(fileName => ({
      value: fileName,
      label: humanizeRecipeFileName(fileName),
    }));

    const recipeFilePromises = files.map(async (fileName) => {
      const fileResponse = await fetch(`data/recipes/${fileName}`);
      const fileRecipes = await fileResponse.json();
      return fileRecipes.map(recipe => ({
        ...recipe,
        sourceFile: fileName,
        sourceLabel: humanizeRecipeFileName(fileName),
      }));
    });

    const loadedRecipeArrays = await Promise.all(recipeFilePromises);
    return { loadedRecipes: loadedRecipeArrays.flat(), recipeFiles };
  } catch {
    const fallbackRecipes = await fetch('data/recipes.json').then(r => r.json());
    return {
      loadedRecipes: fallbackRecipes.map(recipe => ({ ...recipe, sourceFile: 'recipes.json', sourceLabel: 'All recipes' })),
      recipeFiles: [{ value: 'recipes.json', label: 'All recipes' }],
    };
  }
}


function humanizeRecipeFileName(fileName) {
  return String(fileName || 'recipes')
    .replace(/\.json$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/recipes/i, '')
    .trim()
    .replace(/\w/g, char => char.toUpperCase()) || 'Recipes';
}

function populateRecipeFileFilter() {
  if (!el.recipeFileFilter) return;
  el.recipeFileFilter.innerHTML = '<option value="all">All recipe files</option>';

  recipeFileOptions.forEach(optionDef => {
    const option = document.createElement('option');
    option.value = optionDef.value;
    option.textContent = optionDef.label;
    option.selected = optionDef.value === activeRecipeFile;
    el.recipeFileFilter.appendChild(option);
  });
}

function onRecipeFileFilterChange() {
  activeRecipeFile = el.recipeFileFilter?.value || 'all';
  currentPage = 1;
  renderRecipes();
}

function normalizeRecipe(recipe) {
  if (!recipe || !recipe.id || !recipe.name) return null;

  const ingredientNames = getRecipeIngredientNames(recipe);
  const inferredItems = Array.isArray(recipe.groceryItems) && recipe.groceryItems.length
    ? recipe.groceryItems
    : deriveGroceryItemsFromLines(recipe.groceryList || [], ingredientNames);

  const normalizedItems = inferredItems.map((item, index) => normalizeGroceryItem(item, ingredientNames, recipe, index)).filter(Boolean);
  const pantryTrackableItems = normalizedItems.filter(item => item.trackPantry);

  return {
    ...recipe,
    servings: Number(recipe.servings) || 4,
    groceryItems: normalizedItems,
    pantryTrackableItems,
    ingredientNames,
  };
}

function deriveGroceryItemsFromLines(lines, ingredientNames) {
  return (lines || []).map((line) => {
    const parsed = parseIngredientLine(line);
    if (!parsed) {
      return { display: line };
    }
    const pantryKey = inferPantryKey(parsed.name, ingredientNames);
    return {
      quantity: parsed.quantity,
      unit: parsed.unit,
      name: parsed.name,
      pantryKey,
      display: line,
    };
  });
}

function normalizeGroceryItem(item, ingredientNames, recipe, index) {
  if (!item) return null;

  if (item.display && (item.quantity == null || !item.name)) {
    return {
      id: `${recipe.id}-display-${index}`,
      kind: 'display',
      display: item.display,
      trackPantry: false,
    };
  }

  const quantity = Number(item.quantity);
  const unit = normalizeUnit(item.unit || '');
  const name = String(item.name || item.display || '').trim();
  const pantryKey = item.pantryKey ? normalizeIngredient(item.pantryKey) : inferPantryKey(name, ingredientNames);
  const trackPantry = Boolean(pantryKey) && Number.isFinite(quantity);

  return {
    id: `${recipe.id}-${index}-${slugify(name || item.display || 'item')}`,
    kind: trackPantry ? 'structured' : 'display',
    quantity: Number.isFinite(quantity) ? quantity : null,
    unit,
    name,
    display: item.display || formatIngredientLine({
      quantity: Number.isFinite(quantity) ? quantity : null,
      unit,
      name,
    }),
    pantryKey,
    trackPantry,
  };
}

function parseIngredientLine(line) {
  const raw = String(line || '').trim();
  if (!raw) return null;
  if (!/^\d/.test(raw)) return null;

  const match = raw.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*(.*)$/);
  if (!match) return null;

  const quantity = parseNumber(match[1]);
  if (!Number.isFinite(quantity)) return null;

  let remainder = (match[2] || '').trim();
  if (!remainder) return null;

  const tokens = remainder.split(/\s+/);
  let unit = '';
  if (tokens.length) {
    const maybeUnit = normalizeUnit(tokens[0]);
    if (maybeUnit !== 'count' || /^(small|medium|large|lb|lbs|oz|ounce|ounces|cup|cups|tbsp|tablespoons?|tsp|teaspoons?|clove|cloves|can|cans|package|packages|packet|packets|slice|slices|bunch|bunches)$/i.test(tokens[0])) {
      unit = maybeUnit;
      remainder = tokens.slice(1).join(' ').trim();
    }
  }

  if (!remainder) return null;
  return { quantity, unit, name: remainder };
}

function inferPantryKey(text, ingredientNames = []) {
  const normalizedText = normalizeIngredient(text);
  if (!normalizedText) return '';

  const recipeCandidates = ingredientNames
    .map(name => ({ source: name, normalized: normalizeIngredient(name) }))
    .filter(item => item.normalized);

  const siteCandidates = CATEGORY_KEYS.flatMap(category => (siteConfig.ingredients?.[category] || []).map(item => ({
    source: item.name,
    normalized: normalizeIngredient(item.name),
  })));

  const allCandidates = [...recipeCandidates, ...siteCandidates];
  let best = null;

  allCandidates.forEach(candidate => {
    const score = scoreCandidateMatch(normalizedText, candidate.normalized);
    if (!score) return;
    if (!best || score > best.score || (score === best.score && candidate.normalized.length > best.normalized.length)) {
      best = { ...candidate, score };
    }
  });

  return best?.normalized || '';
}

function scoreCandidateMatch(text, candidate) {
  if (!text || !candidate) return 0;
  if (text === candidate) return 100;
  if (text.includes(candidate)) return 90 + candidate.length / 100;
  if (candidate.includes(text)) return 60 + text.length / 100;

  const textTokens = new Set(text.split(' '));
  const candidateTokens = candidate.split(' ');
  const overlap = candidateTokens.filter(token => textTokens.has(token));
  if (!overlap.length) return 0;

  return overlap.length * 10 + (overlap.join(' ').length / Math.max(candidate.length, 1));
}

function enrichIngredientProfiles() {
  const unitCounts = {};

  recipes.forEach(recipe => {
    (recipe.pantryTrackableItems || []).forEach(item => {
      if (!item.pantryKey) return;
      if (!unitCounts[item.pantryKey]) unitCounts[item.pantryKey] = {};
      unitCounts[item.pantryKey][item.unit] = (unitCounts[item.pantryKey][item.unit] || 0) + 1;
    });
  });

  CATEGORY_KEYS.forEach(category => {
    (siteConfig.ingredients?.[category] || []).forEach(item => {
      const key = normalizeIngredient(item.name);
      const counts = unitCounts[key] || {};
      const preferredUnit = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      item.pantryUnit = item.pantryUnit || preferredUnit || defaultUnitForCategory(category);
    });
  });
}

function defaultUnitForCategory(category) {
  if (category === 'meats') return 'lb';
  if (category === 'veggies') return 'count';
  if (category === 'grains') return 'cup';
  return 'count';
}

function buildSiteConfig(defaults, stored) {
  const merged = structuredClone(defaults);
  if (!stored) return merged;

  if (stored.branding) {
    merged.branding.title = stored.branding.title || merged.branding.title;
    merged.branding.tagline = stored.branding.tagline || merged.branding.tagline;
  }

  CATEGORY_KEYS.forEach(category => {
    const defaultList = Array.isArray(defaults.ingredients?.[category]) ? defaults.ingredients[category] : [];
    const storedList = Array.isArray(stored.ingredients?.[category]) ? stored.ingredients[category] : null;
    if (storedList) {
      merged.ingredients[category] = storedList.map(item => ({
        id: item.id || slugify(item.name),
        name: item.name,
        pantryUnit: item.pantryUnit || item.unit || '',
      }));
    } else {
      merged.ingredients[category] = defaultList;
    }
  });

  return merged;
}

function readStoredSiteConfig() {
  return readJson(STORAGE_KEYS.site, null);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function migratePantryStore(store) {
  const next = {};
  Object.entries(store || {}).forEach(([key, value]) => {
    if (typeof value === 'number') next[key] = value;
    else if (value && typeof value.amount === 'number') next[key] = value.amount;
  });
  return next;
}

function migrateGroceryStore(store) {
  const items = Array.isArray(store) ? store : [];
  return items.map(item => {
    if (item && item.kind) return item;
    if (item && item.text) {
      return {
        kind: 'manual',
        text: item.text,
        recipeIds: item.recipeId ? [item.recipeId] : [],
        recipeNames: item.recipeName ? [item.recipeName] : [],
      };
    }
    return null;
  }).filter(Boolean);
}

function migrateMealPlanStore(store) {
  const items = Array.isArray(store) ? store : [];
  return items
    .map(item => ({
      recipeId: item.recipeId,
      servings: Number(item.servings) || 0,
    }))
    .filter(item => item.recipeId);
}

function persistSiteConfig() {
  localStorage.setItem(STORAGE_KEYS.site, JSON.stringify({
    branding: siteConfig.branding,
    ingredients: siteConfig.ingredients,
  }));
}

function persistPantry() {
  localStorage.setItem(STORAGE_KEYS.pantry, JSON.stringify(pantryCounts));
}

function persistGrocery() {
  localStorage.setItem(STORAGE_KEYS.grocery, JSON.stringify(groceryItems));
}

function persistMealPlan() {
  localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(mealPlan));
}

function applyBranding() {
  el.appTitle.textContent = siteConfig.branding.title;
  el.appTagline.textContent = siteConfig.branding.tagline;
}

function applyTheme(themeId) {
  document.body.className = '';
  if (themeId && themeId !== 'citrus') {
    document.body.classList.add(`theme-${themeId}`);
  }
  currentTheme = themeId;
  localStorage.setItem(STORAGE_KEYS.theme, themeId);
}

function renderAll() {
  renderIngredientChips();
  renderRecipes();
  renderGroceryList();
  renderMealPlan();
  renderSettingsForm();
  renderSectionState();
}

function persistSectionState() {
  localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(sectionState));
}

function toggleSection(sectionKey) {
  sectionState[sectionKey] = !sectionState[sectionKey];
  persistSectionState();
  renderSectionState();
}

function renderSectionState() {
  const layout = document.querySelector('.layout');

  document.querySelectorAll('[data-section]').forEach(section => {
    const key = section.dataset.section;
    const collapsed = Boolean(sectionState[key]);
    section.classList.toggle('collapsed', collapsed);
    section.classList.toggle('expanded', !collapsed);
  });

  if (layout) {
    layout.classList.toggle('recipes-collapsed', Boolean(sectionState.recipes));
  }

  document.querySelectorAll('[data-toggle-section]').forEach(btn => {
    const key = btn.dataset.toggleSection;
    const collapsed = Boolean(sectionState[key]);
    const labelMap = {
      recipes: 'recipes',
      ingredients: 'ingredients',
      shopping: 'grocery list',
      'meal-plan': 'meal plan',
    };
    const sectionLabel = labelMap[key] || 'section';
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('aria-label', `${collapsed ? 'Expand' : 'Collapse'} ${sectionLabel}`);
    btn.setAttribute('title', `${collapsed ? 'Expand' : 'Collapse'} ${sectionLabel}`);
  });
}

function renderIngredientChips() {
  renderChipGroup('meats', el.meatChips);
  renderChipGroup('veggies', el.veggieChips);
  renderChipGroup('grains', el.grainChips);
}

function renderChipGroup(category, container) {
  const items = siteConfig.ingredients?.[category] || [];
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="empty-state small-empty">No ingredients added yet.</div>';
    return;
  }

  const hint = document.createElement('div');
  hint.className = 'settings-help';
  hint.textContent = 'Tap to cycle quantity. Counts should match the unit hint when possible.';
  container.appendChild(hint);

  items.forEach(item => {
    const key = normalizeIngredient(item.name);
    const qty = pantryCounts[key] || 0;
    const unitHint = item.pantryUnit ? ` • ${item.pantryUnit}` : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${qty > 0 ? ' active' : ''}`;
    btn.textContent = qty > 0 ? `${item.name} (${formatAmount(qty)}${unitHint})` : `${item.name}${unitHint}`;
    btn.addEventListener('click', () => {
      const nextQty = qty >= 9 ? 0 : qty + 1;
      if (nextQty === 0) delete pantryCounts[key];
      else pantryCounts[key] = nextQty;
      persistPantry();
      currentPage = 1;
      renderAll();
    });
    container.appendChild(btn);
  });
}

function getScoredRecipes() {
  return recipes
    .map(recipe => scoreRecipe(recipe))
    .sort((a, b) => {
      if (b.haveAll !== a.haveAll) return Number(b.haveAll) - Number(a.haveAll);
      if (b.coveragePct !== a.coveragePct) return b.coveragePct - a.coveragePct;
      if (a.totalMissingAmount !== b.totalMissingAmount) return a.totalMissingAmount - b.totalMissingAmount;
      return a.recipe.name.localeCompare(b.recipe.name);
    });
}

function scoreRecipe(recipe, servings = recipe.servings) {
  const scale = (Number(servings) || recipe.servings || 4) / (recipe.servings || 4);
  const shortages = (recipe.pantryTrackableItems || []).map(item => getItemShortage(item, scale));

  const trackedCount = shortages.length;
  const coveredCount = shortages.filter(item => item.missing <= 0).length;
  const partialCount = shortages.filter(item => item.have > 0 && item.missing > 0).length;
  const missingCount = shortages.filter(item => item.missing > 0).length;
  const totalMissingAmount = shortages.reduce((sum, item) => sum + item.missing, 0);
  const haveAll = trackedCount > 0 && missingCount === 0;
  const coveragePct = trackedCount ? coveredCount / trackedCount : 0;

  return {
    recipe,
    totalCount: trackedCount,
    matchedCount: coveredCount,
    partialCount,
    missingCount,
    haveAll,
    coveragePct,
    totalMissingAmount,
    shortages,
  };
}

function renderRecipes() {
  const allScoredRecipes = getScoredRecipes();
  const scoredRecipes = activeRecipeFile === 'all'
    ? allScoredRecipes
    : allScoredRecipes.filter(({ recipe }) => recipe.sourceFile === activeRecipeFile);
  const total = scoredRecipes.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const activeFilterLabel = activeRecipeFile === 'all'
    ? 'All recipe files'
    : (recipeFileOptions.find(option => option.value === activeRecipeFile)?.label || 'Filtered recipes');
  el.resultsCount.textContent = `${total} recipe${total === 1 ? '' : 's'} • ${activeFilterLabel}`;
  const selectedCount = Object.values(pantryCounts).filter(count => count > 0).length;
  el.matchSummary.textContent = selectedCount
    ? `You marked ${selectedCount} ingredient${selectedCount === 1 ? '' : 's'} on hand. Cards now score by quantity coverage, not just yes or no.`
    : 'Pick ingredients on the right to prioritize recipes and estimate what you are short for each one.';

  const pageItems = scoredRecipes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  el.recipeList.innerHTML = '';

  if (!pageItems.length) {
    el.recipeList.innerHTML = '<div class="empty-state">No recipes found.</div>';
    renderPagination(totalPages);
    return;
  }

  pageItems.forEach(({ recipe, matchedCount, totalCount, missingCount, partialCount, haveAll, shortages }) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    const titleRow = document.createElement('div');
    titleRow.className = 'recipe-title-row';

    const totalShort = shortages.reduce((sum, item) => sum + item.missing, 0);
    const inPlan = isRecipePlanned(recipe.id);

    titleRow.innerHTML = `
      <div>
        <h3>${escapeHtml(recipe.name)}</h3>
      </div>
      <div class="meta-tags">
        ${haveAll ? '<span class="have-it-pill">Have it</span>' : ''}
        ${partialCount ? `<span class="ready-pill manual">Partial ${partialCount}</span>` : ''}
        <span class="score-pill">Covered ${matchedCount}/${totalCount || 0}</span>
        ${missingCount ? `<span class="missing-pill">Short ${formatAmount(totalShort)}</span>` : ''}
        ${inPlan ? '<span class="list-count-pill">Planned</span>' : ''}
      </div>
    `;

    const meta = document.createElement('div');
    meta.className = 'recipe-meta';
    meta.innerHTML = `
      <span class="meta-tag">${escapeHtml(recipe.time || '—')}</span>
      <span class="meta-tag">${escapeHtml(recipe.difficulty || '—')}</span>
      <span class="meta-tag">Serves ${Number(recipe.servings) || 4}</span>
      <span class="meta-tag">${escapeHtml(recipe.sourceLabel || 'Recipes')}</span>
    `;

    const desc = document.createElement('p');
    desc.className = 'recipe-desc';
    desc.textContent = recipe.description || 'No description available.';

    const actions = document.createElement('div');
    actions.className = 'recipe-actions';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'recipe-btn';
    viewBtn.textContent = 'View recipe';
    viewBtn.addEventListener('click', () => openRecipeModal(recipe));

    const planBtn = document.createElement('button');
    planBtn.type = 'button';
    planBtn.className = `${inPlan ? 'ghost-btn is-added-btn' : 'ghost-btn'} small-btn`;
    planBtn.textContent = inPlan ? 'Planned' : 'Plan meal';
    planBtn.addEventListener('click', () => {
      toggleMealPlanRecipe(recipe.id, recipe.servings);
    });

    actions.append(viewBtn, planBtn);
    card.append(titleRow, meta, desc, actions);
    el.recipeList.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  el.recipePagination.innerHTML = '';
  if (totalPages <= 1) {
    el.recipePagination.classList.remove('active');
    return;
  }

  el.recipePagination.classList.add('active');

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'ghost-btn small-btn';
  prev.textContent = 'Previous';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const pages = document.createElement('div');
  pages.className = 'pagination-pages';
  for (let page = 1; page <= totalPages; page += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = `page-btn${page === currentPage ? ' active' : ''}`;
    pageBtn.textContent = String(page);
    pageBtn.addEventListener('click', () => {
      currentPage = page;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pages.appendChild(pageBtn);
  }

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'ghost-btn small-btn';
  next.textContent = 'Next';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  el.recipePagination.append(prev, pages, next);
}

function openRecipeModal(recipe) {
  activeRecipe = recipe;
  const planned = mealPlan.find(item => item.recipeId === recipe.id);
  activeRecipeServings = planned?.servings || Number(recipe.servings) || 4;
  el.recipeModal.classList.remove('hidden');
  el.recipeModal.setAttribute('aria-hidden', 'false');
  setRecipeModalTab('grocery');
  renderRecipeModal();
}

function closeRecipeModal() {
  el.recipeModal.classList.add('hidden');
  el.recipeModal.setAttribute('aria-hidden', 'true');
}

function setRecipeModalTab(tabName) {
  document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  el.tabGrocery.classList.toggle('active', tabName === 'grocery');
  el.tabDirections.classList.toggle('active', tabName === 'directions');
}

function renderRecipeModal() {
  if (!activeRecipe) return;

  el.modalTitle.textContent = activeRecipe.name;
  el.modalMeta.innerHTML = `
    <div class="recipe-meta">
      <span class="meta-tag">${escapeHtml(activeRecipe.time || '—')}</span>
      <span class="meta-tag">${escapeHtml(activeRecipe.difficulty || '—')}</span>
      <span class="meta-tag">Base serves ${Number(activeRecipe.servings) || 4}</span>
    </div>
  `;

  const baseServings = Number(activeRecipe.servings) || 4;
  const scale = activeRecipeServings / baseServings;

  el.tabGrocery.innerHTML = '';

  const servingsRow = document.createElement('div');
  servingsRow.className = 'servings-row';
  servingsRow.innerHTML = `
    <div>
      <strong>Serving size</strong>
      <div class="have-it-text">Base recipe serves ${baseServings}. Pantry and grocery math updates to match.</div>
    </div>
  `;

  const servingsSelect = document.createElement('select');
  servingsSelect.className = 'servings-select';
  for (let i = 1; i <= 12; i += 1) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = String(i);
    option.selected = i === activeRecipeServings;
    servingsSelect.appendChild(option);
  }
  servingsSelect.addEventListener('change', () => {
    activeRecipeServings = Number(servingsSelect.value);
    const planEntry = mealPlan.find(item => item.recipeId === activeRecipe.id);
    if (planEntry) {
      planEntry.servings = activeRecipeServings;
      persistMealPlan();
      renderMealPlan();
      renderRecipes();
    }
    renderRecipeModal();
  });
  servingsRow.appendChild(servingsSelect);
  el.tabGrocery.appendChild(servingsRow);

  const tabActions = document.createElement('div');
  tabActions.className = 'tab-actions-row';

  const addAllBtn = document.createElement('button');
  addAllBtn.type = 'button';
  addAllBtn.className = 'primary-btn small-btn';
  addAllBtn.textContent = 'Add missing to grocery list';
  addAllBtn.addEventListener('click', () => addRecipeNeededItemsToGrocery(activeRecipe, scale));

  const inPlan = isRecipePlanned(activeRecipe.id);
  const planBtn = document.createElement('button');
  planBtn.type = 'button';
  planBtn.className = `${inPlan ? 'ghost-btn is-added-btn' : 'ghost-btn'} small-btn`;
  planBtn.textContent = inPlan ? 'Remove from meal plan' : 'Add to meal plan';
  planBtn.addEventListener('click', () => {
    toggleMealPlanRecipe(activeRecipe.id, activeRecipeServings);
    renderRecipeModal();
  });

  tabActions.append(addAllBtn, planBtn);
  el.tabGrocery.appendChild(tabActions);

  const list = document.createElement('ul');
  list.className = 'action-ingredients-list';

  (activeRecipe.groceryItems || []).forEach((itemDef) => {
    const shortage = itemDef.trackPantry ? getItemShortage(itemDef, scale) : null;
    const statusClass = !shortage
      ? ''
      : shortage.missing <= 0
        ? ' have-it'
        : shortage.have > 0
          ? ' partial-have'
          : ' need-buy';

    const item = document.createElement('li');
    item.className = `ingredient-action-item${statusClass}`;

    const lineWrap = document.createElement('div');
    lineWrap.className = 'ingredient-line-text';

    let helperLine = '';
    let statusPill = '';
    if (shortage) {
      const scaledText = formatIngredientLine({
        quantity: shortage.needed,
        unit: shortage.unit,
        name: itemDef.name,
      });

      helperLine = `
        <div class="settings-help">
          Need ${escapeHtml(formatAmount(shortage.needed))} ${escapeHtml(shortage.unit || 'unit')} • Have ${escapeHtml(formatAmount(shortage.have))} • Short ${escapeHtml(formatAmount(shortage.missing))}
        </div>
      `;

      if (shortage.missing <= 0) statusPill = '<span class="have-it-pill">Have it</span>';
      else if (shortage.have > 0) statusPill = `<span class="have-it-pill status-partial">Need ${escapeHtml(formatAmount(shortage.missing))} more</span>`;
      else statusPill = `<span class="have-it-pill status-need">Need ${escapeHtml(formatAmount(shortage.needed))}</span>`;

      lineWrap.innerHTML = `
        <div class="ingredient-line-main">
          <span>${escapeHtml(scaledText)}</span>
          ${statusPill}
        </div>
        ${helperLine}
      `;
    } else {
      lineWrap.innerHTML = `
        <div class="ingredient-line-main">
          <span>${escapeHtml(itemDef.display || itemDef.name)}</span>
          <span class="ready-pill manual">Manual item</span>
        </div>
      `;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    const exists = itemDef.trackPantry
      ? groceryItems.some(entry => entry.kind === 'structured' && entry.recipeIds?.includes(activeRecipe.id) && entry.pantryKey === itemDef.pantryKey)
      : groceryItems.some(entry => entry.kind === 'manual' && entry.recipeIds?.includes(activeRecipe.id) && entry.text === (itemDef.display || itemDef.name));

    btn.className = `${exists ? 'ghost-btn is-added-btn' : 'ghost-btn'} small-btn`;

    if (shortage) {
      if (shortage.missing <= 0) {
        btn.textContent = exists ? 'Added' : 'Covered';
        btn.disabled = !exists;
      } else {
        btn.textContent = exists ? 'Added' : 'Add missing';
      }

      btn.addEventListener('click', () => {
        if (shortage.missing > 0) addStructuredGroceryItem(activeRecipe, shortage);
        renderRecipeModal();
        renderGroceryList();
      });
    } else {
      btn.textContent = exists ? 'Added' : 'Add';
      btn.addEventListener('click', () => {
        addManualGroceryItem(activeRecipe, itemDef.display || itemDef.name);
        renderRecipeModal();
        renderGroceryList();
      });
    }

    item.append(lineWrap, btn);
    list.appendChild(item);
  });

  el.tabGrocery.appendChild(list);

  const directionsList = document.createElement('ol');
  directionsList.className = 'directions-list';
  (activeRecipe.directions || []).forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    directionsList.appendChild(li);
  });
  el.tabDirections.innerHTML = '';
  el.tabDirections.appendChild(directionsList);
}

function getItemShortage(item, scale = 1, remainingPool = null) {
  const needed = roundAmount((Number(item.quantity) || 0) * scale);
  const source = remainingPool || pantryCounts;
  const have = Number(source[normalizeIngredient(item.pantryKey)] || 0);
  const missing = roundAmount(Math.max(0, needed - have));
  return {
    pantryKey: item.pantryKey,
    name: item.name,
    unit: item.unit || 'count',
    needed,
    have,
    missing,
    covered: missing <= 0,
  };
}

function addStructuredGroceryItem(recipe, shortage) {
  if (!shortage || shortage.missing <= 0) return;

  const existing = groceryItems.find(entry =>
    entry.kind === 'structured'
    && entry.pantryKey === shortage.pantryKey
    && normalizeUnit(entry.unit) === normalizeUnit(shortage.unit)
  );

  if (existing) {
    existing.quantity = roundAmount(existing.quantity + shortage.missing);
    existing.recipeIds = uniqueArray([...(existing.recipeIds || []), recipe.id]);
    existing.recipeNames = uniqueArray([...(existing.recipeNames || []), recipe.name]);
  } else {
    groceryItems.push({
      kind: 'structured',
      pantryKey: shortage.pantryKey,
      name: shortage.name,
      quantity: shortage.missing,
      unit: normalizeUnit(shortage.unit),
      recipeIds: [recipe.id],
      recipeNames: [recipe.name],
    });
  }

  persistGrocery();
}

function addManualGroceryItem(recipe, text) {
  const existing = groceryItems.find(entry => entry.kind === 'manual' && entry.text === text);
  if (existing) {
    existing.recipeIds = uniqueArray([...(existing.recipeIds || []), recipe.id]);
    existing.recipeNames = uniqueArray([...(existing.recipeNames || []), recipe.name]);
  } else {
    groceryItems.push({
      kind: 'manual',
      text,
      recipeIds: [recipe.id],
      recipeNames: [recipe.name],
    });
  }
  persistGrocery();
}

function addRecipeNeededItemsToGrocery(recipe, scale = 1) {
  let addedAnyItems = false;

  (recipe.groceryItems || []).forEach(item => {
    if (item.trackPantry) {
      const shortage = getItemShortage(item, scale);
      if (shortage.missing > 0) {
        addStructuredGroceryItem(recipe, shortage);
        addedAnyItems = true;
      }
    } else {
      addManualGroceryItem(recipe, item.display || item.name);
      addedAnyItems = true;
    }
  });

  if (addedAnyItems && !isRecipePlanned(recipe.id)) {
    mealPlan.push({ recipeId: recipe.id, servings: Math.max(1, Math.round(activeRecipeServings || recipe.servings || 4)) });
    persistMealPlan();
    renderMealPlan();
    renderRecipes();
  }

  persistGrocery();
  renderGroceryList();
  if (activeRecipe) renderRecipeModal();
}

function renderGroceryList() {
  el.groceryList.innerHTML = '';
  const recipeNames = [...new Set(groceryItems.flatMap(item => item.recipeNames || []))];
  el.groceryRecipeSummary.textContent = groceryItems.length
    ? `${groceryItems.length} line${groceryItems.length === 1 ? '' : 's'} from ${recipeNames.length} recipe${recipeNames.length === 1 ? '' : 's'}. Structured items merge automatically by ingredient.`
    : 'No grocery items added yet.';

  if (!groceryItems.length) {
    el.groceryList.innerHTML = '<div class="empty-state small-empty">Your grocery list is empty.</div>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'shopping-list';
  groceryItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'shopping-item';

    const left = document.createElement('div');
    left.className = 'shopping-text';

    if (item.kind === 'structured') {
      left.innerHTML = `
        <strong>${escapeHtml(formatIngredientLine(item))}</strong>
        <div class="settings-help">${escapeHtml((item.recipeNames || []).join(', '))}</div>
      `;
    } else {
      left.innerHTML = `
        <strong>${escapeHtml(item.text)}</strong>
        <div class="settings-help">${escapeHtml((item.recipeNames || []).join(', '))}</div>
      `;
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ghost-btn small-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      groceryItems.splice(index, 1);
      persistGrocery();
      renderGroceryList();
      if (activeRecipe) renderRecipeModal();
    });

    li.append(left, removeBtn);
    list.appendChild(li);
  });

  el.groceryList.appendChild(list);
}

async function copyShoppingList() {
  const lines = groceryItems.length
    ? groceryItems.map(item => {
      if (item.kind === 'structured') return `• ${formatIngredientLine(item)} (${(item.recipeNames || []).join(', ')})`;
      return `• ${item.text} (${(item.recipeNames || []).join(', ')})`;
    })
    : ['No grocery items added yet.'];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
  } catch {
    // ignore clipboard failures
  }
}

function toggleMealPlanRecipe(recipeId, servings) {
  const existingIndex = mealPlan.findIndex(item => item.recipeId === recipeId);
  if (existingIndex >= 0) {
    mealPlan.splice(existingIndex, 1);
  } else {
    mealPlan.push({ recipeId, servings: Number(servings) || findRecipeById(recipeId)?.servings || 4 });
  }
  persistMealPlan();
  renderMealPlan();
  renderRecipes();
}

function isRecipePlanned(recipeId) {
  return mealPlan.some(item => item.recipeId === recipeId);
}

function findRecipeById(recipeId) {
  return recipes.find(recipe => recipe.id === recipeId) || null;
}

function buildMealPlanShortages() {
  const remaining = { ...pantryCounts };
  const shortages = {};
  const planRecipes = [];

  mealPlan.forEach(planItem => {
    const recipe = findRecipeById(planItem.recipeId);
    if (!recipe) return;
    const scale = (Number(planItem.servings) || recipe.servings || 4) / (recipe.servings || 4);
    planRecipes.push({ recipe, servings: Number(planItem.servings) || recipe.servings || 4 });

    (recipe.pantryTrackableItems || []).forEach(item => {
      const key = normalizeIngredient(item.pantryKey);
      const needed = roundAmount((Number(item.quantity) || 0) * scale);
      const available = Number(remaining[key] || 0);
      const used = Math.min(available, needed);
      const missing = roundAmount(Math.max(0, needed - available));

      remaining[key] = roundAmount(Math.max(0, available - needed));

      if (missing > 0) {
        if (!shortages[key]) {
          shortages[key] = {
            kind: 'structured',
            pantryKey: item.pantryKey,
            name: item.name,
            quantity: 0,
            unit: item.unit || 'count',
            recipeNames: [],
          };
        }
        shortages[key].quantity = roundAmount(shortages[key].quantity + missing);
        shortages[key].recipeNames = uniqueArray([...shortages[key].recipeNames, recipe.name]);
      }

      if (!shortages[`__usage__${recipe.id}`]) shortages[`__usage__${recipe.id}`] = [];
      shortages[`__usage__${recipe.id}`].push({
        pantryKey: key,
        name: item.name,
        unit: item.unit || 'count',
        needed,
        used,
        missing,
      });
    });
  });

  return {
    missingItems: Object.values(shortages).filter(item => item && item.kind === 'structured'),
    usageByRecipe: shortages,
    remaining,
    planRecipes,
  };
}

function renderMealPlan() {
  if (!el.mealPlanList || !el.mealPlanSummary || !el.mealPlanShopping) return;

  el.mealPlanList.innerHTML = '';
  el.mealPlanShopping.innerHTML = '';

  const summary = buildMealPlanShortages();
  el.mealPlanSummary.textContent = mealPlan.length
    ? `${mealPlan.length} meal${mealPlan.length === 1 ? '' : 's'} planned. Shortages are calculated against one shared pantry pool.`
    : 'No meals planned yet. Add recipes to see true week-level shortages.';

  if (!mealPlan.length) {
    el.mealPlanList.innerHTML = '<div class="empty-state small-empty">Plan recipes from a card or from the recipe modal.</div>';
    el.mealPlanShopping.innerHTML = '<div class="empty-state small-empty">Plan shortages will show up here.</div>';
    return;
  }

  const planList = document.createElement('ul');
  planList.className = 'shopping-list';

  mealPlan.forEach((planItem, index) => {
    const recipe = findRecipeById(planItem.recipeId);
    if (!recipe) return;

    const li = document.createElement('li');
    li.className = 'shopping-item';

    const left = document.createElement('div');
    left.className = 'shopping-text';
    left.innerHTML = `<strong>${escapeHtml(recipe.name)}</strong><div class="settings-help">Planned for ${escapeHtml(String(planItem.servings))} serving${planItem.servings === 1 ? '' : 's'}</div>`;

    const right = document.createElement('div');
    right.className = 'meal-plan-actions';

    const select = document.createElement('select');
    select.className = 'servings-select';
    for (let i = 1; i <= 12; i += 1) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `${i} servings`;
      option.selected = i === planItem.servings;
      select.appendChild(option);
    }
    select.addEventListener('change', () => {
      mealPlan[index].servings = Number(select.value);
      persistMealPlan();
      renderMealPlan();
      renderRecipes();
      if (activeRecipe?.id === recipe.id) {
        activeRecipeServings = Number(select.value);
        renderRecipeModal();
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ghost-btn small-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      mealPlan.splice(index, 1);
      persistMealPlan();
      renderMealPlan();
      renderRecipes();
      if (activeRecipe?.id === recipe.id) renderRecipeModal();
    });

    right.append(select, removeBtn);
    li.append(left, right);
    planList.appendChild(li);
  });

  el.mealPlanList.appendChild(planList);

  if (!summary.missingItems.length) {
    el.mealPlanShopping.innerHTML = '<div class="empty-state small-empty">Your current pantry covers the planned meals.</div>';
    return;
  }

  const shortageList = document.createElement('ul');
  shortageList.className = 'shopping-list';

  summary.missingItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'shopping-item';

    const left = document.createElement('div');
    left.className = 'shopping-text';
    left.innerHTML = `<strong>${escapeHtml(formatIngredientLine(item))}</strong><div class="settings-help">${escapeHtml(item.recipeNames.join(', '))}</div>`;

    li.append(left);
    shortageList.appendChild(li);
  });

  el.mealPlanShopping.appendChild(shortageList);
}

function addMealPlanShortagesToGrocery() {
  const summary = buildMealPlanShortages();
  summary.missingItems.forEach(item => {
    const matchingEntries = groceryItems.filter(entry =>
      entry.kind === 'structured'
      && entry.pantryKey === item.pantryKey
      && normalizeUnit(entry.unit) === normalizeUnit(item.unit)
    );

    const existingMealPlanEntry = matchingEntries.find(entry => entry.fromMealPlan);
    const existingManualEntry = matchingEntries.find(entry => !entry.fromMealPlan);

    if (existingMealPlanEntry) {
      existingMealPlanEntry.quantity = item.quantity;
      existingMealPlanEntry.recipeNames = item.recipeNames || [];
      existingMealPlanEntry.recipeIds = mealPlan.map(p => p.recipeId);
    } else if (existingManualEntry) {
      existingManualEntry.quantity = roundAmount(existingManualEntry.quantity + item.quantity);
      existingManualEntry.recipeNames = uniqueArray([...(existingManualEntry.recipeNames || []), ...(item.recipeNames || [])]);
      existingManualEntry.recipeIds = uniqueArray([...(existingManualEntry.recipeIds || []), ...mealPlan.map(p => p.recipeId)]);
    } else {
      groceryItems.push({
        ...item,
        recipeNames: item.recipeNames || [],
        recipeIds: mealPlan.map(p => p.recipeId),
        fromMealPlan: true,
      });
    }
  });

  persistGrocery();
  renderGroceryList();
}

function openSettingsModal() {
  renderSettingsForm();
  el.settingsModal.classList.remove('hidden');
  el.settingsModal.setAttribute('aria-hidden', 'false');
  setSettingsTab('general');
}

function closeSettingsModal() {
  el.settingsModal.classList.add('hidden');
  el.settingsModal.setAttribute('aria-hidden', 'true');
}

function setSettingsTab(tabName) {
  document.querySelectorAll('.settings-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.settingsTab === tabName);
  });
  document.querySelectorAll('.settings-page').forEach(page => {
    page.classList.toggle('active', page.dataset.settingsPage === tabName);
  });
}

function renderSettingsForm() {
  el.titleInput.value = siteConfig.branding.title || '';
  el.taglineInput.value = siteConfig.branding.tagline || '';

  el.themeOptions.innerHTML = '';
  (siteConfig.themes || []).forEach(theme => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `theme-btn${theme.id === currentTheme ? ' active' : ''}`;
    btn.textContent = theme.name;
    btn.addEventListener('click', () => {
      applyTheme(theme.id);
      renderSettingsForm();
    });
    el.themeOptions.appendChild(btn);
  });

  renderManageList('meats', el.manageMeats);
  renderManageList('veggies', el.manageVeggies);
  renderManageList('grains', el.manageGrains);
}

function renderManageList(category, container) {
  const items = siteConfig.ingredients?.[category] || [];
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="empty-state small-empty">No items yet.</div>';
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'manage-row';

    const name = document.createElement('strong');
    name.textContent = item.pantryUnit ? `${item.name} • ${item.pantryUnit}` : item.name;

    const actions = document.createElement('div');
    actions.className = 'topbar-actions';

    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.className = 'ghost-btn small-btn';
    renameBtn.textContent = 'Rename';
    renameBtn.addEventListener('click', () => {
      const nextName = window.prompt(`Rename ${item.name}`, item.name)?.trim();
      if (!nextName) return;
      siteConfig.ingredients[category][index] = { ...item, id: slugify(nextName), name: nextName };
      persistSiteConfig();
      renderAll();
    });

    const unitBtn = document.createElement('button');
    unitBtn.type = 'button';
    unitBtn.className = 'ghost-btn small-btn';
    unitBtn.textContent = 'Unit';
    unitBtn.addEventListener('click', () => {
      const nextUnit = window.prompt(`Pantry unit hint for ${item.name}`, item.pantryUnit || defaultUnitForCategory(category))?.trim();
      if (!nextUnit) return;
      siteConfig.ingredients[category][index] = { ...item, pantryUnit: normalizeUnit(nextUnit) };
      persistSiteConfig();
      renderAll();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ghost-btn small-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      const removed = siteConfig.ingredients[category].splice(index, 1)[0];
      if (removed) delete pantryCounts[normalizeIngredient(removed.name)];
      persistSiteConfig();
      persistPantry();
      renderAll();
    });

    actions.append(renameBtn, unitBtn, removeBtn);
    row.append(name, actions);
    container.appendChild(row);
  });
}

function addIngredient(category) {
  const input = document.getElementById(`add-${category}-input`);
  const value = input?.value?.trim();
  if (!value) return;

  const exists = (siteConfig.ingredients?.[category] || []).some(item => normalizeIngredient(item.name) === normalizeIngredient(value));
  if (exists) {
    input.value = '';
    return;
  }

  siteConfig.ingredients[category].push({
    id: slugify(value),
    name: toTitleCase(value),
    pantryUnit: defaultUnitForCategory(category),
  });
  siteConfig.ingredients[category].sort((a, b) => a.name.localeCompare(b.name));
  input.value = '';
  persistSiteConfig();
  renderAll();
}

function saveSettings() {
  siteConfig.branding.title = el.titleInput.value.trim() || 'What the !#$%&@ is for Dinner?';
  siteConfig.branding.tagline = el.taglineInput.value.trim() || 'Tonight’s plan starts here';
  persistSiteConfig();
  applyBranding();
  renderAll();
  closeSettingsModal();
}

function resetSettings() {
  localStorage.removeItem(STORAGE_KEYS.site);
  localStorage.removeItem(STORAGE_KEYS.theme);
  localStorage.removeItem(STORAGE_KEYS.pantry);
  localStorage.removeItem(STORAGE_KEYS.grocery);
  localStorage.removeItem(STORAGE_KEYS.mealPlan);
  pantryCounts = {};
  groceryItems = [];
  mealPlan = [];

  fetch('data/site.json')
    .then(r => r.json())
    .then(defaultConfig => {
      siteConfig = buildSiteConfig(defaultConfig, null);
      enrichIngredientProfiles();
      applyTheme(siteConfig.defaultTheme || 'citrus');
      applyBranding();
      renderAll();
    });
}

function getRecipeIngredientNames(recipe) {
  const names = [];
  CATEGORY_KEYS.forEach(category => {
    const items = Array.isArray(recipe.ingredients?.[category]) ? recipe.ingredients[category] : [];
    items.forEach(item => names.push(item));
  });
  return uniqueArray(names);
}

function normalizeIngredient(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(cloves?|cups?|tbsp|tablespoons?|tsp|teaspoons?|lb|lbs|oz|ounces?|medium|small|large)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s$/, '');
}

function normalizeUnit(unit) {
  const clean = String(unit || '').trim().toLowerCase();
  return UNIT_ALIASES[clean] || clean;
}

function parseNumber(text) {
  const clean = String(text).trim();
  if (/^\d+\s+\d+\/\d+$/.test(clean)) {
    const [whole, fraction] = clean.split(/\s+/);
    return Number(whole) + parseNumber(fraction);
  }
  if (/^\d+\/\d+$/.test(clean)) {
    const [num, den] = clean.split('/').map(Number);
    return den ? num / den : NaN;
  }
  return Number(clean);
}

=======
  const indexResponse = await fetch('data/recipes/recipe_index.json');
  const recipeIndex = await indexResponse.json();
  const files = recipeIndex.files || [];

  const recipeFilePromises = files.map(async (fileName) => {
    const fileResponse = await fetch(`data/recipes/${fileName}`);
    return fileResponse.json();
  });

  const loadedRecipeArrays = await Promise.all(recipeFilePromises);
  return loadedRecipeArrays.flat();
}

function buildSiteConfig(defaults, stored) {
  const merged = structuredClone(defaults);
  if (!stored) return merged;

  if (stored.branding) {
    merged.branding.title = stored.branding.title || merged.branding.title;
    merged.branding.tagline = stored.branding.tagline || merged.branding.tagline;
  }

  CATEGORY_KEYS.forEach(category => {
    const defaultList = Array.isArray(defaults.ingredients?.[category]) ? defaults.ingredients[category] : [];
    const storedList = Array.isArray(stored.ingredients?.[category]) ? stored.ingredients[category] : null;
    if (storedList) {
      merged.ingredients[category] = storedList.map(item => ({
        id: item.id || slugify(item.name),
        name: item.name,
      }));
    } else {
      merged.ingredients[category] = defaultList;
    }
  });

  return merged;
}

function readStoredSiteConfig() {
  return readJson(STORAGE_KEYS.site, null);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistSiteConfig() {
  localStorage.setItem(STORAGE_KEYS.site, JSON.stringify({
    branding: siteConfig.branding,
    ingredients: siteConfig.ingredients,
  }));
}

function persistPantry() {
  localStorage.setItem(STORAGE_KEYS.pantry, JSON.stringify(pantryCounts));
}

function persistGrocery() {
  localStorage.setItem(STORAGE_KEYS.grocery, JSON.stringify(groceryItems));
}

function applyBranding() {
  el.appTitle.textContent = siteConfig.branding.title;
  el.appTagline.textContent = siteConfig.branding.tagline;
}

function applyTheme(themeId) {
  document.body.className = '';
  if (themeId && themeId !== 'citrus') {
    document.body.classList.add(`theme-${themeId}`);
  }
  currentTheme = themeId;
  localStorage.setItem(STORAGE_KEYS.theme, themeId);
}

function renderAll() {
  renderIngredientChips();
  renderRecipes();
  renderGroceryList();
  renderSettingsForm();
}

function renderIngredientChips() {
  renderChipGroup('meats', el.meatChips);
  renderChipGroup('veggies', el.veggieChips);
  renderChipGroup('grains', el.grainChips);
}

function renderChipGroup(category, container) {
  const items = siteConfig.ingredients?.[category] || [];
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="empty-state small-empty">No ingredients added yet.</div>';
    return;
  }

  const hint = document.createElement('div');
  hint.className = 'settings-help';
  hint.textContent = 'Tap to cycle quantity.';
  container.appendChild(hint);

  items.forEach(item => {
    const key = normalizeIngredient(item.name);
    const qty = pantryCounts[key] || 0;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${qty > 0 ? ' active' : ''}`;
    btn.textContent = qty > 0 ? `${item.name} (${qty})` : item.name;
    btn.addEventListener('click', () => {
      const nextQty = qty >= 5 ? 0 : qty + 1;
      if (nextQty === 0) delete pantryCounts[key];
      else pantryCounts[key] = nextQty;
      persistPantry();
      currentPage = 1;
      renderAll();
    });
    container.appendChild(btn);
  });
}

function getScoredRecipes() {
  return recipes
    .map(recipe => scoreRecipe(recipe))
    .sort((a, b) => {
      if (b.haveAll !== a.haveAll) return Number(b.haveAll) - Number(a.haveAll);
      if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
      if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
      return a.recipe.name.localeCompare(b.recipe.name);
    });
}

function scoreRecipe(recipe) {
  const recipeIngredients = getRecipeIngredientNames(recipe);
  const matched = recipeIngredients.filter(name => (pantryCounts[normalizeIngredient(name)] || 0) > 0);
  const missing = recipeIngredients.filter(name => (pantryCounts[normalizeIngredient(name)] || 0) === 0);
  return {
    recipe,
    totalCount: recipeIngredients.length,
    matchedCount: matched.length,
    missingCount: missing.length,
    haveAll: recipeIngredients.length > 0 && missing.length === 0,
    matched,
    missing,
  };
}

function renderRecipes() {
  const scoredRecipes = getScoredRecipes();
  const total = scoredRecipes.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  el.resultsCount.textContent = `${total} recipe${total === 1 ? '' : 's'}`;
  const selectedCount = Object.values(pantryCounts).filter(count => count > 0).length;
  el.matchSummary.textContent = selectedCount
    ? `You marked ${selectedCount} ingredient${selectedCount === 1 ? '' : 's'} as on hand. Recipes are ranked by what you can make right now.`
    : 'Pick ingredients on the right to prioritize recipes that match what you already have.';

  const pageItems = scoredRecipes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  el.recipeList.innerHTML = '';

  if (!pageItems.length) {
    el.recipeList.innerHTML = '<div class="empty-state">No recipes found.</div>';
    renderPagination(totalPages);
    return;
  }

  pageItems.forEach(({ recipe, matchedCount, totalCount, missingCount, haveAll }) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    const titleRow = document.createElement('div');
    titleRow.className = 'recipe-title-row';
    titleRow.innerHTML = `
      <div>
        <h3>${escapeHtml(recipe.name)}</h3>
      </div>
      <div class="meta-tags">
        ${haveAll ? '<span class="have-it-pill">Have it</span>' : ''}
        <span class="score-pill">Have ${matchedCount}/${totalCount}</span>
        ${missingCount ? `<span class="missing-pill">Need ${missingCount}</span>` : ''}
      </div>
    `;

    const meta = document.createElement('div');
    meta.className = 'recipe-meta';
    meta.innerHTML = `
      <span class="meta-tag">${escapeHtml(recipe.time || '—')}</span>
      <span class="meta-tag">${escapeHtml(recipe.difficulty || '—')}</span>
      <span class="meta-tag">Serves ${Number(recipe.servings) || 4}</span>
    `;

    const desc = document.createElement('p');
    desc.className = 'recipe-desc';
    desc.textContent = recipe.description || 'No description available.';

    const actions = document.createElement('div');
    actions.className = 'recipe-actions';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recipe-btn';
    button.textContent = 'View recipe';
    button.addEventListener('click', () => openRecipeModal(recipe));

    actions.appendChild(button);
    card.appendChild(titleRow);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(actions);
    el.recipeList.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  el.recipePagination.innerHTML = '';
  if (totalPages <= 1) {
    el.recipePagination.classList.remove('active');
    return;
  }

  el.recipePagination.classList.add('active');

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'ghost-btn small-btn';
  prev.textContent = 'Previous';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const pages = document.createElement('div');
  pages.className = 'pagination-pages';
  for (let page = 1; page <= totalPages; page += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = `page-btn${page === currentPage ? ' active' : ''}`;
    pageBtn.textContent = String(page);
    pageBtn.addEventListener('click', () => {
      currentPage = page;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pages.appendChild(pageBtn);
  }

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'ghost-btn small-btn';
  next.textContent = 'Next';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  el.recipePagination.append(prev, pages, next);
}

function openRecipeModal(recipe) {
  activeRecipe = recipe;
  activeRecipeServings = Number(recipe.servings) || 4;
  el.recipeModal.classList.remove('hidden');
  el.recipeModal.setAttribute('aria-hidden', 'false');
  setRecipeModalTab('grocery');
  renderRecipeModal();
}

function closeRecipeModal() {
  el.recipeModal.classList.add('hidden');
  el.recipeModal.setAttribute('aria-hidden', 'true');
}

function setRecipeModalTab(tabName) {
  document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  el.tabGrocery.classList.toggle('active', tabName === 'grocery');
  el.tabDirections.classList.toggle('active', tabName === 'directions');
}

function renderRecipeModal() {
  if (!activeRecipe) return;

  el.modalTitle.textContent = activeRecipe.name;
  el.modalMeta.innerHTML = `
    <div class="recipe-meta">
      <span class="meta-tag">${escapeHtml(activeRecipe.time || '—')}</span>
      <span class="meta-tag">${escapeHtml(activeRecipe.difficulty || '—')}</span>
      <span class="meta-tag">Base serves ${Number(activeRecipe.servings) || 4}</span>
    </div>
  `;

  const baseServings = Number(activeRecipe.servings) || 4;
  const scale = activeRecipeServings / baseServings;

  const recipeIngredientNames = getRecipeIngredientNames(activeRecipe);

  el.tabGrocery.innerHTML = '';
  const servingsRow = document.createElement('div');
  servingsRow.className = 'servings-row';
  servingsRow.innerHTML = `
    <div>
      <strong>Serving size</strong>
      <div class="have-it-text">Base recipe serves ${baseServings}. Adjust grocery amounts below.</div>
    </div>
  `;
  const servingsSelect = document.createElement('select');
  servingsSelect.className = 'servings-select';
  for (let i = 1; i <= 12; i += 1) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = String(i);
    option.selected = i === activeRecipeServings;
    servingsSelect.appendChild(option);
  }
  servingsSelect.addEventListener('change', () => {
    activeRecipeServings = Number(servingsSelect.value);
    renderRecipeModal();
  });
  servingsRow.appendChild(servingsSelect);
  el.tabGrocery.appendChild(servingsRow);

  const tabActions = document.createElement('div');
  tabActions.className = 'tab-actions-row';
  const addAllBtn = document.createElement('button');
  addAllBtn.type = 'button';
  addAllBtn.className = 'primary-btn small-btn';
  addAllBtn.textContent = 'Add needed items';
  addAllBtn.addEventListener('click', () => addRecipeNeededItemsToGrocery(activeRecipe, scale));
  tabActions.appendChild(addAllBtn);
  el.tabGrocery.appendChild(tabActions);

  const list = document.createElement('ul');
  list.className = 'action-ingredients-list';

  (activeRecipe.groceryList || []).forEach((line, index) => {
    const relatedIngredient = recipeIngredientNames[index] || null;
    const haveIt = relatedIngredient ? (pantryCounts[normalizeIngredient(relatedIngredient)] || 0) > 0 : false;
    const scaledLine = scaleIngredientLine(line, scale);
    const item = document.createElement('li');
    item.className = `ingredient-action-item${haveIt ? ' have-it' : ''}`;

    const lineWrap = document.createElement('div');
    lineWrap.className = 'ingredient-line-text';
    lineWrap.innerHTML = `
      <div class="ingredient-line-main">
        <span>${escapeHtml(scaledLine)}</span>
        ${haveIt ? '<span class="have-it-pill">Have it</span>' : ''}
      </div>
    `;

    const btn = document.createElement('button');
    btn.type = 'button';
    const exists = groceryItems.some(entry => entry.recipeId === activeRecipe.id && entry.text === scaledLine);
    btn.className = `${exists ? 'ghost-btn is-added-btn' : 'ghost-btn'} small-btn`;
    btn.textContent = exists ? 'Added' : (haveIt ? 'Skip' : 'Add');
    btn.disabled = haveIt && !exists;
    btn.addEventListener('click', () => {
      addSingleGroceryItem(activeRecipe, scaledLine);
      renderRecipeModal();
      renderGroceryList();
    });

    item.append(lineWrap, btn);
    list.appendChild(item);
  });

  el.tabGrocery.appendChild(list);

  const directionsList = document.createElement('ol');
  directionsList.className = 'directions-list';
  (activeRecipe.directions || []).forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    directionsList.appendChild(li);
  });
  el.tabDirections.innerHTML = '';
  el.tabDirections.appendChild(directionsList);
}

function addSingleGroceryItem(recipe, text) {
  if (groceryItems.some(entry => entry.recipeId === recipe.id && entry.text === text)) return;
  groceryItems.push({ recipeId: recipe.id, recipeName: recipe.name, text });
  persistGrocery();
}

function addRecipeNeededItemsToGrocery(recipe, scale = 1) {
  const recipeIngredientNames = getRecipeIngredientNames(recipe);
  (recipe.groceryList || []).forEach((line, index) => {
    const relatedIngredient = recipeIngredientNames[index] || null;
    const haveIt = relatedIngredient ? (pantryCounts[normalizeIngredient(relatedIngredient)] || 0) > 0 : false;
    if (haveIt) return;
    addSingleGroceryItem(recipe, scaleIngredientLine(line, scale));
  });
  persistGrocery();
  renderGroceryList();
  renderRecipeModal();
}

function renderGroceryList() {
  el.groceryList.innerHTML = '';
  const recipeNames = [...new Set(groceryItems.map(item => item.recipeName))];
  el.groceryRecipeSummary.textContent = groceryItems.length
    ? `${groceryItems.length} item${groceryItems.length === 1 ? '' : 's'} from ${recipeNames.length} recipe${recipeNames.length === 1 ? '' : 's'}.`
    : 'No grocery items added yet.';

  if (!groceryItems.length) {
    el.groceryList.innerHTML = '<div class="empty-state small-empty">Your grocery list is empty.</div>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'shopping-list';
  groceryItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'shopping-item';

    const left = document.createElement('div');
    left.className = 'shopping-text';
    left.innerHTML = `<strong>${escapeHtml(item.text)}</strong><div class="settings-help">${escapeHtml(item.recipeName)}</div>`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ghost-btn small-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      groceryItems.splice(index, 1);
      persistGrocery();
      renderGroceryList();
      if (activeRecipe) renderRecipeModal();
    });

    li.append(left, removeBtn);
    list.appendChild(li);
  });

  el.groceryList.appendChild(list);
}

async function copyShoppingList() {
  const text = groceryItems.length
    ? groceryItems.map(item => `• ${item.text} (${item.recipeName})`).join('\n')
    : 'No grocery items added yet.';

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore clipboard failures
  }
}

function openSettingsModal() {
  renderSettingsForm();
  el.settingsModal.classList.remove('hidden');
  el.settingsModal.setAttribute('aria-hidden', 'false');
  setSettingsTab('general');
}

function closeSettingsModal() {
  el.settingsModal.classList.add('hidden');
  el.settingsModal.setAttribute('aria-hidden', 'true');
}

function setSettingsTab(tabName) {
  document.querySelectorAll('.settings-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.settingsTab === tabName);
  });
  document.querySelectorAll('.settings-page').forEach(page => {
    page.classList.toggle('active', page.dataset.settingsPage === tabName);
  });
}

function renderSettingsForm() {
  el.titleInput.value = siteConfig.branding.title || '';
  el.taglineInput.value = siteConfig.branding.tagline || '';

  el.themeOptions.innerHTML = '';
  (siteConfig.themes || []).forEach(theme => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `theme-btn${theme.id === currentTheme ? ' active' : ''}`;
    btn.textContent = theme.name;
    btn.addEventListener('click', () => {
      applyTheme(theme.id);
      renderSettingsForm();
    });
    el.themeOptions.appendChild(btn);
  });

  renderManageList('meats', el.manageMeats);
  renderManageList('veggies', el.manageVeggies);
  renderManageList('grains', el.manageGrains);
}

function renderManageList(category, container) {
  const items = siteConfig.ingredients?.[category] || [];
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="empty-state small-empty">No items yet.</div>';
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'manage-row';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const actions = document.createElement('div');
    actions.className = 'topbar-actions';

    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.className = 'ghost-btn small-btn';
    renameBtn.textContent = 'Rename';
    renameBtn.addEventListener('click', () => {
      const nextName = window.prompt(`Rename ${item.name}`, item.name)?.trim();
      if (!nextName) return;
      siteConfig.ingredients[category][index] = { id: slugify(nextName), name: nextName };
      persistSiteConfig();
      renderAll();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'ghost-btn small-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      const removed = siteConfig.ingredients[category].splice(index, 1)[0];
      if (removed) delete pantryCounts[normalizeIngredient(removed.name)];
      persistSiteConfig();
      persistPantry();
      renderAll();
    });

    actions.append(renameBtn, removeBtn);
    row.append(name, actions);
    container.appendChild(row);
  });
}

function addIngredient(category) {
  const input = document.getElementById(`add-${category}-input`);
  const value = input?.value?.trim();
  if (!value) return;

  const exists = (siteConfig.ingredients?.[category] || []).some(item => normalizeIngredient(item.name) === normalizeIngredient(value));
  if (exists) {
    input.value = '';
    return;
  }

  siteConfig.ingredients[category].push({ id: slugify(value), name: toTitleCase(value) });
  siteConfig.ingredients[category].sort((a, b) => a.name.localeCompare(b.name));
  input.value = '';
  persistSiteConfig();
  renderAll();
}

function saveSettings() {
  siteConfig.branding.title = el.titleInput.value.trim() || 'What the !#$%&@ is for Dinner?';
  siteConfig.branding.tagline = el.taglineInput.value.trim() || 'Tonight’s plan starts here';
  persistSiteConfig();
  applyBranding();
  renderAll();
  closeSettingsModal();
}

function resetSettings() {
  localStorage.removeItem(STORAGE_KEYS.site);
  localStorage.removeItem(STORAGE_KEYS.theme);
  pantryCounts = {};
  localStorage.removeItem(STORAGE_KEYS.pantry);

  fetch('data/site.json')
    .then(r => r.json())
    .then(defaultConfig => {
      siteConfig = buildSiteConfig(defaultConfig, null);
      applyTheme(siteConfig.defaultTheme || 'citrus');
      applyBranding();
      renderAll();
    });
}

function getRecipeIngredientNames(recipe) {
  const names = [];
  CATEGORY_KEYS.forEach(category => {
    const items = Array.isArray(recipe.ingredients?.[category]) ? recipe.ingredients[category] : [];
    items.forEach(item => names.push(item));
  });
  return names;
}

function normalizeIngredient(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(cloves?|cups?|tbsp|tablespoons?|tsp|teaspoons?|lb|lbs|oz|ounces?)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s$/, '');
}

function scaleIngredientLine(line, scale) {
  if (!line || scale === 1) return line;
  return String(line).replace(/\b(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)\b/g, (match) => {
    const value = parseNumber(match);
    if (Number.isNaN(value)) return match;
    return formatScaledNumber(value * scale);
  });
}

function parseNumber(text) {
  const clean = String(text).trim();
  if (/^\d+\s+\d+\/\d+$/.test(clean)) {
    const [whole, fraction] = clean.split(/\s+/);
    return Number(whole) + parseNumber(fraction);
  }
  if (/^\d+\/\d+$/.test(clean)) {
    const [num, den] = clean.split('/').map(Number);
    return den ? num / den : NaN;
  }
  return Number(clean);
}

>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
function formatScaledNumber(value) {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  if (Math.abs(rounded - 0.25) < 0.01) return '1/4';
  if (Math.abs(rounded - 0.5) < 0.01) return '1/2';
  if (Math.abs(rounded - 0.75) < 0.01) return '3/4';
  return String(rounded).replace(/\.0+$/, '');
<<<<<<< HEAD
}

function roundAmount(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function formatAmount(value) {
  return formatScaledNumber(roundAmount(value));
}

function formatIngredientLine(item) {
  const quantity = item.quantity == null ? '' : formatAmount(item.quantity);
  const unit = item.unit && item.unit !== 'count' ? ` ${item.unit}` : '';
  return `${quantity}${unit}${quantity ? ' ' : ''}${item.name}`.trim();
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitleCase(value) {
  return String(value || '').replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
<<<<<<< HEAD
}

function uniqueArray(values) {
  return [...new Set((values || []).filter(Boolean))];
=======
>>>>>>> 25c78f23af11aa025c61031cc1506bf21258edd5
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
