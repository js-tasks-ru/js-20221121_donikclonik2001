export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}, isSortLocally = true) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
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

  columnClickHandler(evt) {
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

  setEventListeners() {
    this.subElements.header.addEventListener('pointerdown', (evt) => {
      this.columnClickHandler(evt);
    })
  }

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(field, order) {
    const sortedData = this.sortData(field, order);

    this.element.querySelectorAll('.sortable-table__cell[data-id]').forEach(column => {
      column.dataset.order = '';
    });

    const sortedColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`)
    sortedColumn.dataset.order = order;
    sortedColumn.append(this.subElements.arrow);

    this.subElements.body.innerHTML = this.getBody(sortedData);
  }

  sortOnServer() {

  }

  sortData(field, order) {
    const dataCopy = [...this.data];
    const { sortType } = this.headersConfig.find(column => column.id === field);

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    dataCopy.sort((a, b) => {
      switch(sortType) {
        case 'number': {
          return direction * (a[field] - b[field]);
        }
        case 'string': {
          return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        }
        default: break;
      }
    });

    return dataCopy;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.sort(this.sorted.id, this.sorted.order);
    this.setEventListeners();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    
  }
}
