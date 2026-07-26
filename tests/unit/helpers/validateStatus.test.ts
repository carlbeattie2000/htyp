import { describe, expect, it } from "vitest";

import validateStatus from "../../../lib/helpers/validateStatus";

describe("helpers::validateStatus", () => {
  it("should return true for valid status", () => {
    const validStatus = new Array(100).fill(0).map((_, i) => i + 200);

    expect(validStatus.every((status) => validateStatus(status))).toBeTruthy();
  });

  it("should return false for invalid status", () => {
    const invalidStatus = [
      ...new Array(100).fill(0).map((_, i) => i + 100),
      ...new Array(100).fill(0).map((_, i) => i + 300),
      ...new Array(100).fill(0).map((_, i) => i + 400),
      ...new Array(100).fill(0).map((_, i) => i + 500),
    ];

    expect(invalidStatus.every((status) => validateStatus(status))).toBeFalsy();
  });
});
