import { describe, expect, it } from "vitest";

import Utils from "../../../lib/utils";

describe("objectValueReplacer", () => {
  it("should replace all matching keys with the provided value", () => {
    const obj = {
      foo: "bar",
    };

    const newObj = Utils.object.objectValueReplacer(obj, ["foo"], undefined);

    expect(newObj).toHaveProperty("foo");

    if ("foo" in newObj) {
      expect(newObj.foo).toBe(undefined);
    }
  });

  it("accepts different values for the replaced value", () => {
    const obj: { foo: string } = {
      foo: "bar",
    };

    const newObj = Utils.object.objectValueReplacer(obj, ["foo"], "redacted");

    expect(newObj.foo).toBe("redacted");
  });

  it("should replace all nested matching keys with the provided value", () => {
    const obj: { bar: { foo: string } } = {
      bar: {
        foo: "bar",
      },
    };

    const newObj = Utils.object.objectValueReplacer(obj, ["foo"], undefined);
    expect(newObj.bar).toBeDefined();
    expect(newObj.bar.foo).toBeUndefined();
  });

  it("if a keys value is a object, the whole object is replaced", () => {
    const obj: { bar: { foo: string } } = {
      bar: {
        foo: "bar",
      },
    };

    const newObj = Utils.object.objectValueReplacer(obj, ["bar"], undefined);
    expect(newObj.bar).toBeUndefined();
  });

  it("works for extreme nested objects", () => {
    interface NestedObj {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: string;
                  h: string;
                };
              };
            };
          };
        };
      };
    }

    const obj: NestedObj = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: "foo",
                  h: "bar",
                },
              },
            },
          },
        },
      },
    };

    const newObj = Utils.object.objectValueReplacer(obj, ["g"], undefined);

    expect(newObj.a.b.c.d.e.f.g).toBeUndefined();

    expect(newObj.a.b.c.d.e.f.h).toBeDefined();
    expect(newObj.a.b.c.d.e.f.h).toBe("bar");
  });
});
