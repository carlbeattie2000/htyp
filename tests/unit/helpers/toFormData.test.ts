import { describe, expect, it } from "vitest";

import toFormData from "../../../lib/helpers/toFormData";

describe("helpers::toFormData", () => {
  it("should convert a flat object to FormData", () => {
    const data = {
      foo: "bar",
      bar: 123,
    };

    const formData = toFormData(data, new FormData());

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.has("foo")).toBeTruthy();
    expect(formData.get("foo")).toBe("bar");

    expect(formData.has("bar")).toBeTruthy();
    expect(formData.get("bar")).toBe("123");
  });

  it("should convert a nested object to FormData", () => {
    const data = {
      foo: {
        bar: "baz",
      },
    };

    const formData = toFormData(data, new FormData());

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.has("foo[bar]")).toBeTruthy();
    expect(formData.get("foo[bar]")).toBe("baz");
  });

  it("should handle arrays", () => {
    const data = {
      arr: [1, 2, 3],
    };

    const formData = toFormData(data, new FormData());

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.getAll("arr[]")).toHaveLength(3);
  });

  it("should use dots if enabled", () => {
    const data = {
      foo: {
        bar: "foo",
      },
    };

    const formData = toFormData(data, new FormData(), {
      dots: true,
    });

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.has("foo.bar")).toBeTruthy();
    expect(formData.get("foo.bar")).toBe("foo");
  });

  it("should use indexes if enabled", () => {
    const data = {
      arr: [1, 2, 3],
    };

    const formData = toFormData(data, new FormData(), {
      indexes: true,
    });

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.has("arr[0]")).toBeTruthy();
    expect(formData.get("arr[0]")).toBe("1");

    expect(formData.has("arr[1]")).toBeTruthy();
    expect(formData.get("arr[1]")).toBe("2");

    expect(formData.has("arr[2]")).toBeTruthy();
    expect(formData.get("arr[2]")).toBe("3");
  });

  it("handles date object", () => {
    const now = new Date();
    const data = {
      now,
    };

    const formData = toFormData(data, new FormData(), {
      indexes: true,
    });

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.has("now")).toBeTruthy();
    expect(formData.get("now")).toBe(now.toISOString());
  });
});
