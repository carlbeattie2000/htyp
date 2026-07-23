const { iterator, toStringTag } = Symbol;

export default class ObjectUtils {
  public static hasOwnInPrototypeChain(
    thing: unknown,
    prop: string | symbol,
  ): boolean {
    let obj = thing;
    const seen: object[] = [];

    while (obj != null && obj !== Object.prototype) {
      if (seen.includes(obj)) {
        return false;
      }
      seen.push(obj);

      if (Object.hasOwn(obj, prop.toString())) {
        return true;
      }
      obj = Object.getPrototypeOf(obj);
    }
    return false;
  }

  public static removeUndefinedProperties<T extends object>(
    obj: T,
    excludeKeys: (Extract<keyof T, string> | (string & {}))[] = [],
    maxDepth = -1,
    currentDepth = 0,
  ): T {
    if (maxDepth >= 0 && currentDepth > maxDepth) {
      return obj;
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (!excludeKeys.includes(key)) {
        if (value === undefined) {
          delete obj[key as keyof T];
        }

        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          this.removeUndefinedProperties(
            value,
            excludeKeys,
            maxDepth,
            currentDepth + 1,
          );
        }
      }
    });

    return obj;
  }

  public static isObject(obj: unknown): boolean {
    return typeof obj === "object" && obj !== null;
  }

  public static isPlainObject(obj: unknown): boolean {
    if (!this.isObject(obj)) {
      return false;
    }

    const prototype = Object.getPrototypeOf(obj);

    return (
      prototype === null ||
      prototype === Object.prototype ||
      (Object.getPrototypeOf(prototype) === null &&
        !this.hasOwnInPrototypeChain(obj, toStringTag) &&
        !this.hasOwnInPrototypeChain(obj, iterator))
    );
  }

  public static forEach(
    obj: object,
    each: (key: string, value: unknown) => void,
  ): void {
    if (obj instanceof Map) {
      obj.forEach((value, key) => {
        each(key, value);
      });
      return;
    }
    Object.entries(obj).forEach(([key, value]) => {
      each(key, value);
    });
  }

  public static iterateObject<T extends object>(
    obj: T,
    onVisit: (key: string, value: unknown, path?: string[]) => boolean,
    path?: string[],
  ): void {
    if (!this.isObject(obj)) {
      throw new TypeError("target should be an object");
    }

    const entries = Object.entries(obj);

    entries.forEach(([key, value]) => {
      if (onVisit(key, value, path)) {
        this.iterateObject(value, onVisit, path ? path.concat(key) : [key]);
      }
    });
  }

  public static deepCloneInstance<T extends object>(instance: T): T {
    const proto = Object.getPrototypeOf(instance);
    const clone = Object.create(proto);

    for (const [key, value] of Object.entries(instance)) {
      if (this.isObject(value)) {
        clone[key] = this.deepClone(value);
      } else {
        clone[key] = value;
      }
    }

    return clone as T;
  }

  public static deepClone<T>(thing: T): T {
    if (!this.isObject(thing)) {
      return thing;
    }

    if (thing instanceof Map) {
      const clone = new Map();
      this.forEach(thing, (key, value) => {
        clone.set(key, value);
      });
      return clone as T;
    }

    if (thing instanceof FormData) {
      const clone = new FormData();
      thing.forEach((value, key) => {
        clone.append(key, value);
      });
      return clone as T;
    }

    if (Array.isArray(thing)) {
      return thing.map((element): any => {
        if (this.isObject(element)) {
          return this.deepClone(element);
        }
        return element;
      }) as T;
    }

    if (this.isPlainObject(thing)) {
      const obj = thing as Record<string, unknown>;
      const newObj: Record<string, unknown> = {};

      Object.entries(obj).forEach(([key, value]) => {
        const objKey = key as keyof object;

        if (this.isObject(value)) {
          newObj[objKey] = this.deepClone(value);
        } else {
          newObj[objKey] = value;
        }
      });

      return newObj as T;
    }

    return this.deepCloneInstance(thing as object) as T;
  }
}
