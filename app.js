const STORAGE_KEY = 'wfd-demo-settings-v2';

const state = {
  defaultSite: null,
  site: null,
  recipes: [],
  selected: {
    meats: new Set(),
    veggies: new Set(),
    grains: new Set()
  },
  settings: null,
  activeRecipe: null,
  activeTab: 'grocery'
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
    grocerySelections: {}
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaults;

  try {
    const parsed = JSON.parse(saved);
    return {
      ...defaults,
      ...parsed,
      ingredients: mergeIngredients(defaults.ingredients, parsed.ingredients),
      grocerySelections: parsed.grocerySelections || {}
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

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderModalTabs();
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
}

function clearFilters() {
  Object.values(state.selected).forEach((setObj) => setObj.clear());
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
      addedCount: state.settings.grocerySelections[recipe.id] || 0
    };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.name.localeCompare(b.name);
  });
}

function renderRecipes() {
  const ranked = getRankedRecipes();
  els.recipeList.innerHTML = '';
  els.resultsCount.textContent = `${ranked.length} recipes`;

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

  if (!ranked.length) {
    els.recipeList.innerHTML = '<div class="empty-state">No recipes found.</div>';
    return;
  }

  ranked.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    const matchedText = recipe.matchCount
      ? `${recipe.matchCount}/${recipe.totalTrackedIngredients} matched`
      : 'Suggested recipe';

    const missingText = recipe.missing.length
      ? `${recipe.missing.length} still needed`
      : 'Ready to cook';

    const addedText = recipe.addedCount > 0
      ? `<span class="list-count-pill">List x${recipe.addedCount}</span>`
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
}

function buildMetaTags(recipe) {
  const labels = [
    ...recipe.ingredients.meats.map((id) => lookupIngredientName('meats', id)),
    ...recipe.ingredients.veggies.map((id) => lookupIngredientName('veggies', id)),
    ...recipe.ingredients.grains.map((id) => lookupIngredientName('grains', id))
  ];

  return labels.map((label) => `<span class="meta-tag">${escapeHtml(label)}</span>`).join('');
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

  const addedCount = state.settings.grocerySelections[state.activeRecipe.id] || 0;

  els.modalTitle.textContent = state.activeRecipe.name;
  els.modalMeta.innerHTML = `
    <span class="meta-tag">⏱ ${escapeHtml(state.activeRecipe.time)}</span>
    <span class="meta-tag">🍽 ${state.activeRecipe.servings} servings</span>
    <span class="meta-tag">${escapeHtml(state.activeRecipe.difficulty)}</span>
    <span class="meta-tag">Shopping list count: ${addedCount}</span>
  `;

  els.tabGrocery.innerHTML = `
    <div class="tab-actions-row">
      <button class="primary-btn" id="add-recipe-to-list-btn" type="button">Add to List</button>
      <button class="ghost-btn" id="copy-recipe-grocery-btn" type="button">Copy grocery list</button>
    </div>
    <ul class="ingredients-list">
      ${buildRecipeListItems(state.activeRecipe).map((item) => `<li>${escapeHtml(item.display)}</li>`).join('')}
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

  document.getElementById('add-recipe-to-list-btn').addEventListener('click', () => addRecipeToList(state.activeRecipe.id));
  document.getElementById('copy-recipe-grocery-btn').addEventListener('click', () => copyRecipeGrocery(state.activeRecipe.id));
  document.getElementById('copy-directions-btn').addEventListener('click', () => copyRecipeDirections(state.activeRecipe.id));

  renderModalTabs();
  els.recipeModal.classList.remove('hidden');
  els.recipeModal.setAttribute('aria-hidden', 'false');
}

function closeRecipeModal() {
  els.recipeModal.classList.add('hidden');
  els.recipeModal.setAttribute('aria-hidden', 'true');
}

function renderModalTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });
  els.tabGrocery.classList.toggle('active', state.activeTab === 'grocery');
  els.tabDirections.classList.toggle('active', state.activeTab === 'directions');
}

function openSettings() {
  els.titleInput.value = state.settings.title;
  els.taglineInput.value = state.settings.tagline;
  renderThemeOptions();
  renderIngredientManager();
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
    grocerySelections: {}
  };

  Object.values(state.selected).forEach((setObj) => setObj.clear());
  applySettingsToSite();
  saveSettings();
  renderAll();

  els.titleInput.value = state.settings.title;
  els.taglineInput.value = state.settings.tagline;
  renderThemeOptions();
  renderIngredientManager();
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
  let baseId = slugify(name);
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
  state.settings.grocerySelections[recipeId] = (state.settings.grocerySelections[recipeId] || 0) + 1;
  saveSettings();
  renderGroceryList();
  renderRecipes();
  if (state.activeRecipe?.id === recipeId) openRecipeModal(recipeId);
}

function removeShoppingItem(itemKey) {
  const recipeIds = Object.keys(state.settings.grocerySelections).filter((recipeId) => state.settings.grocerySelections[recipeId] > 0);

  for (const recipeId of recipeIds) {
    const recipe = state.recipes.find((entry) => entry.id === recipeId);
    if (!recipe) continue;
    const itemKeys = buildRecipeListItems(recipe).map((entry) => entry.key);
    if (itemKeys.includes(itemKey)) {
      state.settings.grocerySelections[recipeId] -= 1;
      if (state.settings.grocerySelections[recipeId] <= 0) {
        delete state.settings.grocerySelections[recipeId];
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
  const hasItems = Object.keys(state.settings.grocerySelections).some((recipeId) => state.settings.grocerySelections[recipeId] > 0);
  if (!hasItems) return;

  const confirmed = window.confirm('Are you sure you want to clear the grocery list?');
  if (!confirmed) return;

  state.settings.grocerySelections = {};
  saveSettings();
  renderGroceryList();
  renderRecipes();
  if (state.activeRecipe) openRecipeModal(state.activeRecipe.id);
}

function getGroceryAggregation() {
  const entries = new Map();
  const recipeSummary = [];

  Object.entries(state.settings.grocerySelections).forEach(([recipeId, count]) => {
    if (!count) return;
    const recipe = state.recipes.find((entry) => entry.id === recipeId);
    if (!recipe) return;

    recipeSummary.push(`${recipe.name} x${count}`);

    buildRecipeListItems(recipe).forEach((item) => {
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

  return {
    items: Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name)),
    recipeSummary
  };
}

function renderGroceryList() {
  const aggregated = getGroceryAggregation();
  const totalItems = aggregated.items.length;
  const totalRecipes = aggregated.recipeSummary.length;

  els.groceryRecipeSummary.textContent = totalItems
    ? `${totalRecipes} recipe selection${totalRecipes === 1 ? '' : 's'} currently rolled up into ${totalItems} shopping item${totalItems === 1 ? '' : 's'}.`
    : 'No items added yet. Open a recipe and use Add to List.';

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

function buildRecipeListItems(recipe) {
  const structured = Array.isArray(recipe.groceryItems) && recipe.groceryItems.length
    ? recipe.groceryItems
    : (recipe.groceryList || []).map(parseIngredientLine);

  return structured.map((item) => normalizeRecipeIngredient(item));
}

function normalizeRecipeIngredient(item) {
  const quantity = typeof item.quantity === 'number' ? item.quantity : null;
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
  const text = `${recipe.name}\n\n${buildRecipeListItems(recipe).map((item) => `- ${item.display}`).join('\n')}`;
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
