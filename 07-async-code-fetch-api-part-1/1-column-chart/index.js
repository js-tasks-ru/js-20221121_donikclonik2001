import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    formatHeading = data => data,
    chartHeight = 50
  } = {})
  {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;
    this.chartHeight = chartHeight;
    this.render();
  }

  getTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `
  }

  async fetchData() {
    this.url.searchParams.set('from', this.range.from.toISOString());
    this.url.searchParams.set('to', this.range.to.toISOString());

    return await fetchJson(this.url);
  }

  setNewDates(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getColumnProps() {
    const values = Object.values(this.data);
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    return values.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getValueElements() {
    return this.getColumnProps().map(columnProp => {
      return `<div style="--value: ${columnProp.value}" data-tooltip="${columnProp.percent}"></div>`
    }).join('');
  }

  getValue() {
    return this.formatHeading(Object.values(this.data).reduce((sum, value) => {
      return sum += value;
    }, 0));
  }

  getLink() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`
    } else {
      return '';
    }
  }

  async update(from, to) {
    this.setNewDates(from, to);
    this.element.classList.add('column-chart_loading');
    try {
      this.data = await this.fetchData(this.url);
      this.subElements.body.innerHTML = this.getValueElements();
      this.subElements.header.textContent = this.getValue();
      this.element.classList.remove('column-chart_loading');
    } catch (err) {
      console.log(err);
    }
    return this.data;
  }

  getSubElements() {
    const subElements = {};

    this.element.querySelectorAll('[data-element]').forEach(dataElement => {
      subElements[dataElement.dataset.element] = dataElement;
    });

    return subElements;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.update(this.range.from, this.range.to);
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
