export default class NotificationMessage {
  static renderedInstance = null;

  static removeInstance() {
    this.renderedInstance?.remove();
  }

  constructor(message = 'Hello Wold', { type = 'success', duration = 0 } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.render();
  }

  getTemplate() {
    return `
    <div class="notification" style="--value:${Math.floor(this.duration / 1000)}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
      </div>
    </div>
    ${this.message}
  </div>`
  }

  renderStatus() {
    switch (this.type) {
      case 'success': {
        this.element.classList.add('success');
        break;
      }
      case 'error': {
        this.element.classList.add('error');
        break;
      }
      default: break;
    }
  }

  startCountDown() {
    setTimeout(() => {
      NotificationMessage.renderedInstance = null;
      this.remove();
    }, this.duration)
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.renderStatus();
  }

  show(element = document.body) {
    NotificationMessage.removeInstance();
    NotificationMessage.renderedInstance = this;
    element.append(this.element);
    this.startCountDown();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}
