import ObjectUtils from "./objects";
import TypeUtils from "./typeOf";

import type HtypError from "../core/HtypError";

export default class Utils {
  public static Object = ObjectUtils;

  static #kindOfTest = TypeUtils.kindOfTest;

  static #typeOfTest = TypeUtils.typeOfTest;

  public static unsafeKindOfTest = TypeUtils.unsafeKindOfTest;

  public static isArrayBuffer(thing: unknown): thing is ArrayBuffer {
    return this.#kindOfTest("ArrayBuffer")(thing);
  }

  public static isArrayBufferView(thing: unknown): thing is ArrayBufferView {
    return this.isArrayBuffer(thing) && ArrayBuffer.isView(thing);
  }

  public static isString(thing: unknown): thing is string {
    return this.#typeOfTest("string")(thing);
  }

  public static isFunction(thing: unknown): thing is typeof Function {
    return this.#typeOfTest("function")(thing);
  }

  public isNumber(thing: unknown): thing is number {
    return Utils.#typeOfTest("number")(thing);
  }

  public static isObject = this.Object.isObject;

  public static isPlainObject = this.Object.isPlainObject;

  public isBoolean(thing: unknown): thing is boolean {
    return Utils.#typeOfTest("boolean")(thing);
  }

  public static isArray(thing: unknown): thing is unknown[] {
    return Array.isArray(thing);
  }

  public static isReadableStream(thing: unknown): thing is ReadableStream {
    return thing instanceof ReadableStream;
  }

  public isDate(thing: unknown): thing is Date {
    return Utils.#kindOfTest("Date")(thing);
  }

  public static isFile(thing: unknown): thing is File {
    return this.#kindOfTest("File")(thing);
  }

  public static isBlob(thing: unknown): thing is Blob {
    return this.#kindOfTest("Blob")(thing);
  }

  public isFileList(thing: unknown): thing is File[] {
    return Utils.#kindOfTest("FileList")(thing);
  }

  public static isFormData(thing: unknown): thing is FormData {
    return thing instanceof FormData;
  }

  public static isURLSearchParams(thing: unknown): thing is URLSearchParams {
    return thing instanceof URLSearchParams;
  }

  public static isSet(thing: unknown): thing is Set<any> {
    return this.#kindOfTest("Set")(thing);
  }

  public static isHtypError(error: Error): error is HtypError {
    return "_brand" in error && error._brand === "HtypError";
  }

  public static isNumber(thing: unknown): thing is number {
    return typeof thing === "number";
  }

  public static isDate(thing: unknown): thing is Date {
    return thing instanceof Date;
  }

  public static isFlatArray(thing: unknown[]): boolean {
    return !thing.some((el) => this.isPlainObject(el) || this.isArray(el));
  }

  public static isThenable(thing: unknown): thing is PromiseLike<unknown> {
    if (
      (thing !== null && typeof thing === "object") ||
      (typeof thing === "function" &&
        "then" in thing &&
        typeof thing.then === "function")
    ) {
      return true;
    }
    return false;
  }

  public static toArray(thing: unknown): unknown[] | null {
    if (thing === null || thing === undefined) {
      return null;
    }
    if (this.isArray(thing)) {
      return thing;
    }
    if (typeof thing === "object" && "length" in thing) {
      const { length } = thing;
      if (this.isNumber(length)) {
        const arrLike = thing as ArrayLike<unknown>;
        const arr: unknown[] = new Array(length);
        for (let i = 0; i < length; i += 1) {
          arr[i] = arrLike[i];
        }
        return arr;
      }
    }
    return null;
  }

  public static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private static canValueBeCloned(value: unknown): boolean {
    if (
      value === undefined ||
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "bigint" ||
      typeof value === "symbol"
    ) {
      return true;
    }

    if (typeof value === "function") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.every(this.canValueBeCloned);
    }

    if (this.isObject(value)) {
      return Object.entries(value).every(([_, objValue]) =>
        this.canValueBeCloned(objValue),
      );
    }

    return false;
  }

  private static cloneWithFunctions(thing: unknown): unknown {
    if (thing === null || typeof thing !== "object") {
      return thing;
    }

    if (Array.isArray(thing)) {
      const newArray: unknown[] = [];

      thing.forEach((value) => {
        if (value === null || typeof value !== "object") {
          newArray.push(value);
        } else if (this.canValueBeCloned(value)) {
          newArray.push(structuredClone(value));
        } else {
          newArray.push(this.cloneWithFunctions(value));
        }
      });

      return newArray;
    }
    if (this.canValueBeCloned(thing)) {
      return structuredClone(thing);
    }

    const newObj: Record<string, unknown> = {};

    Object.entries(thing).forEach(([key, value]) => {
      if (value === null || typeof value !== "object") {
        newObj[key] = value;
      } else if (this.canValueBeCloned(value)) {
        newObj[key] = structuredClone(value);
      } else {
        newObj[key] = this.cloneWithFunctions(value);
      }
    });

    return newObj;
  }

  public static random(min: number, max: number, floor?: boolean): number {
    const rndInt = Math.random() * (max - min + 1) + min;

    return floor ? Math.floor(rndInt) : rndInt;
  }

  public static Fibonacci(n: number): number {
    let x = 0;
    let y = 0;

    for (let i = 2; i <= n; i += 1) {
      const tmp = y;
      y = x + y;
      x = tmp;
    }

    return x === 0 ? x : y;
  }
}
