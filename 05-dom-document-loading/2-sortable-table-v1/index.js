export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
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
        ${this.getBody(this.data)}
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
    if (this.headerConfig.length) {
      return this.headerConfig.map(column => {
        return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
        <span>${column.title}</span>
      </div>`
      }).join('');
    }
  }

  getRow(product) {
    const rowBody = this.headerConfig.map(column => {
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

  sort(field, order) {
    const dataCopy = [...this.data];
    const { sortType } = this.headerConfig.find(column => column.id === field);

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

    this.element.querySelectorAll('.sortable-table__cell[data-id]').forEach(column => {
      column.dataset.order = '';
    });

    this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`).dataset.order = order;

    this.subElements.body.innerHTML = this.getBody(dataCopy);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}

