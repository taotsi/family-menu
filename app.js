const menuState = {
  dishes: [],
  filteredDishes: [],
};

const elements = {
  dishCount: document.querySelector('#dish-count'),
  dishGrid: document.querySelector('#dish-grid'),
  searchBox: document.querySelector('#search-box'),
  dishSearch: document.querySelector('#dish-search'),
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

function normalizeDish(dish) {
  if (!dish || typeof dish.name !== 'string' || !dish.name.trim()) {
    return null;
  }

  return {
    name: dish.name.trim(),
    tags: Array.isArray(dish.tags)
      ? dish.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
      : [],
  };
}

function renderTags(tags) {
  if (!tags.length) {
    return '';
  }

  return `
    <div class="dish-tags">
      ${tags.map((tag) => `<span class="dish-tag">${escapeHtml(tag)}</span>`).join('')}
    </div>
  `;
}

function renderDishes(dishes) {
  elements.dishGrid.innerHTML = dishes
    .map(
      (dish) => `
        <article class="dish-card">
          <h3>${escapeHtml(dish.name)}</h3>
          ${renderTags(dish.tags)}
        </article>
      `,
    )
    .join('');

  elements.dishCount.textContent = dishes.length ? `${dishes.length} 道` : '';
  elements.dishGrid.hidden = dishes.length === 0;
  elements.emptyState.hidden = dishes.length !== 0;
  elements.emptyState.textContent = menuState.dishes.length
    ? '没有找到匹配的菜'
    : '菜单还没有内容';
}

function filterDishes() {
  const keyword = elements.dishSearch.value.trim().toLocaleLowerCase('zh-CN');

  menuState.filteredDishes = keyword
    ? menuState.dishes.filter((dish) => {
        const searchableText = [dish.name, ...dish.tags]
          .join(' ')
          .toLocaleLowerCase('zh-CN');
        return searchableText.includes(keyword);
      })
    : [...menuState.dishes];

  renderDishes(menuState.filteredDishes);
}

function loadMenu() {
  try {
    const data = globalThis.FAMILY_MENU;
    if (!data || !Array.isArray(data.dishes)) {
      throw new Error('Menu data must define a dishes array');
    }

    menuState.dishes = data.dishes.map(normalizeDish).filter(Boolean);
    menuState.filteredDishes = [...menuState.dishes];

    elements.loadingState.hidden = true;
    elements.searchBox.hidden = menuState.dishes.length < 8;
    elements.dishSearch.disabled = menuState.dishes.length === 0;
    renderDishes(menuState.dishes);
  } catch (error) {
    console.error(error);
    elements.loadingState.hidden = true;
    elements.errorState.hidden = false;
  }
}

elements.dishSearch.addEventListener('input', filterDishes);

loadMenu();
