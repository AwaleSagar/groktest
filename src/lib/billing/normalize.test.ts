import { describe, expect, it } from "vitest";
import { monthlyEquivalent } from "./normalize";

describe("monthlyEquivalent", () => {
  it("normalizes yearly to monthly", () => {
    expect(monthlyEquivalent(1200, "yearly")).toBe(100);
  });

  it("normalizes quarterly to monthly", () => {
    expect(monthlyEquivalent(300, "quarterly")).toBe(100);
  });

  it("returns zero for one-time", () => {
    expect(monthlyEquivalent(500, "one_time")).toBe(0);
  });

  it("handles custom cycle", () => {
    expect(monthlyEquivalent(30, "custom", 30)).toBeCloseTo(30);
  });
});