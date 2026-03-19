import { add } from "../utils.js";
import { describe, it, expect } from "vitest";

describe("add()", () => {
  it("adds 1 + 2 to equal 3", () => {
    expect(add(1, 2)).toBe(3);
  });
});