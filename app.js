const STORAGE_KEYS = {
  settings: "wfd_settings_v1",
  grocery: "wfd_grocery_v1"
};

const state = {
  site: null,
  recipes: [],
  filteredRecipes: [],
  selected: {
    meats: new Set(),
    veggies: new Set(),
    grains: new Set()
  },
  pagination: {
    page: 1,
    perPage: 10
  },
  grocery: [],
  currentRecipe: null,
  currentTab: "grocery",
  settingsTab: "general"
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeToken(value) {
  return slugify(value).replace(/-/g, "");
}

function normalizeIngredientArray(values) {
  return (values || []).map(normalizeToken).filter(Boolean);
}

function saveSettings() {
  const payload = {
    branding: {
      title: document.getElementById("title-input")?.value?.trim() || state.site.branding.title,
      tagline: document.getElementById("tagline-input")?.value?.trim() || state.site.branding.tagline
    },
    theme: document.body.dataset.theme || state.site.defaultTheme,
    ingredients: {
      meats: state.site.ingredients.meats,
      veggies: state.site.ingredients.veggies,
      grains: state.site.ingredients.grains
    }
  };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(payload));
}

function loadSavedSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "null");
  } catch {
    return null;
  }
}

function saveGrocery() {
  localStorage.setItem(STORAGE_KEYS.grocery, JSON.stringify(state.grocery));
}

function loadGrocery() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.grocery) || "[]");
    state.grocery = Array.isArray(raw) ? raw : [];
  } catch {
    state.grocery = [];
  }
}

async function loadSiteConfig() {
  const res = await fetch("data/site.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load site.json");
  const site = await res.json();

  const saved = loadSavedSettings();
  if (saved?.branding) {
    site.branding = {
      title: saved.branding.title || site.branding.title,
      tagline: saved.branding.tagline || site.branding.tagline
    };
  }
  if (saved?.ingredients) {
    site.ingredients = {
      meats: Array.isArray(saved.ingredients.meats) ? saved.ingredients.meats : site.ingredients.meats,
      veggies: Array.isArray(saved.ingredients.veggies) ? saved.ingredients.veggies : site.ingredients.veggies,
      grains: Array.isArray(saved.ingredients.grains) ? saved.ingredients.grains : site.ingredients.grains
    };
  }
  site.activeTheme = saved?.theme || site.defaultTheme || "citrus";

  return site;
}

async function loadRecipeFiles() {
  try {
    const indexResponse = await fetch("data/recipes/recipe_index.json", { cache: "no-store" });
    if (!indexResponse.ok) throw new Error("No recipe index");

    const recipeIndex = await indexResponse.json();
    const files = Array.isArray(recipeIndex.files) ? recipeIndex.files : [];

    const recipeFilePromises = files.map(async (fileName) => {
      const fileResponse = await fetch(`data/recipes/${fileName}`, { cache: "no-store" });
      if (!fileResponse.ok) return [];
      const fileRecipes = await fileResponse.json();
      return Array.isArray(fileRecipes) ? fileRecipes : [];
    });

    const loadedRecipeArrays = await Promise.all(recipeFilePromises);
    return loadedRecipeArrays.flat();
  } catch {
    const res = await fetch("data/recipes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load recipes");
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.recipes)) return data.recipes;
    return [];
  }
}

function applyBranding() {
  document.getElementById("app-title").textContent = state.site.branding.title || "What's for Dinner";
  document.getElementById("app-tagline").textContent = state.site.branding.tagline || "";
  const titleInput = document.getElementById("title-input");
  const taglineInput = document.getElementById("tagline-input");
  if (titleInput) titleInput.value = state.site.branding.title || "";
  if (taglineInput) taglineInput.value = state.site.branding.tagline || "";
}

function applyTheme(themeId) {
  const themes = (state.site.themes || []).map(t => t.id);
  const validTheme = themes.includes(themeId) ? themeId : (state.site.defaultTheme || "citrus");
  document.body.classList.remove(...themes.map(id => `theme-${id}`));
  if (validTheme !== "citrus") {
    document.body.classList.add(`theme-${validTheme}`);
  }
  document.body.dataset.theme = validTheme;
  renderThemeOptions();
}

function renderThemeOptions() {
  const container = document.getElementById("theme-options");
  if (!container) return;
  const currentTheme = document.body.dataset.theme || state.site.defaultTheme || "citrus";
  container.innerHTML = "";
  (state.site.themes || []).forEach(theme => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-btn ${theme.id === currentTheme ? "active" : ""}`;
    button.textContent = theme.name;
    button.addEventListener("click", () => {
      applyTheme(theme.id);
      saveSettings();
    });
    container.appendChild(button);
  });
}

function renderIngredientChips(groupName, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const selectedSet = state.selected[groupName];
  container.innerHTML = "";

  (state.site.ingredients[groupName] || []).forEach(item => {
    const normalizedId = normalizeToken(item.id || item.name);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${selectedSet.has(normalizedId) ? "active" : ""}`;
    button.textContent = item.name;
    button.addEventListener("click", () => {
      if (selectedSet.has(normalizedId)) {
        selectedSet.delete(normalizedId);
      } else {
        selectedSet.add(normalizedId);
      }
      state.pagination.page = 1;
      renderIngredientChips("meats", "meat-chips");
      renderIngredientChips("veggies", "veggie-chips");
      renderIngredientChips("grains", "grain-chips");
      applyRecipeFilters();
      renderRecipes();
    });
    container.appendChild(button);
  });
}

function renderIngredientManager(groupName, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  (state.site.ingredients[groupName] || []).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "manage-row";
    row.innerHTML = `
      <input type="text" value="${escapeHtml(item.name)}" data-index="${index}" />
      <button class="ghost-btn small-btn" type="button" data-remove-index="${index}">Remove</button>
    `;

    const input = row.querySelector("input");
    input.addEventListener("change", () => {
      const value = input.value.trim();
      if (!value) return;
      state.site.ingredients[groupName][index] = {
        id: slugify(value),
        name: value
      };
      saveSettings();
      renderIngredientManager(groupName, elementId);
      renderIngredientChips(groupName, groupName === "meats" ? "meat-chips" : groupName === "veggies" ? "veggie-chips" : "grain-chips");
    });

    row.querySelector("button").addEventListener("click", () => {
      const removed = state.site.ingredients[groupName].splice(index, 1)[0];
      if (removed) {
        state.selected[groupName].delete(normalizeToken(removed.id || removed.name));
      }
      saveSettings();
      renderIngredientManager(groupName, elementId);
      renderIngredientChips(groupName, groupName === "meats" ? "meat-chips" : groupName === "veggies" ? "veggie-chips" : "grain-chips");
      applyRecipeFilters();
      renderRecipes();
    });

    container.appendChild(row);
  });
}

function setupIngredientAddButtons() {
  document.querySelectorAll("[data-add-ingredient]").forEach(button => {
    button.addEventListener("click", () => {
      const groupName = button.dataset.addIngredient;
      const input = document.getElementById(`add-${groupName}-input`);
      const value = input?.value?.trim();
      if (!value) return;

      state.site.ingredients[groupName].push({
        id: slugify(value),
        name: value
      });

      input.value = "";
      saveSettings();
      renderIngredientManager(groupName, groupName === "meats" ? "manage-meats" : groupName === "veggies" ? "manage-veggies" : "manage-grains");
      renderIngredientChips(groupName, groupName === "meats" ? "meat-chips" : groupName === "veggies" ? "veggie-chips" : "grain-chips");
    });
  });
}

function scoreRecipe(recipe) {
  const meats = normalizeIngredientArray(recipe.ingredients?.meats);
  const veggies = normalizeIngredientArray(recipe.ingredients?.veggies);
  const grains = normalizeIngredientArray(recipe.ingredients?.grains);

  let score = 0;
  let matches = 0;
  const selectedCount = state.selected.meats.size + state.selected.veggies.size + state.selected.grains.size;

  meats.forEach(item => {
    if (state.selected.meats.has(item)) { score += 3; matches += 1; }
  });
  veggies.forEach(item => {
    if (state.selected.veggies.has(item)) { score += 2; matches += 1; }
  });
  grains.forEach(item => {
    if (state.selected.grains.has(item)) { score += 2; matches += 1; }
  });

  return {
    score,
    matches,
    selectedCount,
    totalIngredients: meats.length + veggies.length + grains.length
  };
}

function applyRecipeFilters() {
  const hasSelections = state.selected.meats.size || state.selected.veggies.size || state.selected.grains.size;

  state.filteredRecipes = [...state.recipes]
    .map(recipe => ({ ...recipe, _match: scoreRecipe(recipe) }))
    .filter(recipe => {
      if (!hasSelections) return true;
      return recipe._match.matches > 0;
    })
    .sort((a, b) => {
      if (b._match.score !== a._match.score) return b._match.score - a._match.score;
      if (b._match.matches !== a._match.matches) return b._match.matches - a._match.matches;
      return a.name.localeCompare(b.name);
    });

  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = `${state.filteredRecipes.length} recipe${state.filteredRecipes.length === 1 ? "" : "s"}`;
  }

  const summary = document.getElementById("match-summary");
  if (summary) {
    if (!hasSelections) {
      summary.textContent = "Pick ingredients on the right to prioritize recipes that match what you already have.";
    } else if (!state.filteredRecipes.length) {
      summary.textContent = "No recipes matched the selected ingredients.";
    } else {
      summary.textContent = "Recipes are sorted with the best ingredient matches first.";
    }
  }
}

function renderRecipes() {
  const list = document.getElementById("recipe-list");
  if (!list) return;

  list.innerHTML = "";
  const start = (state.pagination.page - 1) * state.pagination.perPage;
  const pageItems = state.filteredRecipes.slice(start, start + state.pagination.perPage);

  if (!pageItems.length) {
    list.innerHTML = `<div class="match-summary">No recipes to show.</div>`;
    renderPagination();
    return;
  }

  pageItems.forEach(recipe => {
    const card = document.createElement("article");
    card.className = "recipe-card";

    const matchedMeats = normalizeIngredientArray(recipe.ingredients?.meats).filter(i => state.selected.meats.has(i)).length;
    const matchedVeggies = normalizeIngredientArray(recipe.ingredients?.veggies).filter(i => state.selected.veggies.has(i)).length;
    const matchedGrains = normalizeIngredientArray(recipe.ingredients?.grains).filter(i => state.selected.grains.has(i)).length;

    card.innerHTML = `
      <div class="recipe-card-body">
        <div class="recipe-card-top">
          <div>
            <h3>${escapeHtml(recipe.name)}</h3>
            <p>${escapeHtml(recipe.description || "")}</p>
          </div>
        </div>
        <div class="modal-meta">
          <span>${escapeHtml(recipe.time || "")}</span>
          <span>${escapeHtml(recipe.difficulty || "")}</span>
          <span>Serves ${escapeHtml(String(recipe.servings || 4))}</span>
        </div>
        <div class="modal-meta">
          <span>Meat matches: ${matchedMeats}</span>
          <span>Veg matches: ${matchedVeggies}</span>
          <span>Grain matches: ${matchedGrains}</span>
        </div>
        <div class="tab-actions-row">
          <button class="recipe-btn" type="button" data-open-recipe="${escapeHtml(recipe.id)}">View recipe</button>
          <button class="ghost-btn" type="button" data-add-all="${escapeHtml(recipe.id)}">Add all to grocery</button>
          <button class="ghost-btn" type="button" data-add-missing="${escapeHtml(recipe.id)}">Add missing only</button>
        </div>
      </div>
    `;

    card.querySelector("[data-open-recipe]").addEventListener("click", () => openRecipeModal(recipe.id));
    card.querySelector("[data-add-all]").addEventListener("click", () => addRecipeToGrocery(recipe, false));
    card.querySelector("[data-add-missing]").addEventListener("click", () => addRecipeToGrocery(recipe, true));

    list.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("recipe-pagination");
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil(state.filteredRecipes.length / state.pagination.perPage));
  if (state.pagination.page > totalPages) state.pagination.page = totalPages;

  container.innerHTML = "";

  const prev = document.createElement("button");
  prev.className = "ghost-btn small-btn";
  prev.textContent = "Prev";
  prev.disabled = state.pagination.page <= 1;
  prev.addEventListener("click", () => {
    if (state.pagination.page > 1) {
      state.pagination.page -= 1;
      renderRecipes();
    }
  });

  const status = document.createElement("span");
  status.textContent = `Page ${state.pagination.page} of ${totalPages}`;

  const next = document.createElement("button");
  next.className = "ghost-btn small-btn";
  next.textContent = "Next";
  next.disabled = state.pagination.page >= totalPages;
  next.addEventListener("click", () => {
    if (state.pagination.page < totalPages) {
      state.pagination.page += 1;
      renderRecipes();
    }
  });

  container.append(prev, status, next);
}

function getRecipeById(id) {
  return state.recipes.find(recipe => recipe.id === id) || null;
}

function openRecipeModal(recipeId) {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return;

  state.currentRecipe = recipe;
  document.getElementById("modal-title").textContent = recipe.name || "";
  document.getElementById("modal-meta").innerHTML = `
    <span>${escapeHtml(recipe.time || "")}</span>
    <span>${escapeHtml(recipe.difficulty || "")}</span>
    <span>Serves ${escapeHtml(String(recipe.servings || 4))}</span>
  `;

  renderRecipeTabs();
  document.getElementById("recipe-modal").classList.remove("hidden");
  document.getElementById("recipe-modal").setAttribute("aria-hidden", "false");
}

function closeRecipeModal() {
  document.getElementById("recipe-modal").classList.add("hidden");
  document.getElementById("recipe-modal").setAttribute("aria-hidden", "true");
}

function renderRecipeTabs() {
  const recipe = state.currentRecipe;
  if (!recipe) return;

  document.querySelectorAll(".tab-btn[data-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === state.currentTab);
  });

  const groceryTab = document.getElementById("tab-grocery");
  const directionsTab = document.getElementById("tab-directions");
  groceryTab.classList.toggle("active", state.currentTab === "grocery");
  directionsTab.classList.toggle("active", state.currentTab === "directions");

  groceryTab.innerHTML = "";
  directionsTab.innerHTML = "";

  const groceryWrap = document.createElement("div");
  groceryWrap.className = "tab-actions-stack";

  (recipe.groceryList || []).forEach(item => {
    const row = document.createElement("div");
    row.className = "ingredient-action-item";

    const isSelected = groceryContainsItem(item);
    row.innerHTML = `
      <div class="ingredient-action-copy">
        <strong>${escapeHtml(item)}</strong>
      </div>
      <div class="tab-actions-row">
        <button class="ghost-btn small-btn ${isSelected ? "is-added-btn" : ""}" type="button">Add to grocery</button>
      </div>
    `;

    row.querySelector("button").addEventListener("click", () => {
      addSingleGroceryItem(recipe, item);
      renderRecipeTabs();
      renderGroceryList();
    });

    groceryWrap.appendChild(row);
  });

  const addAllRow = document.createElement("div");
  addAllRow.className = "tab-actions-row";
  addAllRow.innerHTML = `
    <button class="recipe-btn" type="button">Add all</button>
    <button class="ghost-btn" type="button">Add missing only</button>
  `;
  addAllRow.querySelectorAll("button")[0].addEventListener("click", () => addRecipeToGrocery(recipe, false));
  addAllRow.querySelectorAll("button")[1].addEventListener("click", () => addRecipeToGrocery(recipe, true));
  groceryTab.append(groceryWrap, addAllRow);

  const steps = document.createElement("ol");
  (recipe.directions || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    steps.appendChild(li);
  });
  directionsTab.appendChild(steps);
}

function groceryContainsItem(itemText) {
  return state.grocery.some(entry => entry.item === itemText);
}

function addSingleGroceryItem(recipe, itemText) {
  if (groceryContainsItem(itemText)) return;
  state.grocery.push({
    recipeId: recipe.id,
    recipeName: recipe.name,
    item: itemText
  });
  saveGrocery();
}

function addRecipeToGrocery(recipe, missingOnly) {
  const selectedMap = {
    meats: state.selected.meats,
    veggies: state.selected.veggies,
    grains: state.selected.grains
  };

  const normalizedByGroup = {
    meats: new Set(normalizeIngredientArray(recipe.ingredients?.meats)),
    veggies: new Set(normalizeIngredientArray(recipe.ingredients?.veggies)),
    grains: new Set(normalizeIngredientArray(recipe.ingredients?.grains))
  };

  (recipe.groceryList || []).forEach(itemText => {
    if (groceryContainsItem(itemText)) return;
    if (!missingOnly) {
      addSingleGroceryItem(recipe, itemText);
      return;
    }

    const normalizedText = normalizeToken(itemText);
    let matchedOwnedIngredient = false;

    Object.keys(normalizedByGroup).forEach(group => {
      normalizedByGroup[group].forEach(recipeIngredient => {
        if (normalizedText.includes(recipeIngredient) && selectedMap[group].has(recipeIngredient)) {
          matchedOwnedIngredient = true;
        }
      });
    });

    if (!matchedOwnedIngredient) {
      addSingleGroceryItem(recipe, itemText);
    }
  });

  saveGrocery();
  renderGroceryList();
  renderRecipeTabs();
}

function renderGroceryList() {
  const list = document.getElementById("grocery-list");
  const summary = document.getElementById("grocery-recipe-summary");
  if (!list || !summary) return;

  list.innerHTML = "";

  if (!state.grocery.length) {
    summary.textContent = "No grocery items added yet.";
    list.innerHTML = `<div class="grocery-summary">Add ingredients from any recipe to build the shopping list.</div>`;
    return;
  }

  const recipeNames = [...new Set(state.grocery.map(item => item.recipeName))];
  summary.textContent = `${state.grocery.length} item${state.grocery.length === 1 ? "" : "s"} from ${recipeNames.length} recipe${recipeNames.length === 1 ? "" : "s"}`;

  state.grocery.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "shopping-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(entry.item)}</strong>
        <div class="settings-help">${escapeHtml(entry.recipeName)}</div>
      </div>
      <button class="ghost-btn small-btn" type="button">Remove</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      state.grocery.splice(index, 1);
      saveGrocery();
      renderGroceryList();
      renderRecipeTabs();
    });
    list.appendChild(row);
  });
}

function copyShoppingList() {
  const text = state.grocery.map(item => `- ${item.item} (${item.recipeName})`).join("\n");
  navigator.clipboard.writeText(text || "").catch(() => {});
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showSettingsTab(tabName) {
  state.settingsTab = tabName;
  document.querySelectorAll(".settings-nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.settingsTab === tabName);
  });
  document.querySelectorAll(".settings-page").forEach(page => {
    page.classList.toggle("active", page.dataset.settingsPage === tabName);
  });
}

function bindEvents() {
  document.getElementById("clear-filters-btn")?.addEventListener("click", () => {
    state.selected.meats.clear();
    state.selected.veggies.clear();
    state.selected.grains.clear();
    state.pagination.page = 1;
    renderIngredientChips("meats", "meat-chips");
    renderIngredientChips("veggies", "veggie-chips");
    renderIngredientChips("grains", "grain-chips");
    applyRecipeFilters();
    renderRecipes();
  });

  document.getElementById("settings-btn")?.addEventListener("click", () => {
    document.getElementById("settings-modal").classList.remove("hidden");
    document.getElementById("settings-modal").setAttribute("aria-hidden", "false");
  });

  document.querySelectorAll("[data-close-modal='true']").forEach(el => {
    el.addEventListener("click", closeRecipeModal);
  });

  document.querySelectorAll("[data-close-settings='true']").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("settings-modal").classList.add("hidden");
      document.getElementById("settings-modal").setAttribute("aria-hidden", "true");
    });
  });

  document.querySelectorAll(".tab-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentTab = btn.dataset.tab;
      renderRecipeTabs();
    });
  });

  document.querySelectorAll(".settings-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showSettingsTab(btn.dataset.settingsTab));
  });

  document.getElementById("save-settings-btn")?.addEventListener("click", () => {
    state.site.branding.title = document.getElementById("title-input").value.trim() || state.site.branding.title;
    state.site.branding.tagline = document.getElementById("tagline-input").value.trim() || state.site.branding.tagline;
    applyBranding();
    saveSettings();
  });

  document.getElementById("reset-settings-btn")?.addEventListener("click", async () => {
    localStorage.removeItem(STORAGE_KEYS.settings);
    state.site = await loadSiteConfig();
    applyBranding();
    applyTheme(state.site.activeTheme);
    renderThemeOptions();
    renderIngredientManager("meats", "manage-meats");
    renderIngredientManager("veggies", "manage-veggies");
    renderIngredientManager("grains", "manage-grains");
    renderIngredientChips("meats", "meat-chips");
    renderIngredientChips("veggies", "veggie-chips");
    renderIngredientChips("grains", "grain-chips");
  });

  document.getElementById("copy-shopping-list-btn")?.addEventListener("click", copyShoppingList);
  document.getElementById("clear-grocery-btn")?.addEventListener("click", () => {
    state.grocery = [];
    saveGrocery();
    renderGroceryList();
  });

  setupIngredientAddButtons();
}

async function init() {
  loadGrocery();
  state.site = await loadSiteConfig();
  state.recipes = await loadRecipeFiles();

  applyBranding();
  applyTheme(state.site.activeTheme);
  renderIngredientChips("meats", "meat-chips");
  renderIngredientChips("veggies", "veggie-chips");
  renderIngredientChips("grains", "grain-chips");
  renderIngredientManager("meats", "manage-meats");
  renderIngredientManager("veggies", "manage-veggies");
  renderIngredientManager("grains", "manage-grains");
  bindEvents();
  showSettingsTab("general");
  applyRecipeFilters();
  renderRecipes();
  renderGroceryList();
}

init().catch(error => {
  console.error("App init failed:", error);
  const list = document.getElementById("recipe-list");
  if (list) {
    list.innerHTML = `<div class="match-summary">Failed to load app data. Check app.js and the data folder paths.</div>`;
  }
});
