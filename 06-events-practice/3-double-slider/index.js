export default class DoubleSlider {
  thumbMoveHandler = (evt) => {
    evt.preventDefault();

    const { left: leftBorder, right: rightBorder, width} = this.subElements.inner.getBoundingClientRect();

    if (this.currentThumb === this.subElements.thumbLeft) {
      const rightThumbShift = rightBorder - this.subElements.thumbRight.getBoundingClientRect().left;
      let coords = evt.clientX - leftBorder;

      if (coords < 0) {
        coords = 0;
      }

      if (coords + rightThumbShift > width) {
        coords = width - rightThumbShift;
      }

      const percent = coords * 100 / width;

      this.subElements.progress.style.left = percent + '%'
      this.subElements.thumbLeft.style.left = percent + '%';
      this.subElements.from.innerHTML = this.formatValue(this.getValues().from);
    }

    if (this.currentThumb === this.subElements.thumbRight) {
      const leftThumnbShift = this.subElements.thumbLeft.getBoundingClientRect().right - leftBorder;

      let coords = rightBorder - evt.clientX;

      if (coords < 0) {
        coords = 0;
      }

      if (coords + leftThumnbShift > width) {
        coords = width - leftThumnbShift;
      }

      const percent = coords * 100 / width;

      this.subElements.progress.style.right = percent + '%'
      this.subElements.thumbRight.style.right = percent + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getValues().to);
    }
  }

  thumbUpHandler = () => {
    this.element.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.thumbMoveHandler);
    document.removeEventListener('pointerup', this.thumbUpHandler);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubbles: true,
      detail: this.getValues()
    }));
  }

  constructor({
    min = 0,
    max = 0,
    formatValue = value => value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.render();
  }

  getValues() {
    const from = Math.round(this.min + (this.max - this.min) * parseFloat(this.subElements.thumbLeft.style.left) / 100);
    const to = Math.round(this.max - (this.max - this.min) * parseFloat(this.subElements.thumbRight.style.right) / 100);
    return {
      from,
      to
    };
  }

  thumbDownHandler(evt) {
    evt.preventDefault();
    this.element.classList.add('range-slider_dragging');

    this.currentThumb = evt.target;

    document.addEventListener('pointermove', this.thumbMoveHandler)
    document.addEventListener('pointerup', this.thumbUpHandler)
  }


  setSelectedValues() {
    const diff = this.max - this.min;
    const rangeTotal = diff > 0 ? diff : 1;

    const leftShift = Math.floor((this.selected.from - this.min) / rangeTotal * 100);
    const rightShift = Math.floor((this.max - this.selected.to) / rangeTotal * 100);

    this.subElements.progress.style.left = leftShift + '%';
    this.subElements.progress.style.right = rightShift + '%';

    this.subElements.thumbLeft.style.left = leftShift + '%';
    this.subElements.thumbRight.style.right = rightShift + '%';
  }

  setEventListeners() {
    this.subElements.thumbLeft.addEventListener('pointerdown', (evt) => {
      this.thumbDownHandler(evt);
    })

    this.subElements.thumbRight.addEventListener('pointerdown', (evt) => {
      this.thumbDownHandler(evt);
    })
  }

  getTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner" data-element="inner">
          <span class="range-slider__progress" data-element="progress">
          </span>
          <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
          <span class="range-slider__thumb-right" data-element="thumbRight"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>`
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.setEventListeners();
    this.setSelectedValues();
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
    document.removeEventListener('pointermove', this.thumbMoveHandler);
    document.removeEventListener('pointerup', this.thumbUpHandler);
  }
}
