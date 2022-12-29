export default class RangePicker {
  static formatDate(date = new Date()) {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  onDocumentClick = (evt) => {
    const rangePicker = evt.target.closest('.rangepicker');

    if (!rangePicker && this.element.classList.contains('rangepicker_open')) {
      this.close();
    }
  }

  constructor(selected = {
    from: new Date(),
    to: new Date()
  }) {
    this.selected = selected;
    this.showedDate = new Date(this.selected.from);
    this.seclectingFrom = true;
    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initEventListeners();
  }

  onRangeCellClick(evt) {
    const clickedCell = evt.target.closest('.rangepicker__cell');

    if (clickedCell) {
      const cellDate = new Date(clickedCell.dataset.value);

      if (this.seclectingFrom) {
        this.selected.from = cellDate;
        this.selected.to = null;
        this.seclectingFrom = false;
        this.highlightDates();
      } else {
        if (cellDate > this.selected.from) {
          this.selected.to = cellDate;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = cellDate;
        }
        this.seclectingFrom = true;
        this.highlightDates();
      }

      if (this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.toggleRangePicker();
        this.subElements.from.textContent = RangePicker.formatDate(this.selected.from);
        this.subElements.to.textContent = RangePicker.formatDate(this.selected.to);
      }
    }
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    }))
  }

  highlightDates() {
    const { from, to } = this.selected;

    this.subElements.selector.querySelectorAll('.rangepicker__cell').forEach(cell => {
      const { value } = cell.dataset;

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      }

      if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      }

      const cellDate = new Date(value);

      if (from < cellDate && cellDate < to) {
        cell.classList.add('rangepicker__selected-between');
      }
    });
  }

  onRightArrowClick() {
    this.showedDate.setMonth(this.showedDate.getMonth() + 1);
    this.renderRangeSelector();
  }

  onLeftArrowClick() {
    this.showedDate.setMonth(this.showedDate.getMonth() - 1);
    this.renderRangeSelector();
  }

  getCalendarTemplate(dateObject = new Date()) {
    const date = new Date(dateObject);

    let calendarTemplate = '';

    const monthStr = date.toLocaleString('ru', {month: 'long'});

    calendarTemplate += `
    <div class="rangepicker__month-indicator">
        <time datetime="${monthStr}">${monthStr}</time>
    </div>
    <div class="rangepicker__day-of-week">
      <div>Пн</div>
      <div>Вт</div>
      <div>Ср</div>
      <div>Чт</div>
      <div>Пт</div>
      <div>Сб</div>
      <div>Вс</div>
    </div>`;

    const startFromValue = new Date(date.setDate(1)).getDay() + 1;

    const currentMonth = date.getMonth();

    let calendarButtonList = ``;

    while (date.getMonth() === currentMonth) {
      const day = date.getDate();

      calendarButtonList += `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}"
      style="--start-from: ${day === 1 ? startFromValue : ''}">${day}</button>`;

      date.setDate(day + 1);
    }

    calendarTemplate += `<div class="rangepicker__date-grid">${calendarButtonList}</div>`;

    return calendarTemplate;
  }

  renderRangeSelector() {
    this.subElements.selector.innerHTML = `
    <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        ${this.getCalendarTemplate(this.showedDate)}
      </div>
      <div class="rangepicker__calendar">
        ${this.getCalendarTemplate(new Date(this.showedDate).setMonth(this.showedDate.getMonth() + 1))}
      </div>
    </div>
    `
    this.subElements.selector.querySelector('.rangepicker__selector-control-left').addEventListener('click', () => this.onLeftArrowClick());
    this.subElements.selector.querySelector('.rangepicker__selector-control-right').addEventListener('click', () => this.onRightArrowClick());

    this.highlightDates();
  }

  getTemplate() {
    return `
    <div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${RangePicker.formatDate(this.selected.from)}</span> -
      <span data-element="to">${RangePicker.formatDate(this.selected.to)}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>`
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', () => {
      this.toggleRangePicker();
    });

    this.element.addEventListener('click', (evt) => this.onRangeCellClick(evt));

    document.addEventListener('click', this.onDocumentClick);
  }

  toggleRangePicker() {
    this.element.classList.toggle('rangepicker_open');
    this.renderRangeSelector();
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  getSubElements() {
    const subElements = {};

    this.element.querySelectorAll('[data-element]').forEach(dataElement => {
      subElements[dataElement.dataset.element] = dataElement;
    });

    return subElements;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('click', this.onDocumentClick);
  }
}

