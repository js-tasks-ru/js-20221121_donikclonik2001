class Tooltip {
  static activeTooltip;

  pointerOverHandler = (evt) => {
    if (evt.target.dataset.tooltip) {
      this.render();
      this.element.textContent = evt.target.dataset.tooltip;
    }
  }

  pointerMoveHandler = (evt) => {
    this.element.style.left = evt.clientX + 'px';
    this.element.style.top = evt.clientY + 'px';
  }

  pointerOutHandler = (evt) => {
    if (evt.target.dataset.tooltip) {
      this.remove();
    }
  }

  constructor() {
    if (Tooltip.activeTooltip) return Tooltip.activeTooltip;

    this.element = document.createElement('div');
    this.element.classList.add('tooltip');
    Tooltip.activeTooltip = this;
  }

  initialize () {
    document.addEventListener('pointerover', this.pointerOverHandler);
    document.addEventListener('pointermove', this.pointerMoveHandler);
    document.addEventListener('pointerout', this.pointerOutHandler);
  }

  render() {
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    Tooltip.activeTooltip = null;

    document.removeEventListener('pointerover', this.pointerOverHandler);
    document.removeEventListener('pointermove', this.pointerMoveHandler);
    document.removeEventListener('pointerout', this.pointerOutHandler);
  }
}

export default Tooltip;
