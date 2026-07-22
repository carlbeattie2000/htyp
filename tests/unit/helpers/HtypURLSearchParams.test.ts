import { describe, expect, it } from "vitest";

import HtypURLSearchParams from "../../../lib/helpers/HtypURLSearchParams";

describe("AxiosURLSearchParams::toString", () => {
  it("should pass the AxiosURLSearchParams instance as `this` to a custom encoder", () => {
    const params = new HtypURLSearchParams({ foo: "bar", baz: "qux" });
    const capturedThis: HtypURLSearchParams<object>[] = [];

    const serialized = params.toString(function customEncoder(
      this: HtypURLSearchParams<object>,
      value,
      defaultEncode,
    ) {
      capturedThis.push(this);
      return defaultEncode(value);
    });

    expect(serialized).toBe("foo=bar&baz=qux");
    expect(capturedThis).toEqual([params, params, params, params]);
  });
});
