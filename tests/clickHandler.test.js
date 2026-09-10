import { afterEach, describe, expect, it, vi } from "vitest";
import ClickHandler from "../src/helpers/clickHandler";

describe("ClickHandler", () => {
  afterEach(() => vi.useRealTimers());

  it("delays a single-click action", () => {
    vi.useFakeTimers();
    const click = vi.fn();
    const doubleClick = vi.fn();

    new ClickHandler(100).handle(click, doubleClick);
    expect(click).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);

    expect(click).toHaveBeenCalledOnce();
    expect(doubleClick).not.toHaveBeenCalled();
  });

  it("cancels the single-click action on a double click", () => {
    vi.useFakeTimers();
    const click = vi.fn();
    const doubleClick = vi.fn();
    const handler = new ClickHandler(100);

    handler.handle(click, doubleClick, "task");
    handler.handle(click, doubleClick, "task");
    vi.runAllTimers();

    expect(click).not.toHaveBeenCalled();
    expect(doubleClick).toHaveBeenCalledOnce();
  });
});
