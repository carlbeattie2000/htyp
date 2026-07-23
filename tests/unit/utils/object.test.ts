import { describe, expect, it } from "vitest";

import ObjectUtils from "../../../lib/utils/objects";

describe("ObjectUtils::removeUndefinedProperties", () => {
  it("should remove all properties that are undefined", () => {
    const obj = {
      foo: "bar",
      bar: undefined,
    };

    ObjectUtils.removeUndefinedProperties(obj);

    expect(obj).not.toHaveProperty("bar");
  });

  it("should remove all properties that are undefined at any depth", () => {
    const obj = {
      foo: "bar",
      bar: {
        x: undefined,
      },
    };

    ObjectUtils.removeUndefinedProperties(obj);

    expect(obj.bar).not.toHaveProperty("x");
  });

  it("allows a max depth to be set", () => {
    const obj = {
      foo: "bar",
      bar: {
        x: {
          y: undefined,
        },
        z: undefined,
      },
    };

    ObjectUtils.removeUndefinedProperties(obj, [], 1);

    expect(obj.bar).not.toHaveProperty("z");
    expect(obj.bar.x).toHaveProperty("y");
  });

  it("allows a array of keys to exclude", () => {
    const obj = {
      foo: undefined,
      bar: undefined,
      x: {
        y: undefined,
      },
    };

    ObjectUtils.removeUndefinedProperties(obj, ["bar", "x"]);

    expect(obj).not.toHaveProperty("foo");
    expect(obj).toHaveProperty("bar");
  });

  it("does not treat null as a object", () => {
    const obj = {
      foo: undefined,
      bar: null,
    };

    ObjectUtils.removeUndefinedProperties(obj);

    expect(obj).not.toHaveProperty("foo");
    expect(obj).toHaveProperty("bar");
  });

  it("does not treat array as object", () => {
    const obj = {
      foo: undefined,
      bar: [undefined],
    };

    ObjectUtils.removeUndefinedProperties(obj);

    expect(obj).not.toHaveProperty("foo");
    expect(obj).toHaveProperty("bar");
  });
});

describe("ObjectUtils::deepClone", () => {
  it("accepts primatives", () => {
    expect(ObjectUtils.deepClone(1)).toEqual(1);
  });

  it("clones a simple object", () => {
    const obj = {
      foo: "bar",
    };

    const clonedObj = ObjectUtils.deepClone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
  });

  it("clones a deeply nested object", () => {
    const obj = {
      foo: "bar",
      bar: {
        foo: {
          bar: {
            foo: "bar",
          },
        },
      },
    };

    const clonedObj = ObjectUtils.deepClone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
  });

  it("clones methods", () => {
    const obj = {
      foo: () => "bar",
    };

    const clonedObj = ObjectUtils.deepClone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
    expect(typeof clonedObj.foo === "function").toBeTruthy();
  });

  it("clones classes", () => {
    class Person {
      public name: string;

      public age: number;

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }

      public toString() {
        return `${this.name}.${this.age}`;
      }

      public clone() {
        return new Person(this.name, this.age);
      }
    }

    const instance = new Person("joe", 25);

    const clonedInstance = ObjectUtils.deepClone(instance);

    expect(clonedInstance).toEqual(instance);
    expect(clonedInstance).not.toBe(instance);
    expect(typeof clonedInstance.toString === "function").toBeTruthy();
    expect(clonedInstance).toBeInstanceOf(Person);
  });

  it("deep clones classes", () => {
    class Person {
      public name: string;

      public age: number;

      public friendAges: Record<string, number> = {};

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }

      public addFriendsAge(name: string, age: number) {
        this.friendAges[name] = age;
      }

      public toString() {
        return `${this.name}.${this.age}`;
      }

      public clone() {
        const person = new Person(this.name, this.age);

        person.friendAges = {
          ...this.friendAges,
        };

        return person;
      }
    }

    const instance = new Person("joe", 25);
    instance.addFriendsAge("bob", 30);

    const clonedInstance = ObjectUtils.deepClone(instance);

    expect(clonedInstance).toEqual(instance);
    expect(clonedInstance).not.toBe(instance);
    expect(clonedInstance.friendAges).not.toBe(instance.friendAges);
    expect(clonedInstance).toBeInstanceOf(Person);
  });
});
