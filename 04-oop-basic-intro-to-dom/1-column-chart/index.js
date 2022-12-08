export default class ColumnChart {
  constructor({ data = [], label = '', value = 0, link = '', formatHeading = data => data, chartHeight = 50 } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.chartHeight = chartHeight;
    this.renderColumnChart();
  }

  getTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        ${this.getValueElements()}
        </div>
      </div>
    </div>
    `
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
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

  getLink() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`
    } else {
      return '';
    }
  }

  renderLoading(data) {
    if (!data.length) {
      this.element.classList.add('column-chart_loading');
    }
  }

  update(newData) {
    this.renderLoading(newData);
    this.data = newData;
    this.chartBody.innerHTML = this.getValueElements();
  }

  renderColumnChart() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.renderLoading(this.data);
    this.chartBody = this.element.querySelector('.column-chart__chart');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
    this.element = null;
  }
}
