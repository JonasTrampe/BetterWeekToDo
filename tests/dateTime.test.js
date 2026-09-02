import { describe, expect, it } from "vitest";
import dateTime from "../src/helpers/dateTime";

describe("dateTime compatibility adapter", () => {
  it("formats and strictly parses persisted calendar IDs", () => {
    expect(dateTime("20260903", "YYYYMMDD", true).format("YYYY-MM-DD")).toBe("2026-09-03");
    expect(dateTime("20261303", "YYYYMMDD", true).isValid()).toBe(false);
  });

  it("keeps date arithmetic immutable", () => {
    const original = dateTime("20260903", "YYYYMMDD", true);
    expect(original.add(1, "d").format("YYYYMMDD")).toBe("20260904");
    expect(original.format("YYYYMMDD")).toBe("20260903");
  });

  it("supports UTC cache keys and durations", () => {
    expect(dateTime.utc("20260903", "YYYYMMDD").format("YYYYMMDD")).toBe("20260903");
    expect(dateTime.duration(1234).asMilliseconds()).toBe(1234);
  });

  it("formats localized weekday names", () => {
    expect(dateTime("20260903", "YYYYMMDD", true).locale("de").format("dddd")).toBe("Donnerstag");
  });

  it("supports month navigation used by the overview", () => {
    const month = dateTime("20260903", "YYYYMMDD", true);
    expect(month.clone().startOf("month").format("YYYYMMDD")).toBe("20260901");
    expect(month.clone().date(1).format("YYYYMMDD")).toBe("20260901");
    expect(month.clone().add(1, "month").format("YYYYMMDD")).toBe("20261003");
    expect(month.daysInMonth()).toBe(30);
  });

  it("keeps weekend skipping explicit with immutable arithmetic", () => {
    const sunday = dateTime("20260906", "YYYYMMDD", true);
    let next = sunday;
    while (next.day() === 0 || next.day() === 6) next = next.add(1, "d");
    expect(next.format("YYYYMMDD")).toBe("20260907");
  });
});
