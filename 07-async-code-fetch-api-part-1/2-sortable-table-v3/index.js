import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  data = [];
  start = 0;
  step = 30;
  end = this.start + this.step;
  loading = false;

  windowScrollHandler = async () => {
    const {bottom}  = this.subElements.body.getBoundingClientRect();
    if (!this.loading && document.documentElement.clientHeight > bottom) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;

      const data = await this.loadData({
        "_sort": this.sorted.id,
        "_order": this.sorted.order,
        "_start": this.start,
        "_end": this.end
      });

      this.subElements.body.insertAdjacentHTML('beforeend', this.getBody(data));
      this.loading = false;
    }
  }

  columnClickHandler = (evt) => {
    const sortableColumn = evt.target.closest('[data-sortable="true"]');

    if (sortableColumn) {
      switch (sortableColumn.dataset.order) {
        case 'asc': {
          this.sort(sortableColumn.dataset.id, 'desc');
          break;
        }
        case 'desc': {
          this.sort(sortableColumn.dataset.id, 'asc');
          break;
        }
        case "": {
          this.sort(sortableColumn.dataset.id, 'desc');
          break;
        }
        default: break;
      }
    }
  }

  constructor(headersConfig, {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
  }

  async loadData(sortOptions = {}) {
    for (const param in sortOptions) {
      this.url.searchParams.set(param, sortOptions[param]);
    }
    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  sortOnClient (sort, order) {
    const sortedData = this.sortData(sort, order);
    this.setSortedColumn(sort, order);
    this.subElements.body.innerHTML = this.getBody(sortedData);
  }

  async sortOnServer (sort, order) {
    this.start = 0;
    this.end = this.start + this.step;
    const sortOptions = {
      "_sort": sort,
      "_order": order,
      "_start": this.start,
      "_end": this.end
    }
    const sortedData = await this.loadData(sortOptions);
    this.setSortedColumn(sort, order);
    this.subElements.body.innerHTML = this.getBody(sortedData);
  }

  sort(sort, order) {
    if (this.isSortLocally) {
      this.sortOnClient(sort, order);
    } else {
      this.sortOnServer(sort, order);
    }
  }

  setSortedColumn(sort, order) {
    this.element.querySelectorAll('.sortable-table__cell[data-id]').forEach(column => {
      column.dataset.order = '';
    });

    const sortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${sort}"]`)
    sortedColumn.dataset.order = order;
    sortedColumn.append(this.subElements.arrow);

    this.sorted.id = sort;
    this.sorted.order = order;
  }

  sortData(sort, order) {
    const dataCopy = [...this.data];
    const { sortType } = this.headersConfig.find(column => column.id === sort);

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    dataCopy.sort((a, b) => {
      switch(sortType) {
        case 'number': {
          return direction * (a[sort] - b[sort]);
        }
        case 'string': {
          return direction * a[sort].localeCompare(b[sort], ['ru', 'en']);
        }
        default: break;
      }
    });

    return dataCopy;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.data = await this.loadData({
      "_sort": this.sorted.id,
      "_order": this.sorted.order,
      "_start": this.start,
      "_end": this.end
    });
    this.subElements.body.innerHTML = this.getBody(this.data);
    this.setSortedColumn(this.sorted.id, this.sorted.order);
    this.setEventListeners();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeader()}
        </div>

        <div data-element="body" class="sortable-table__body">
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    </div>
    `
  }

  getHeader() {
    if (this.headersConfig.length) {
      return this.headersConfig.map(column => {
        return column.id === this.sorted.id
        ? `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
            <span>${column.title}</span>
            ${this.getArrow()}
           </div>`
        : `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
            <span>${column.title}</span>
           </div>`
      }).join('');
    }
  }

  getArrow() {
    return `
    <span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>`;
  }

  getRow(product) {
    const rowBody = this.headersConfig.map(column => {
      if (column.id in product) {
        return column.template
        ? column.template(product[column.id])
        : `<div class="sortable-table__cell">${product[column.id]}</div>`;
      }
    }).join('');

    return `<a href="" class="sortable-table__row">${rowBody}</a>`
  }

  getBody(data = []) {
    if (data.length) {
      return data.map(product => {
        return this.getRow(product);
      }).join('');
    }
  }

  getSubElements() {
    const subElements = {};

    this.element.querySelectorAll('[data-element]').forEach(dataElement => {
      subElements[dataElement.dataset.element] = dataElement;
    });

    return subElements;
  }

  setEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.columnClickHandler);
    if (!this.isSortLocally) {
      document.addEventListener('scroll', this.windowScrollHandler);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('scroll', this.windowScrollHandler);
  }
}
