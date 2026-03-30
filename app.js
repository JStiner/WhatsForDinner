const STORAGE_KEY = 'wfd-demo-settings-v1';

const state = {
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
  recipeModal: document.getElementById('recipe-modal'),
  settingsModal: document.getElementById('settings-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalMeta: document.getElementById('modal-meta'),
  tabGrocery: document.getElementById('tab-grocery'),
  tabDirections: document.getElementById('tab-directions'),
  titleInput: document.getElementById('title-input'),
  taglineInput: document.getElementById('tagline-input'),
  themeOptions: document.getElementById('theme-options')
};

init();

async function init() {
  const [site, recipes] = await Promise.all([
    fetchJson('./data/site.json'),
    fetchJson('./data/recipes.json')
  ]);

  state.site = site;
  state.recipes = recipes;
  state.settings = loadSettings(site);

  bindEvents();
  renderBranding();
  renderThemeOptions();
  renderChips();
  renderRecipes();
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function loadSettings(site) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }

  return {
    title: site.branding.title,
    tagline: site.branding.tagline,
    theme: site.defaultTheme
  };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}

function bindEvents() {
  document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('save-settings-btn').addEventListener('click', handleSaveSettings);
  document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);

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
}

function renderBranding() {
  els.appTitle.textContent = state.settings.title;
  els.appTagline.textContent = state.settings.tagline;
  document.body.className = `theme-${state.settings.theme}`;
}

function renderThemeOptions() {
  els.themeOptions.innerHTML = '';
  state.site.themes.forEach((theme) => {
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

    if (selectedCount === 0) {
      score = 0;
    }

    return {
      ...recipe,
      matchCount: matched.length,
      totalTrackedIngredients: required.length,
      matched,
      missing,
      score
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

    card.innerHTML = `
      <div class="recipe-top">
        <div>
          <div class="recipe-title-row">
            <h3>${escapeHtml(recipe.name)}</h3>
            <span class="badge">${escapeHtml(recipe.difficulty)}</span>
            <span class="score-pill">${escapeHtml(matchedText)}</span>
            <span class="missing-pill">${escapeHtml(missingText)}</span>
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
  return state.site.ingredients[group].find((item) => item.id === id)?.name || id;
}

function openRecipeModal(recipeId) {
  state.activeRecipe = state.recipes.find((recipe) => recipe.id === recipeId) || null;
  state.activeTab = 'grocery';

  if (!state.activeRecipe) return;

  els.modalTitle.textContent = state.activeRecipe.name;
  els.modalMeta.innerHTML = `
    <span class="meta-tag">⏱ ${escapeHtml(state.activeRecipe.time)}</span>
    <span class="meta-tag">🍽 ${state.activeRecipe.servings} servings</span>
    <span class="meta-tag">${escapeHtml(state.activeRecipe.difficulty)}</span>
  `;

  els.tabGrocery.innerHTML = `
    <ul class="ingredients-list">
      ${state.activeRecipe.groceryList.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;

  els.tabDirections.innerHTML = `
    <ol class="directions-list">
      ${state.activeRecipe.directions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
    </ol>
  `;

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
  els.settingsModal.classList.remove('hidden');
  els.settingsModal.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
  els.settingsModal.classList.add('hidden');
  els.settingsModal.setAttribute('aria-hidden', 'true');
}

function handleSaveSettings() {
  state.settings.title = els.titleInput.value.trim() || state.site.branding.title;
  state.settings.tagline = els.taglineInput.value.trim() || state.site.branding.tagline;
  saveSettings();
  renderBranding();
  closeSettings();
}

function resetSettings() {
  state.settings = {
    title: state.site.branding.title,
    tagline: state.site.branding.tagline,
    theme: state.site.defaultTheme
  };
  saveSettings();
  renderBranding();
  renderThemeOptions();
  els.titleInput.value = state.settings.title;
  els.taglineInput.value = state.settings.tagline;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
