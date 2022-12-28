export default class SortableList {
  onPointerMove = evt => {
    const {clientX: x, clientY: y} = evt;
    this.moveDragging(x - this.shift.x, y - this.shift.y);

    const {y: draggingY } = this.dragging.getBoundingClientRect();

    const nextElem = this.placeHolder.nextElementSibling;
    const previousElem = this.placeHolder.previousElementSibling;

    if (nextElem && nextElem !== this.dragging) {
      const { y: nextElemY } = nextElem.getBoundingClientRect();

      if (draggingY > nextElemY) {
        nextElem.after(this.placeHolder);
      }
    }

    if (previousElem) {
      const { y: previousElemY } = previousElem.getBoundingClientRect();

      if (draggingY < previousElemY) {
        previousElem.before(this.placeHolder);
      }
    }
  }

  onPointerUp = () => {
    this.placeHolder.replaceWith(this.dragging);

    this.dragging.style.cssText = '';
    this.dragging.classList.remove('sortable-list__item_dragging');
    this.dragging = null;

    this.removeDocumentListeners();
  }

  constructor({ items = [] } = {}) {
    this.items = items;
    this.render();
  }

  getPlaceHolder(width, height) {
    const div = document.createElement('div');
    div.innerHTML = `<div class="sortable-list__placeholder" style="width: ${width}px; height: ${height}px;"></div>`;
    return div.firstElementChild;
  }

  onPoinerDown(evt) {
    const listItem = evt.target.closest('.sortable-list__item');

    if (listItem) {
      if (evt.target.closest('[data-grab-handle]')) {
        evt.preventDefault();

        this.dragging = listItem;
        const { x, y, width, height } = this.dragging.getBoundingClientRect();
        this.dragging.style.width = width + 'px';
        this.dragging.style.height = height + 'px';
        this.dragging.classList.add('sortable-list__item_dragging');

        this.placeHolder = this.getPlaceHolder(width, height);
        this.dragging.replaceWith(this.placeHolder);
        this.element.append(this.dragging);

        this.moveDragging(x, y);

        this.shift = {
          x: evt.clientX - x,
          y: evt.clientY - y
        }

        this.setDocumentListeners();
      }

      if (evt.target.closest('[data-delete-handle]')) {
        listItem.remove();
      }
    }
  }

  moveDragging(x, y) {
    this.dragging.style.left = x + 'px';
    this.dragging.style.top = y + 'px';
  }

  setDocumentListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeDocumentListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', (evt) => this.onPoinerDown(evt));
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      this.element.append(item);
    });

    this.initEventListeners();
  }


  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.removeDocumentListeners();
  }
}
