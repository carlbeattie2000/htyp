import { describe, expect, it } from "vitest";

import ObjectUtils from "../../../lib/utils/objects";

describe("ObjectUtils::merge", () => {
  it("should return the object when it is the only parameter", () => {
    const obj = {
      foo: "bar",
    };

    const combined = ObjectUtils.merge(obj);

    expect(combined).toEqual(obj);
  });

  it("should merge flat objects", () => {
    const obj = {
      foo: "bar",
    };

    const objExtended = {
      bar: "foo",
    };

    const combined = ObjectUtils.merge(obj, objExtended);

    expect(combined).toEqual({
      foo: "bar",
      bar: "foo",
    });
  });

  it("proceeding targets should overwrite preceding targets when config is flat", () => {
    const obj = {
      foo: "bar",
    };

    const objExtended = {
      foo: "none",
      bar: "foo",
    };

    const combined = ObjectUtils.merge(obj, objExtended);

    expect(combined).toEqual({
      foo: "none",
      bar: "foo",
    });
  });

  it("should merge nested objects", () => {
    const obj = {
      foo: "bar",
      person: {
        name: "john",
      },
    };

    const objExtended = {
      bar: "foo",
      person: {
        age: 25,
      },
    };

    const combined = ObjectUtils.merge(obj, objExtended);

    expect(combined).toEqual({
      foo: "bar",
      bar: "foo",
      person: {
        name: "john",
        age: 25,
      },
    });
  });

  it("proceeding targets should overwrite preceding targets when config is nested", () => {
    const obj = {
      foo: "bar",
      person: {
        name: "john",
      },
    };

    const objExtended = {
      bar: "foo",
      person: {
        name: "james",
        age: 25,
      },
    };

    const combined = ObjectUtils.merge(obj, objExtended);

    expect(combined).toEqual({
      foo: "bar",
      bar: "foo",
      person: {
        name: "james",
        age: 25,
      },
    });
  });

  it("should return the array when it's the only parameter", () => {
    const arr = [1, 2, 3];

    const combined = ObjectUtils.merge(arr);

    expect(combined).toEqual(arr);
  });

  it("should merge flat arrays", () => {
    const arr = [1, 2, 3];
    const arrExtended = [4, 5, 6];

    const combined = ObjectUtils.merge(arr, arrExtended);

    expect(combined).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should merge nested arrays", () => {
    const arr = [1, 2, 3];
    const arrExtended = [4, 5, 6, [7, 8, 9]];

    const combined = ObjectUtils.merge(arr, arrExtended);

    expect(combined).toEqual([1, 2, 3, 4, 5, 6, [7, 8, 9]]);
  });

  it("should merge arrays that contain objects", () => {
    const arr = [1, 2, 3];
    const arrExtended = [4, 5, 6, { name: "john" }];

    const combined = ObjectUtils.merge(arr, arrExtended);

    expect(combined).toEqual([1, 2, 3, 4, 5, 6, { name: "john" }]);
  });

  it("should not merge objects inside an array that share properties", () => {
    const arr = [1, 2, 3, { age: 20 }];
    const arrExtended = [4, 5, 6, { age: 25 }, { name: "john" }];

    const combined = ObjectUtils.merge(arr, arrExtended);

    expect(combined).toEqual([
      1,
      2,
      3,
      { age: 20 },
      4,
      5,
      6,
      { age: 25 },
      { name: "john" },
    ]);
  });

  it("should support more than two targets", () => {
    const obj = { name: "john" };
    const objExtended = { age: 25 };
    const objModified = { title: "mr" };

    const combined = ObjectUtils.merge(obj, objExtended, objModified);

    expect(combined).toEqual({
      name: "john",
      age: 25,
      title: "mr",
    });
  });

  it("last target should win", () => {
    const obj = { name: "john" };
    const objExtended = { age: 25 };
    const objModified = { name: "james", title: "mr" };

    const combined = ObjectUtils.merge(obj, objExtended, objModified);

    expect(combined).toEqual({
      name: "james",
      age: 25,
      title: "mr",
    });
  });
});
