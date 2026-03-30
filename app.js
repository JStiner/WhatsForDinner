const STORAGE_KEY = 'wfd-demo-settings-v6';

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
  activeSettingsTab: 'general',
  currentRecipePage: 1,
  recipesPerPage: 10
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
  manageGrains: document.getElementById('manage-grains'),
  recipePagination: document.getElementById('recipe-pagination')
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
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

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
    return {
      ...defaults,
      ...parsed,
      ingredients: mergeIngredients(defaults.ingredients, parsed.ingredients),
      recipeSelections: parsed.recipeSelections || parsed.grocerySelections || {},
      manualGroceryItems: parsed.manualGroceryItems || {},
      recipeItemSelections: parsed.recipeItemSelections || {},
      recipeServingSelections: parsed.recipeServingSelections || {}
    };
  } catch (_) {
    return defaults;
  }
}

function mergeIngredients(defaultIngredients, savedIngredients) {
  return {
    meats: Array.isArray(savedIngredients?.meats) ? savedIngredients.meats : defaultIngredients.meats,
    veggies: Array.isArray(savedIngredients?.veggies) ? savedIngredients.veggies : defaultIngredients.veggies,
    grains: Array.isArray(savedIngredients?.grains) ? savedIngredients.grains : defaultIngredients.grains
  };
}

function getRecipeServings(recipe) {
  const base = Number(recipe?.servings);
  return Number.isFinite(base) && base > 0 ? base : 4;
}

function getSavedRecipeServings(recipeId) {
  const saved = Number(state.settings.recipeServingSelections?.[recipeId]);
  return Number.isFinite(saved) && saved >= 1 && saved <= 10 ? saved : null;
}

function getServingScale(recipe, selectedServings) {
  return selectedServings / getRecipeServings(recipe);
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}

function applySettingsToSite() {
  state.site = structuredClone(state.defaultSite);
  state.site.ingredients = structuredClone(state.settings.ingredients);
}

function bindEvents() {
  document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('save-settings-btn').addEventListener('click', handleSaveSettings);
  document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
  document.getElementById('clear-grocery-btn').addEventListener('click', clearGroceryList);
  document.getElementById('copy-shopping-list-btn').addEventListener('click', copyShoppingList);

  document.querySelectorAll('[data-close-modal="true"]').forEach((node) => {
    node.addEventListener('click', closeRecipeModal);
  });

  document.querySelectorAll('[data-close-settings="true"]').forEach((node) => {
    node.addEventListener('click', closeSettings);
  });

  document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderModalTabs();
    });
  });

  document.querySelectorAll('.settings-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeSettingsTab = btn.dataset.settingsTab;
      renderSettingsTabs();
    });
  });

  document.querySelectorAll('[data-add-ingredient]').forEach((btn) => {
    btn.addEventListener('click', () => addIngredient(btn.dataset.addIngredient));
  });
}

function renderAll() {
  renderBranding();
  renderThemeOptions();
  renderChips();
  renderRecipes();
  renderGroceryList();
}

function renderBranding() {
  els.appTitle.textContent = state.settings.title;
  els.appTagline.textContent = state.settings.tagline;
  document.body.className = `theme-${state.settings.theme}`;
}

function renderThemeOptions() {
  els.themeOptions.innerHTML = '';
  state.defaultSite.themes.forEach((theme) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `theme-btn${theme.id === state.settings.theme ? ' active' : ''}`;
    btn.textContent = theme.name;
    btn.addEventListener('click', () => {
      state.settings.theme = theme.id;
      renderBranding();
      renderThemeOptions();
    });
    els.themeOptions.appendChild(btn);
  });
}

function renderChips() {
  renderChipGroup('meats', state.site.ingredients.meats, els.meatChips);
  renderChipGroup('veggies', state.site.ingredients.veggies, els.veggieChips);
  renderChipGroup('grains', state.site.ingredients.grains, els.grainChips);
}

function renderChipGroup(groupKey, items, mount) {
  mount.innerHTML = '';

  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${state.selected[groupKey].has(item.id) ? ' active' : ''}`;
    btn.textContent = item.name;
    btn.addEventListener('click', () => {
      toggleSelection(groupKey, item.id);
      renderChips();
      renderRecipes();
    });
    mount.appendChild(btn);
  });
}

function toggleSelection(groupKey, itemId) {
  const bucket = state.selected[groupKey];
  if (bucket.has(itemId)) {
    bucket.delete(itemId);
  } else {
    bucket.add(itemId);
  }
  state.currentRecipePage = 1;
}

function clearFilters() {
  Object.values(state.selected).forEach((setObj) => setObj.clear());
  state.currentRecipePage = 1;
  renderChips();
  renderRecipes();
}

function getRankedRecipes() {
  const selectedFlat = [
    ...state.selected.meats,
    ...state.selected.veggies,
    ...state.selected.grains
  ];

  const selectedCount = selectedFlat.length;

  return state.recipes.map((recipe) => {
    const required = [
      ...recipe.ingredients.meats,
      ...recipe.ingredients.veggies,
      ...recipe.ingredients.grains
    ];

    const matched = required.filter((id) => selectedFlat.includes(id));
    const missing = required.filter((id) => !selectedFlat.includes(id));

    let score = matched.length * 10;

    if (selectedCount > 0 && required.length > 0) {
      score += matched.length / required.length;
    }

    if (recipe.ingredients.meats.some((id) => state.selected.meats.has(id))) score += 6;
    if (recipe.ingredients.veggies.some((id) => state.selected.veggies.has(id))) score += 3;
    if (recipe.ingredients.grains.some((id) => state.selected.grains.has(id))) score += 2;

    if (selectedCount === 0) score = 0;

    return {
      ...recipe,
      matchCount: matched.length,
      totalTrackedIngredients: required.length,
      matched,
      missing,
      score,
      addedCount: state.settings.recipeSelections[recipe.id] || 0
    };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.name.localeCompare(b.name);
  });
}

function renderRecipes() {
  const ranked = getRankedRecipes();
  const totalRecipes = ranked.length;
  const totalPages = Math.max(1, Math.ceil(totalRecipes / state.recipesPerPage));

  if (state.currentRecipePage > totalPages) state.currentRecipePage = totalPages;
  if (state.currentRecipePage < 1) state.currentRecipePage = 1;

  const startIndex = (state.currentRecipePage - 1) * state.recipesPerPage;
  const visibleRecipes = ranked.slice(startIndex, startIndex + state.recipesPerPage);

  els.recipeList.innerHTML = '';
  const rangeStart = totalRecipes ? startIndex + 1 : 0;
  const rangeEnd = Math.min(startIndex + state.recipesPerPage, totalRecipes);
  els.resultsCount.textContent = totalRecipes
    ? `${rangeStart}-${rangeEnd} of ${totalRecipes} recipes`
    : '0 recipes';

  const selectedCount = [...state.selected.meats, ...state.selected.veggies, ...state.selected.grains].length;

  if (selectedCount === 0) {
    els.matchSummary.textContent = 'Showing all recipes. Select meats, veggies, or grains to move your best matches to the top.';
  } else {
    const top = ranked[0];
    const perfect = top?.missing.length === 0 && top?.matchCount > 0;
    els.matchSummary.textContent = perfect
      ? `Best match: ${top.name}. You currently have everything tracked for this recipe.`
      : `Prioritized using ${selectedCount} selected ingredient${selectedCount === 1 ? '' : 's'}. Top recipes match the most items you already have.`;
  }

  if (!totalRecipes) {
    els.recipeList.innerHTML = '<div class="empty-state">No recipes found.</div>';
    renderRecipePagination(0, 0);
    return;
  }

  visibleRecipes.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    const matchedText = recipe.matchCount
      ? `${recipe.matchCount}/${recipe.totalTrackedIngredients} matched`
      : 'Suggested recipe';

    const missingText = recipe.missing.length
      ? `${recipe.missing.length} still needed`
      : 'Ready to cook';

    const addedText = recipe.addedCount > 0
      ? `<span class="list-count-pill">Add all x${recipe.addedCount}</span>`
      : '';

    card.innerHTML = `
      <div class="recipe-top">
        <div>
          <div class="recipe-title-row">
            <h3>${escapeHtml(recipe.name)}</h3>
            <span class="badge">${escapeHtml(recipe.difficulty)}</span>
            <span class="score-pill">${escapeHtml(matchedText)}</span>
            <span class="missing-pill">${escapeHtml(missingText)}</span>
            ${addedText}
          </div>
          <p class="recipe-desc">${escapeHtml(recipe.description)}</p>
        </div>
      </div>
      <div class="recipe-meta">
        <span class="meta-tag">⏱ ${escapeHtml(recipe.time)}</span>
        <span class="meta-tag">🍽 ${recipe.servings} servings</span>
      </div>
      <div class="meta-tags">
        ${buildMetaTags(recipe)}
      </div>
      <div class="recipe-actions">
        <span class="section-label">Click for grocery list or directions</span>
        <button class="recipe-btn" type="button">Open recipe</button>
      </div>
    `;

    card.querySelector('.recipe-btn').addEventListener('click', () => openRecipeModal(recipe.id));
    card.addEventListener('dblclick', () => openRecipeModal(recipe.id));
    els.recipeList.appendChild(card);
  });

  renderRecipePagination(totalPages, totalRecipes);
}

function renderRecipePagination(totalPages, totalRecipes) {
  if (!els.recipePagination) return;

  if (!totalRecipes || totalPages <= 1) {
    els.recipePagination.innerHTML = '';
    els.recipePagination.classList.remove('active');
    return;
  }

  els.recipePagination.classList.add('active');
  const page = state.currentRecipePage;
  const startPage = Math.max(1, page - 1);
  const endPage = Math.min(totalPages, startPage + 2);
  const adjustedStart = Math.max(1, endPage - 2);
  const pages = [];
  for (let i = adjustedStart; i <= endPage; i += 1) pages.push(i);

  els.recipePagination.innerHTML = `
    <button class="ghost-btn small-btn" type="button" data-page-action="prev" ${page === 1 ? 'disabled' : ''}>Previous</button>
    <div class="pagination-pages">
      ${pages.map((pageNumber) => `
        <button class="page-btn${pageNumber === page ? ' active' : ''}" type="button" data-page-number="${pageNumber}">${pageNumber}</button>
      `).join('')}
    </div>
    <button class="ghost-btn small-btn" type="button" data-page-action="next" ${page === totalPages ? 'disabled' : ''}>Next</button>
  `;

  els.recipePagination.querySelectorAll('[data-page-action="prev"]').forEach((btn) => {
    btn.addEventListener('click', () => changeRecipePage(page - 1, totalPages));
  });
  els.recipePagination.querySelectorAll('[data-page-action="next"]').forEach((btn) => {
    btn.addEventListener('click', () => changeRecipePage(page + 1, totalPages));
  });
  els.recipePagination.querySelectorAll('[data-page-number]').forEach((btn) => {
    btn.addEventListener('click', () => changeRecipePage(Number(btn.dataset.pageNumber), totalPages));
  });
}

function changeRecipePage(nextPage, totalPages) {
  state.currentRecipePage = Math.min(Math.max(nextPage, 1), totalPages || 1);
  renderRecipes();
  const recipePanel = document.querySelector('.recipes-panel');
  recipePanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildMetaTags(recipe) {
  const labels = [
    ...recipe.ingredients.meats.map((id) => lookupIngredientName('meats', id)),
    ...recipe.ingredients.veggies.map((id) => lookupIngredientName('veggies', id)),
    ...recipe.ingredients.grains.map((id) => lookupIngredientName('grains', id))
  ];

  return labels.map((label) => `<span class="meta-tag">${escapeHtml(label)}</span>`).join('');
}

function recipeItemIsSelected(recipe, item) {
  const selectedIds = [
    ...recipe.ingredients.meats.filter((id) => state.selected.meats.has(id)),
    ...recipe.ingredients.veggies.filter((id) => state.selected.veggies.has(id)),
    ...recipe.ingredients.grains.filter((id) => state.selected.grains.has(id))
  ];

  if (!selectedIds.length) return false;

  const candidateStrings = [item.name, item.display]
    .filter(Boolean)
    .map((value) => normalizeIngredientText(value));

  return selectedIds.some((id) => {
    const label = [
      lookupIngredientName('meats', id),
      lookupIngredientName('veggies', id),
      lookupIngredientName('grains', id)
    ].find(Boolean) || id;

    const normalizedLabel = normalizeIngredientText(label);
    if (!normalizedLabel) return false;

    return candidateStrings.some((candidate) => candidate.includes(normalizedLabel) || normalizedLabel.includes(candidate));
  });
}

function normalizeIngredientText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function lookupIngredientName(group, id) {
  return state.site.ingredients[group].find((item) => item.id === id)?.name
    || state.defaultSite.ingredients[group].find((item) => item.id === id)?.name
    || id;
}

function openRecipeModal(recipeId) {
  state.activeRecipe = state.recipes.find((recipe) => recipe.id === recipeId) || null;
  state.activeTab = 'grocery';

  if (!state.activeRecipe) return;

  state.activeServings = getSavedRecipeServings(recipeId) || getRecipeServings(state.activeRecipe);

  const addedCount = state.settings.recipeSelections[state.activeRecipe.id] || 0;
  const groceryItems = buildRecipeListItems(state.activeRecipe, state.activeServings);

  els.modalTitle.textContent = state.activeRecipe.name;
  els.modalMeta.innerHTML = `
    <span class="meta-tag">⏱ ${escapeHtml(state.activeRecipe.time)}</span>
    <span class="meta-tag">Base: ${getRecipeServings(state.activeRecipe)} servings</span>
    <span class="meta-tag">Selected: ${state.activeServings} servings</span>
    <span class="meta-tag">${escapeHtml(state.activeRecipe.difficulty)}</span>
    <span class="meta-tag">Add all count: ${addedCount}</span>
  `;

  els.tabGrocery.innerHTML = `
    <div class="tab-actions-row">
      <button class="primary-btn${addedCount > 0 ? ' is-added-btn' : ''}" id="add-recipe-to-list-btn" type="button">${addedCount > 0 ? `Added all x${addedCount}` : 'Add all to list'}</button>
      <button class="ghost-btn" id="copy-recipe-grocery-btn" type="button">Copy grocery list</button>
    </div>
    <div class="servings-row">
      <label for="servings-select" class="section-label">Servings</label>
      <select id="servings-select" class="servings-select">
        ${Array.from({ length: 10 }, (_, index) => index + 1).map((value) => `
          <option value="${value}" ${value === state.activeServings ? 'selected' : ''}>${value}</option>
        `).join('')}
      </select>
    </div>
    <ul class="ingredients-list action-ingredients-list">
      ${groceryItems.map((item) => {
        const haveIt = recipeItemIsSelected(state.activeRecipe, item);
        const itemSelectionKey = `${state.activeRecipe.id}::${item.key}`;
        const itemCount = state.settings.recipeItemSelections[itemSelectionKey] || 0;
        return `
        <li class="ingredient-action-item${haveIt ? ' have-it' : ''}">
          <div class="ingredient-line-main">
            <span class="ingredient-line-text${haveIt ? ' have-it-text' : ''}">${escapeHtml(item.display)}</span>
            ${haveIt ? '<span class="have-it-pill">Have it</span>' : ''}
          </div>
          <button class="ghost-btn small-btn${itemCount > 0 ? ' is-added-btn' : ''}" type="button" data-add-item-key="${escapeAttribute(item.key)}">${itemCount > 0 ? `Added x${itemCount}` : 'Add to list'}</button>
        </li>
      `;
      }).join('')}
    </ul>
  `;

  els.tabDirections.innerHTML = `
    <div class="tab-actions-row">
      <button class="ghost-btn" id="copy-directions-btn" type="button">Copy how to cook</button>
    </div>
    <ol class="directions-list">
      ${state.activeRecipe.directions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
    </ol>
  `;

  document.getElementById('servings-select').addEventListener('change', (event) => {
    const nextValue = Number(event.target.value);
    state.activeServings = Number.isFinite(nextValue) && nextValue >= 1 && nextValue <= 10
      ? nextValue
      : getRecipeServings(state.activeRecipe);
    state.settings.recipeServingSelections[recipeId] = state.activeServings;
    saveSettings();
    openRecipeModal(recipeId);
  });

  document.getElementById('add-recipe-to-list-btn').addEventListener('click', () => addRecipeToList(state.activeRecipe.id));
  document.getElementById('copy-recipe-grocery-btn').addEventListener('click', () => copyRecipeGrocery(state.activeRecipe.id));
  document.getElementById('copy-directions-btn').addEventListener('click', () => copyRecipeDirections(state.activeRecipe.id));

  els.tabGrocery.querySelectorAll('[data-add-item-key]').forEach((btn) => {
    btn.addEventListener('click', () => addSingleIngredientToList(state.activeRecipe.id, btn.dataset.addItemKey));
  });

  renderModalTabs();
  els.recipeModal.classList.remove('hidden');
  els.recipeModal.setAttribute('aria-hidden', 'false');
}

function closeRecipeModal() {
  els.recipeModal.classList.add('hidden');
  els.recipeModal.setAttribute('aria-hidden', 'true');
}

function renderModalTabs() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });
  els.tabGrocery.classList.toggle('active', state.activeTab === 'grocery');
  els.tabDirections.classList.toggle('active', state.activeTab === 'directions');
}

function renderSettingsTabs() {
  document.querySelectorAll('.settings-nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.settingsTab === state.activeSettingsTab);
  });
  document.querySelectorAll('.settings-page').forEach((page) => {
    page.classList.toggle('active', page.dataset.settingsPage === state.activeSettingsTab);
  });
}

function openSettings() {
  els.titleInput.value = state.settings.title;
  els.taglineInput.value = state.settings.tagline;
  renderThemeOptions();
  renderIngredientManager();
  renderSettingsTabs();
  els.settingsModal.classList.remove('hidden');
  els.settingsModal.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
  els.settingsModal.classList.add('hidden');
  els.settingsModal.setAttribute('aria-hidden', 'true');
}

function handleSaveSettings() {
  state.settings.title = els.titleInput.value.trim() || state.defaultSite.branding.title;
  state.settings.tagline = els.taglineInput.value.trim() || state.defaultSite.branding.tagline;
  applySettingsToSite();
  saveSettings();
  renderAll();
  closeSettings();
}

function resetSettings() {
  state.settings = {
    title: state.defaultSite.branding.title,
    tagline: state.defaultSite.branding.tagline,
    theme: state.defaultSite.defaultTheme,
    ingredients: structuredClone(state.defaultSite.ingredients),
    recipeSelections: {},
    manualGroceryItems: {},
    recipeItemSelections: {},
    recipeServingSelections: {}
  };

  Object.values(state.selected).forEach((setObj) => setObj.clear());
  state.activeServings = 4;
  applySettingsToSite();
  saveSettings();
  renderAll();

  els.titleInput.value = state.settings.title;
  els.taglineInput.value = state.settings.tagline;
  renderThemeOptions();
  renderIngredientManager();
  renderSettingsTabs();
}

function renderIngredientManager() {
  renderIngredientManageList('meats', els.manageMeats);
  renderIngredientManageList('veggies', els.manageVeggies);
  renderIngredientManageList('grains', els.manageGrains);
}

function renderIngredientManageList(groupKey, mount) {
  mount.innerHTML = '';

  state.settings.ingredients[groupKey].forEach((item) => {
    const row = document.createElement('div');
    row.className = 'manage-row';
    row.innerHTML = `
      <input type="text" value="${escapeAttribute(item.name)}" maxlength="40" />
      <button class="ghost-btn small-btn" type="button">Remove</button>
    `;

    const input = row.querySelector('input');
    const removeBtn = row.querySelector('button');

    input.addEventListener('input', (event) => {
      item.name = event.target.value;
      applySettingsToSite();
      renderChips();
      renderRecipes();
    });

    removeBtn.addEventListener('click', () => removeIngredient(groupKey, item.id));
    mount.appendChild(row);
  });
}

function addIngredient(groupKey) {
  const input = document.getElementById(`add-${groupKey}-input`);
  const name = input.value.trim();
  if (!name) return;

  const existingIds = new Set(state.settings.ingredients[groupKey].map((item) => item.id));
  const baseId = slugify(name);
  let nextId = baseId;
  let counter = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${counter}`;
    counter += 1;
  }

  state.settings.ingredients[groupKey].push({ id: nextId, name });
  input.value = '';
  applySettingsToSite();
  renderIngredientManager();
  renderChips();
  renderRecipes();
}

function removeIngredient(groupKey, itemId) {
  state.settings.ingredients[groupKey] = state.settings.ingredients[groupKey].filter((item) => item.id !== itemId);
  state.selected[groupKey].delete(itemId);
  applySettingsToSite();
  renderIngredientManager();
  renderChips();
  renderRecipes();
}

function addRecipeToList(recipeId) {
  const recipe = state.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) return;

  const selectedServings = getSavedRecipeServings(recipeId) || state.activeServings || getRecipeServings(recipe);
  state.settings.recipeServingSelections[recipeId] = selectedServings;
  state.settings.recipeSelections[recipeId] = (state.settings.recipeSelections[recipeId] || 0) + 1;

  buildRecipeListItems(recipe, selectedServings).forEach((item) => {
    const itemSelectionKey = `${recipeId}::${item.key}`;
    state.settings.recipeItemSelections[itemSelectionKey] = (state.settings.recipeItemSelections[itemSelectionKey] || 0) + 1;
  });

  saveSettings();
  renderGroceryList();
  renderRecipes();
  if (state.activeRecipe?.id === recipeId) openRecipeModal(recipeId);
}

function addSingleIngredientToList(recipeId, itemKey) {
  const recipe = state.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) return;

  const selectedServings = getSavedRecipeServings(recipeId) || state.activeServings || getRecipeServings(recipe);
  const item = buildRecipeListItems(recipe, selectedServings).find((entry) => entry.key === itemKey);
  if (!item) return;

  state.settings.recipeServingSelections[recipeId] = selectedServings;

  const itemSelectionKey = `${recipeId}::${item.key}`;
  state.settings.recipeItemSelections[itemSelectionKey] = (state.settings.recipeItemSelections[itemSelectionKey] || 0) + 1;

  const existing = state.settings.manualGroceryItems[item.key];
  if (existing) {
    existing.quantity = existing.quantity !== null && item.quantity !== null
      ? existing.quantity + item.quantity
      : existing.quantity;
    existing.count = (existing.count || 0) + 1;
    existing.display = buildStoredItemDisplay(existing);
  } else {
    state.settings.manualGroceryItems[item.key] = {
      key: item.key,
      name: item.name,
      unit: item.unit,
      note: item.note,
      quantity: item.quantity,
      count: 1,
      display: item.display
    };
  }

  saveSettings();
  renderGroceryList();
  if (state.activeRecipe?.id === recipeId) openRecipeModal(recipeId);
}

function buildStoredItemDisplay(item) {
  if (item.quantity !== null) {
    return formatIngredientDisplay(item.quantity, item.unit, item.name, item.note);
  }
  return item.display || item.name;
}

function removeShoppingItem(itemKey) {
  const manualItem = state.settings.manualGroceryItems[itemKey];
  if (manualItem) {
    delete state.settings.manualGroceryItems[itemKey];
  }

  const itemSelectionKeys = Object.keys(state.settings.recipeItemSelections || {}).filter((key) => key.endsWith(`::${itemKey}`));
  if (manualItem && itemSelectionKeys.length) {
    let remainingToRemove = manualItem.count || 1;
    itemSelectionKeys.forEach((key) => {
      if (remainingToRemove <= 0) return;
      const current = state.settings.recipeItemSelections[key] || 0;
      const next = Math.max(0, current - remainingToRemove);
      remainingToRemove -= Math.max(0, current - next);
      if (next > 0) {
        state.settings.recipeItemSelections[key] = next;
      } else {
        delete state.settings.recipeItemSelections[key];
      }
    });
  }

  const recipeIds = Object.keys(state.settings.recipeSelections).filter((recipeId) => state.settings.recipeSelections[recipeId] > 0);
  for (const recipeId of recipeIds) {
    const recipe = state.recipes.find((entry) => entry.id === recipeId);
    if (!recipe) continue;
    const selectedServings = getSavedRecipeServings(recipeId) || getRecipeServings(recipe);
    const recipeItems = buildRecipeListItems(recipe, selectedServings);
    const itemKeys = recipeItems.map((entry) => entry.key);
    if (itemKeys.includes(itemKey)) {
      state.settings.recipeSelections[recipeId] -= 1;
      recipeItems.forEach((entry) => {
        const selectionKey = `${recipeId}::${entry.key}`;
        const current = state.settings.recipeItemSelections[selectionKey] || 0;
        if (current > 1) {
          state.settings.recipeItemSelections[selectionKey] = current - 1;
        } else {
          delete state.settings.recipeItemSelections[selectionKey];
        }
      });
      if (state.settings.recipeSelections[recipeId] <= 0) {
        delete state.settings.recipeSelections[recipeId];
        delete state.settings.recipeServingSelections[recipeId];
      }
      break;
    }
  }

  saveSettings();
  renderGroceryList();
  renderRecipes();
  if (state.activeRecipe) openRecipeModal(state.activeRecipe.id);
}

function clearGroceryList() {
  const aggregated = getGroceryAggregation();
  if (!aggregated.items.length) return;

  const confirmed = window.confirm('Are you sure you want to clear the grocery list?');
  if (!confirmed) return;

  state.settings.recipeSelections = {};
  state.settings.manualGroceryItems = {};
  state.settings.recipeItemSelections = {};
  state.settings.recipeServingSelections = {};
  saveSettings();
  renderGroceryList();
  renderRecipes();
  if (state.activeRecipe) openRecipeModal(state.activeRecipe.id);
}

function getGroceryAggregation() {
  const entries = new Map();
  const recipeSummary = [];

  Object.entries(state.settings.recipeSelections).forEach(([recipeId, count]) => {
    if (!count) return;
    const recipe = state.recipes.find((entry) => entry.id === recipeId);
    if (!recipe) return;

    const servings = getSavedRecipeServings(recipeId) || getRecipeServings(recipe);
    recipeSummary.push(`${recipe.name} x${count} (${servings} servings)`);

    buildRecipeListItems(recipe, servings).forEach((item) => {
      const existing = entries.get(item.key);
      const multipliedQuantity = item.quantity !== null ? item.quantity * count : null;
      if (existing) {
        existing.recipeCount += count;
        if (existing.quantity !== null && multipliedQuantity !== null) {
          existing.quantity += multipliedQuantity;
          existing.display = formatIngredientDisplay(existing.quantity, existing.unit, existing.name, existing.note);
        }
      } else {
        entries.set(item.key, {
          key: item.key,
          name: item.name,
          unit: item.unit,
          note: item.note,
          quantity: multipliedQuantity,
          display: multipliedQuantity !== null
            ? formatIngredientDisplay(multipliedQuantity, item.unit, item.name, item.note)
            : item.display,
          recipeCount: count
        });
      }
    });
  });

  Object.values(state.settings.manualGroceryItems).forEach((item) => {
    const existing = entries.get(item.key);
    if (existing) {
      if (existing.quantity !== null && item.quantity !== null) {
        existing.quantity += item.quantity;
        existing.display = formatIngredientDisplay(existing.quantity, existing.unit, existing.name, existing.note);
      }
      existing.recipeCount += item.count || 1;
    } else {
      entries.set(item.key, {
        key: item.key,
        name: item.name,
        unit: item.unit,
        note: item.note,
        quantity: item.quantity,
        display: buildStoredItemDisplay(item),
        recipeCount: item.count || 1
      });
    }
  });

  return {
    items: Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name)),
    recipeSummary
  };
}

function renderGroceryList() {
  const aggregated = getGroceryAggregation();
  const totalItems = aggregated.items.length;
  const totalRecipes = aggregated.recipeSummary.length;
  const manualAdds = Object.values(state.settings.manualGroceryItems).reduce((sum, item) => sum + (item.count || 0), 0);

  if (totalItems) {
    const recipePart = totalRecipes
      ? `${totalRecipes} add-all recipe selection${totalRecipes === 1 ? '' : 's'}`
      : '0 add-all recipe selections';
    const manualPart = `${manualAdds} individual item add${manualAdds === 1 ? '' : 's'}`;
    els.groceryRecipeSummary.textContent = `${recipePart} and ${manualPart} rolled up into ${totalItems} shopping item${totalItems === 1 ? '' : 's'}.`;
  } else {
    els.groceryRecipeSummary.textContent = 'No items added yet. Open a recipe and use Add all to list or the individual Add to list buttons.';
  }

  if (!totalItems) {
    els.groceryList.innerHTML = '<div class="empty-state small-empty">Your grocery list is empty.</div>';
    return;
  }

  els.groceryList.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'shopping-list';

  aggregated.items.forEach((item) => {
    const row = document.createElement('li');
    row.className = 'shopping-item';
    row.innerHTML = `
      <span class="shopping-text">${escapeHtml(item.display)}</span>
      <button class="ghost-btn small-btn" type="button">Remove</button>
    `;
    row.querySelector('button').addEventListener('click', () => removeShoppingItem(item.key));
    list.appendChild(row);
  });

  els.groceryList.appendChild(list);
}

function buildRecipeListItems(recipe, selectedServings = null) {
  const structured = Array.isArray(recipe.groceryItems) && recipe.groceryItems.length
    ? recipe.groceryItems
    : (recipe.groceryList || []).map(parseIngredientLine);

  const servings = selectedServings || getRecipeServings(recipe);
  const scale = getServingScale(recipe, servings);

  return structured.map((item) => normalizeRecipeIngredient(item, scale));
}

function normalizeRecipeIngredient(item, scale = 1) {
  const baseQuantity = typeof item.quantity === 'number' ? item.quantity : null;
  const quantity = baseQuantity !== null ? baseQuantity * scale : null;
  const unit = item.unit || '';
  const name = item.name || item.display || 'Item';
  const note = item.note || '';
  const key = `${name.toLowerCase()}|${unit.toLowerCase()}|${note.toLowerCase()}`;

  return {
    key,
    name,
    unit,
    note,
    quantity,
    display: quantity !== null ? formatIngredientDisplay(quantity, unit, name, note) : (item.display || name)
  };
}

function parseIngredientLine(line) {
  const text = String(line).trim();
  const match = text.match(/^([\d./]+)\s+([a-zA-Z]+)\s+(.+)$/);
  if (!match) {
    return { display: text, name: text, quantity: null, unit: '', note: '' };
  }

  const quantity = parseSimpleNumber(match[1]);
  if (quantity === null) {
    return { display: text, name: text, quantity: null, unit: '', note: '' };
  }

  return {
    quantity,
    unit: match[2],
    name: match[3],
    note: '',
    display: text
  };
}

function parseSimpleNumber(input) {
  if (!input) return null;
  if (input.includes('/')) {
    const [left, right] = input.split('/').map(Number);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right === 0) return null;
    return left / right;
  }
  const value = Number(input);
  return Number.isFinite(value) ? value : null;
}

function formatIngredientDisplay(quantity, unit, name, note) {
  const qtyText = formatQuantity(quantity);
  const normalizedUnit = pluralizeUnit(unit, quantity);
  const parts = [qtyText, normalizedUnit, name].filter(Boolean);
  const main = parts.join(' ').trim();
  return note ? `${main} (${note})` : main;
}

function formatQuantity(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function pluralizeUnit(unit, quantity) {
  if (!unit) return '';
  const lower = unit.toLowerCase();
  if (Math.abs(quantity - 1) < 0.001) return unit;
  if (lower === 'lb') return 'lbs';
  if (lower === 'clove') return 'cloves';
  if (lower === 'cup') return 'cups';
  if (lower === 'can') return 'cans';
  if (lower === 'package') return 'packages';
  if (lower.endsWith('s')) return unit;
  return `${unit}s`;
}

async function copyText(text, successLabel) {
  try {
    await navigator.clipboard.writeText(text);
    window.alert(successLabel);
  } catch (_) {
    window.alert('Copy failed in this browser.');
  }
}

function copyRecipeGrocery(recipeId) {
  const recipe = state.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) return;
  const servings = getSavedRecipeServings(recipeId)
    || (state.activeRecipe?.id === recipeId ? state.activeServings : null)
    || getRecipeServings(recipe);
  const text = `${recipe.name} (${servings} servings}

${buildRecipeListItems(recipe, servings).map((item) => `- ${item.display}`).join('\n')}`;
  copyText(text, 'Recipe grocery list copied.');
}

function copyRecipeDirections(recipeId) {
  const recipe = state.recipes.find((entry) => entry.id === recipeId);
  if (!recipe) return;
  const text = `${recipe.name} - How to Cook\n\n${recipe.directions.map((step, index) => `${index + 1}. ${step}`).join('\n')}`;
  copyText(text, 'How to cook copied.');
}

function copyShoppingList() {
  const aggregated = getGroceryAggregation();
  if (!aggregated.items.length) {
    window.alert('Your grocery list is empty.');
    return;
  }
  const text = `Shopping List\n\n${aggregated.items.map((item) => `- ${item.display}`).join('\n')}`;
  copyText(text, 'Shopping list copied.');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}
