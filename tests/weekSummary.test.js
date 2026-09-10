import { describe, expect, it } from "vitest";
import { summarizeWeek } from "../src/helpers/weekSummary";

describe("weekly summary", () => {
  it("counts tasks across the selected week and supports legacy records", () => {
    const result = summarizeWeek({
      "20260831": [{ checked: false }, { status: "in_progress", checked: false }],
      "20260901": [{ checked: true }, { status: "done", checked: true }],
    }, ["20260831", "20260901", "20260902"]);

    expect(result).toEqual({ total: 4, todo: 1, inProgress: 1, done: 2 });
  });
});
