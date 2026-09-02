export default class ClickHandler {
  constructor(delay = 350) {
    this.delay = delay;
    this.handlers = new Map();
  }

  handle(clickCallback, doubleClickCallback, id = "default") {
    const handler = this.getHandler(id);
    handler.clicks += 1;

    if (handler.clicks === 1) {
      handler.timer = setTimeout(() => {
        clickCallback();
        handler.clicks = 0;
      }, this.delay);
      return;
    }

    clearTimeout(handler.timer);
    doubleClickCallback();
    handler.clicks = 0;
  }

  getHandler(id) {
    if (!this.handlers.has(id)) {
      this.handlers.set(id, { clicks: 0, timer: null });
    }
    return this.handlers.get(id);
  }
}
