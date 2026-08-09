const menuState = {
  dishes: [],
  filteredDishes: [],
  ingredientTree: [],
  ingredientBrowsePath: [],
  selectedIngredients: new Set(),
  selectedMethods: new Set(),
  parentByIngredient: new Map(),
  descendantsByIngredient: new Map(),
};

const elements = {
  dishCount: document.querySelector('#dish-count'),
  dishGrid: document.querySelector('#dish-grid'),
  searchBox: document.querySelector('#search-box'),
  dishSearch: document.querySelector('#dish-search'),
  filterPanel: document.querySelector('#filter-panel'),
  ingredientFilterToggle: document.querySelector('#ingredient-filter-toggle'),
  methodFilterToggle: document.querySelector('#method-filter-toggle'),
  ingredientFilterCount: document.querySelector('#ingredient-filter-count'),
  methodFilterCount: document.querySelector('#method-filter-count'),
  ingredientFilterDrawer: document.querySelector('#ingredient-filter-drawer'),
  methodFilterDrawer: document.querySelector('#method-filter-drawer'),
  ingredientCascade: document.querySelector('#ingredient-cascade'),
  methodFilters: document.querySelector('#method-filters'),
  selectedFilters: document.querySelector('#selected-filters'),
  clearFilters: document.querySelector('#clear-filters'),
  loadingState: document.querySelector('#loading-state'),
  emptyState: document.querySelector('#empty-state'),
  errorState: document.querySelector('#error-state'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeTags(tags) {
  return Array.isArray(tags)
    ? tags
        .filter((tag) => typeof tag === 'string' && tag.trim())
        .map((tag) => tag.trim())
    : [];
}

function normalizeDish(dish) {
  if (!dish || typeof dish.name !== 'string' || !dish.name.trim()) {
    return null;
  }

  return {
    name: dish.name.trim(),
    ingredients: normalizeTags(dish.ingredients),
    methods: normalizeTags(dish.methods),
  };
}

function normalizeIngredientNode(node) {
  if (typeof node === 'string' && node.trim()) {
    return { name: node.trim(), children: [] };
  }
  if (!node || typeof node.name !== 'string' || !node.name.trim()) {
    return null;
  }
  return {
    name: node.name.trim(),
    children: Array.isArray(node.children)
      ? node.children.map(normalizeIngredientNode).filter(Boolean)
      : [],
  };
}

function indexIngredientTree(nodes, parent = null) {
  nodes.forEach((node) => {
    menuState.parentByIngredient.set(node.name, parent);
    indexIngredientTree(node.children, node.name);
    const descendants = node.children.flatMap((child) => [
      child.name,
      ...(menuState.descendantsByIngredient.get(child.name) || []),
    ]);
    menuState.descendantsByIngredient.set(node.name, descendants);
  });
}

function visibleIngredientTags(dish) {
  return dish.ingredients.filter((tag) => {
    const descendants = menuState.descendantsByIngredient.get(tag) || [];
    return !descendants.some((descendant) => dish.ingredients.includes(descendant));
  });
}

function renderTags(dish) {
  const method = dish.methods.at(-1);
  const ingredients = visibleIngredientTags(dish);
  if (!ingredients.length && !method) {
    return '';
  }

  return `
    <div class="dish-tags">
      ${ingredients
        .map(
          (tag) =>
            `<span class="dish-tag dish-tag-ingredient">${escapeHtml(tag)}</span>`,
        )
        .join('')}
      ${
        method
          ? `<span class="dish-tag dish-tag-method">${escapeHtml(method)}</span>`
          : ''
      }
    </div>
  `;
}

function renderDishes(dishes) {
  elements.dishGrid.innerHTML = dishes
    .map(
      (dish) => `
        <article class="dish-card">
          <h3>${escapeHtml(dish.name)}</h3>
          ${renderTags(dish)}
        </article>
      `,
    )
    .join('');

  const filtersActive =
    Boolean(elements.dishSearch.value.trim()) ||
    menuState.selectedIngredients.size > 0 ||
    menuState.selectedMethods.size > 0;
  elements.dishCount.textContent = menuState.dishes.length
    ? filtersActive
      ? `${dishes.length}/${menuState.dishes.length} 道`
      : `${menuState.dishes.length} 道`
    : '';
  elements.dishGrid.hidden = dishes.length === 0;
  elements.emptyState.hidden = dishes.length !== 0;
  elements.emptyState.textContent = menuState.dishes.length
    ? '没有找到匹配的菜'
    : '菜单还没有内容';
}

function filterDishes() {
  const keyword = elements.dishSearch.value.trim().toLocaleLowerCase('zh-CN');

  menuState.filteredDishes = menuState.dishes.filter((dish) => {
    const searchableText = [dish.name, ...dish.ingredients, ...dish.methods]
      .join(' ')
      .toLocaleLowerCase('zh-CN');
    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesIngredients =
      menuState.selectedIngredients.size === 0 ||
      dish.ingredients.some((tag) => menuState.selectedIngredients.has(tag));
    const matchesMethods =
      menuState.selectedMethods.size === 0 ||
      dish.methods.some((tag) => menuState.selectedMethods.has(tag));
    return matchesKeyword && matchesIngredients && matchesMethods;
  });

  renderDishes(menuState.filteredDishes);
}

function uniqueTags(key) {
  const counts = new Map();
  menuState.dishes.forEach((dish) => {
    dish[key].forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  return [...counts.entries()]
    .sort(([tagA, countA], [tagB, countB]) => {
      return countB - countA || tagA.localeCompare(tagB, 'zh-CN');
    })
    .map(([tag]) => tag);
}

function renderMethodFilters() {
  elements.methodFilters.innerHTML = uniqueTags('methods')
    .map(
      (tag) => `
        <button
          class="filter-chip method-filter-chip"
          type="button"
          data-filter-value="${escapeHtml(tag)}"
          aria-pressed="false"
        >${escapeHtml(tag)}</button>
      `,
    )
    .join('');
}

function renderCascadeRow(nodes, depth, parent = null) {
  const parentOption = parent
    ? `<button
        class="cascade-select cascade-select-all"
        type="button"
        data-filter-value="${escapeHtml(parent.name)}"
        aria-pressed="false"
      >全部${escapeHtml(parent.name)}</button>`
    : '';
  const options = nodes
    .map((node) => {
      if (node.children.length) {
        const isBrowsing = menuState.ingredientBrowsePath[depth] === node.name;
        return `<button
          class="cascade-browse${isBrowsing ? ' is-browsing' : ''}"
          type="button"
          data-browse-depth="${depth}"
          data-filter-value="${escapeHtml(node.name)}"
          aria-current="${isBrowsing ? 'true' : 'false'}"
        >${escapeHtml(node.name)} <span aria-hidden="true">›</span></button>`;
      }
      return `<button
        class="cascade-select"
        type="button"
        data-filter-value="${escapeHtml(node.name)}"
        aria-pressed="false"
      >${escapeHtml(node.name)}</button>`;
    })
    .join('');
  return `<div class="cascade-row" data-cascade-depth="${depth}">${parentOption}${options}</div>`;
}

function renderIngredientCascade() {
  const rows = [renderCascadeRow(menuState.ingredientTree, 0)];
  let nodes = menuState.ingredientTree;
  const validPath = [];

  menuState.ingredientBrowsePath.forEach((name, depth) => {
    const node = nodes.find((candidate) => candidate.name === name);
    if (!node || !node.children.length) {
      return;
    }
    validPath.push(name);
    rows.push(renderCascadeRow(node.children, depth + 1, node));
    nodes = node.children;
  });

  menuState.ingredientBrowsePath = validPath;
  elements.ingredientCascade.innerHTML = rows.join('');
}

function renderFilters() {
  renderMethodFilters();
  renderIngredientCascade();
  elements.filterPanel.hidden =
    menuState.ingredientTree.length === 0 && uniqueTags('methods').length === 0;
}

function selectedFilterMarkup(label, values, group) {
  if (!values.size) {
    return '';
  }
  return `
    <span class="selected-filter-label">${label}</span>
    ${[...values]
      .map(
        (value) => `
          <button
            class="selected-filter selected-filter-${group}"
            type="button"
            data-filter-group="${group}"
            data-filter-value="${escapeHtml(value)}"
            aria-label="移除${escapeHtml(value)}筛选"
          >${escapeHtml(value)} <span aria-hidden="true">×</span></button>
        `,
      )
      .join('')}
  `;
}

function updateCountBadge(element, count) {
  element.textContent = count ? String(count) : '';
  element.hidden = count === 0;
}

function updateFilterControls() {
  elements.methodFilters.querySelectorAll('.filter-chip').forEach((button) => {
    const isActive = menuState.selectedMethods.has(button.dataset.filterValue);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  elements.ingredientCascade.querySelectorAll('.cascade-select').forEach((button) => {
    const value = button.dataset.filterValue;
    const isActive = menuState.selectedIngredients.has(value);
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  elements.ingredientCascade.querySelectorAll('.cascade-browse').forEach((button) => {
    const value = button.dataset.filterValue;
    const branchSelected =
      menuState.selectedIngredients.has(value) ||
      (menuState.descendantsByIngredient.get(value) || []).some((descendant) => {
        return menuState.selectedIngredients.has(descendant);
      });
    button.classList.toggle('has-branch-selection', branchSelected);
  });

  const ingredientCount = menuState.selectedIngredients.size;
  const methodCount = menuState.selectedMethods.size;
  updateCountBadge(elements.ingredientFilterCount, ingredientCount);
  updateCountBadge(elements.methodFilterCount, methodCount);
  elements.clearFilters.hidden = ingredientCount + methodCount === 0;

  elements.selectedFilters.innerHTML = [
    selectedFilterMarkup('材料', menuState.selectedIngredients, 'ingredients'),
    selectedFilterMarkup('做法', menuState.selectedMethods, 'methods'),
  ].join('');
  elements.selectedFilters.hidden = ingredientCount + methodCount === 0;
}

function toggleIngredient(value) {
  if (menuState.selectedIngredients.has(value)) {
    menuState.selectedIngredients.delete(value);
  } else {
    let ancestor = menuState.parentByIngredient.get(value);
    while (ancestor) {
      menuState.selectedIngredients.delete(ancestor);
      ancestor = menuState.parentByIngredient.get(ancestor);
    }
    (menuState.descendantsByIngredient.get(value) || []).forEach((descendant) => {
      menuState.selectedIngredients.delete(descendant);
    });
    menuState.selectedIngredients.add(value);
  }
  updateFilterControls();
  filterDishes();
}

function toggleMethod(value) {
  menuState.selectedMethods.has(value)
    ? menuState.selectedMethods.delete(value)
    : menuState.selectedMethods.add(value);
  updateFilterControls();
  filterDishes();
}

function toggleDrawer(group) {
  const ingredientOpen = !elements.ingredientFilterDrawer.hidden;
  const methodOpen = !elements.methodFilterDrawer.hidden;
  elements.ingredientFilterDrawer.hidden = true;
  elements.methodFilterDrawer.hidden = true;
  elements.ingredientFilterToggle.setAttribute('aria-expanded', 'false');
  elements.methodFilterToggle.setAttribute('aria-expanded', 'false');

  if (group === 'ingredients' && !ingredientOpen) {
    elements.ingredientFilterDrawer.hidden = false;
    elements.ingredientFilterToggle.setAttribute('aria-expanded', 'true');
  }
  if (group === 'methods' && !methodOpen) {
    elements.methodFilterDrawer.hidden = false;
    elements.methodFilterToggle.setAttribute('aria-expanded', 'true');
  }
}

function browseIngredient(button) {
  const depth = Number(button.dataset.browseDepth);
  menuState.ingredientBrowsePath = menuState.ingredientBrowsePath.slice(0, depth);
  menuState.ingredientBrowsePath[depth] = button.dataset.filterValue;
  renderIngredientCascade();
  updateFilterControls();
}

function clearFilters() {
  menuState.selectedIngredients.clear();
  menuState.selectedMethods.clear();
  updateFilterControls();
  filterDishes();
}

function loadMenu() {
  try {
    const data = globalThis.FAMILY_MENU;
    if (!data || !Array.isArray(data.dishes)) {
      throw new Error('Menu data must define a dishes array');
    }

    menuState.dishes = data.dishes.map(normalizeDish).filter(Boolean);
    menuState.filteredDishes = [...menuState.dishes];
    menuState.ingredientTree = Array.isArray(data.ingredientTree)
      ? data.ingredientTree.map(normalizeIngredientNode).filter(Boolean)
      : uniqueTags('ingredients').map((name) => ({ name, children: [] }));
    indexIngredientTree(menuState.ingredientTree);

    elements.loadingState.hidden = true;
    elements.searchBox.hidden = menuState.dishes.length < 8;
    elements.dishSearch.disabled = menuState.dishes.length === 0;
    renderFilters();
    updateFilterControls();
    renderDishes(menuState.dishes);
  } catch (error) {
    console.error(error);
    elements.loadingState.hidden = true;
    elements.errorState.hidden = false;
  }
}

elements.dishSearch.addEventListener('input', filterDishes);
elements.ingredientFilterToggle.addEventListener('click', () => toggleDrawer('ingredients'));
elements.methodFilterToggle.addEventListener('click', () => toggleDrawer('methods'));
elements.ingredientCascade.addEventListener('click', (event) => {
  const browseButton = event.target.closest('.cascade-browse');
  if (browseButton) {
    browseIngredient(browseButton);
    return;
  }
  const selectButton = event.target.closest('.cascade-select');
  if (selectButton) {
    toggleIngredient(selectButton.dataset.filterValue);
  }
});
elements.methodFilters.addEventListener('click', (event) => {
  const button = event.target.closest('.filter-chip');
  if (button) {
    toggleMethod(button.dataset.filterValue);
  }
});
elements.selectedFilters.addEventListener('click', (event) => {
  const button = event.target.closest('.selected-filter');
  if (!button) {
    return;
  }
  if (button.dataset.filterGroup === 'ingredients') {
    menuState.selectedIngredients.delete(button.dataset.filterValue);
  } else {
    menuState.selectedMethods.delete(button.dataset.filterValue);
  }
  updateFilterControls();
  filterDishes();
});
elements.clearFilters.addEventListener('click', clearFilters);

loadMenu();
