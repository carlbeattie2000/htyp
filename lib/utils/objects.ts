import TypeUtils from "./typeOf";
import HtypError from "../core/HtypError";

export default class ObjectUtils {
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

  public static valueReplacer<T extends object>(
    obj: T,
    keys: string[],
    replaceWith: string | undefined,
  ): T {
    const clonedObj = this.deepClone(obj);
    const lowercaseKeys = keys.map((key) => key.toString().toLowerCase());

    Object.entries(clonedObj).forEach(([key]) => {
      const keyAsLowercase = key.toLowerCase();

      if (lowercaseKeys.includes(keyAsLowercase)) {
        Object.defineProperty(clonedObj, keyAsLowercase, {
          value: replaceWith,
        });
      } else if (TypeUtils.isObject(clonedObj[keyAsLowercase as keyof T])) {
        Object.defineProperty(clonedObj, keyAsLowercase, {
          value: this.valueReplacer<any>(
            clonedObj[keyAsLowercase as keyof T],
            keys,
            replaceWith,
          ),
        });
      }
    });

    return clonedObj;
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
    if (!TypeUtils.isObject(obj)) {
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
      if (TypeUtils.isObject(value)) {
        clone[key] = this.deepClone(value);
      } else {
        clone[key] = value;
      }
    }

    return clone as T;
  }

  public static deepClone<T>(thing: T): T {
    if (!TypeUtils.isObject(thing)) {
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
        if (TypeUtils.isObject(element)) {
          return this.deepClone(element);
        }
        return element;
      }) as T;
    }

    if (TypeUtils.isPlainObject(thing)) {
      const obj = thing as Record<string, unknown>;
      const newObj: Record<string, unknown> = {};

      Object.entries(obj).forEach(([key, value]) => {
        const objKey = key as keyof object;

        if (TypeUtils.isObject(value)) {
          newObj[objKey] = this.deepClone(value);
        } else {
          newObj[objKey] = value;
        }
      });

      return newObj as T;
    }

    if (TypeUtils.isObject(thing)) {
      if ("clone" in thing && typeof thing.clone === "function") {
        return thing.clone() as T;
      }
    }

    throw new HtypError(
      `${toString.call(thing)} does not have a clone method`,
      HtypError.ERR_INSTANCE_MISSING_CLONE,
    );
  }
}
