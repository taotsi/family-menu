const menuState = {
  dishes: [],
  filteredDishes: [],
  lastRecommendationIndex: -1,
};

const elements = {
  updatedAt: document.querySelector('#updated-at'),
  dishCount: document.querySelector('#dish-count'),
  dishGrid: document.querySelector('#dish-grid'),
  dishSearch: document.querySelector('#dish-search'),
  loadingState: document.querySelector('#loading-state'),
  emptyState: document.querySelector('#empty-state'),
  errorState: document.querySelector('#error-state'),
  randomButton: document.querySelector('#random-button'),
  recommendationDialog: document.querySelector('#recommendation-dialog'),
  recommendedDish: document.querySelector('#recommended-dish'),
  dialogClose: document.querySelector('#dialog-close'),
  againButton: document.querySelector('#again-button'),
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

function formatUpdatedAt(dateValue) {
  if (!dateValue) {
    return '菜单已更新';
  }

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return `更新于 ${dateValue}`;
  }

  return `更新于 ${new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)}`;
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

  elements.dishCount.textContent = `${dishes.length} 道`;
  elements.dishGrid.hidden = dishes.length === 0;
  elements.emptyState.hidden = dishes.length !== 0;
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

function chooseRandomDish() {
  const candidates = menuState.filteredDishes.length
    ? menuState.filteredDishes
    : menuState.dishes;

  if (!candidates.length) {
    return;
  }

  let selectedIndex = Math.floor(Math.random() * candidates.length);
  if (candidates.length > 1 && selectedIndex === menuState.lastRecommendationIndex) {
    selectedIndex = (selectedIndex + 1) % candidates.length;
  }
  menuState.lastRecommendationIndex = selectedIndex;

  const dish = candidates[selectedIndex];
  elements.recommendedDish.textContent = dish.name;

  if (elements.recommendationDialog.open) {
    return;
  }
  elements.recommendationDialog.showModal();
}

function loadMenu() {
  try {
    const data = globalThis.FAMILY_MENU;
    if (!data || !Array.isArray(data.dishes)) {
      throw new Error('Menu data must define a dishes array');
    }

    menuState.dishes = data.dishes.map(normalizeDish).filter(Boolean);
    menuState.filteredDishes = [...menuState.dishes];

    elements.updatedAt.textContent = formatUpdatedAt(data.updatedAt);
    elements.loadingState.hidden = true;
    elements.dishSearch.disabled = false;
    elements.randomButton.disabled = menuState.dishes.length === 0;
    renderDishes(menuState.dishes);
  } catch (error) {
    console.error(error);
    elements.updatedAt.textContent = '菜单读取失败';
    elements.loadingState.hidden = true;
    elements.errorState.hidden = false;
  }
}

elements.dishSearch.addEventListener('input', filterDishes);
elements.randomButton.addEventListener('click', chooseRandomDish);
elements.againButton.addEventListener('click', chooseRandomDish);
elements.dialogClose.addEventListener('click', () => {
  elements.recommendationDialog.close();
});
elements.recommendationDialog.addEventListener('click', (event) => {
  if (event.target === elements.recommendationDialog) {
    elements.recommendationDialog.close();
  }
});

loadMenu();
