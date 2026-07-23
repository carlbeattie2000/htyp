import type HtypError from "../core/HtypError";
import type { StringLiteralOrString } from "../types";

export type PrimativeType = StringLiteralOrString<
  | "string"
  | "function"
  | "number"
  | "bigint"
  | "symbol"
  | "object"
  | "boolean"
  | "undefined"
>;

export const PRIMATIVE_TYPES: PrimativeType[] = [
  "string",
  "function",
  "number",
  "bigint",
  "symbol",
  "object",
  "boolean",
  "undefined",
];

const { iterator, toStringTag } = Symbol;

export default class TypeUtils {
  public static kindOf = (
    (cache: Record<string, string>) => (thing: unknown) => {
      const cacheCopy = cache;
      const str = toString.call(thing);
      const kind =
        cache[str] ?? (cacheCopy[str] = str.slice(8, -1).toLowerCase());
      return kind;
    }
  )(Object.create(null));

  public static kindOfTest =
    (type: string): ((thing: unknown) => boolean) =>
    (thing: unknown) =>
      this.kindOf(thing) === type.toLowerCase();

  public static typeOfTest =
    (type: PrimativeType): ((thing: unknown) => boolean) =>
    (thing: unknown) =>
      typeof thing === type;

  public static unsafeKindOfTest<T>(
    thing: unknown,
    type: PrimativeType,
  ): thing is T {
    if (PRIMATIVE_TYPES.includes(type)) {
      return this.typeOfTest(type)(thing);
    }

    return this.kindOfTest(type)(thing);
  }

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

  public static isArrayBuffer(thing: unknown): thing is ArrayBuffer {
    return this.kindOfTest("ArrayBuffer")(thing);
  }

  public static isArrayBufferView(thing: unknown): thing is ArrayBufferView {
    return this.isArrayBuffer(thing) && ArrayBuffer.isView(thing);
  }

  public static isString(thing: unknown): thing is string {
    return this.typeOfTest("string")(thing);
  }

  public static isFunction(thing: unknown): thing is typeof Function {
    return this.typeOfTest("function")(thing);
  }

  public static isNumber(thing: unknown): thing is number {
    return this.typeOfTest("number")(thing);
  }

  public static isObject(thing: unknown): thing is object {
    return this.typeOfTest("object")(thing) && thing !== null;
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

  public static isBoolean(thing: unknown): thing is boolean {
    return this.typeOfTest("boolean")(thing);
  }

  public static isArray(thing: unknown): thing is unknown[] {
    return Array.isArray(thing);
  }

  public static isReadableStream(thing: unknown): thing is ReadableStream {
    return thing instanceof ReadableStream;
  }

  public static isDate(thing: unknown): thing is Date {
    return this.kindOfTest("Date")(thing);
  }

  public static isFile(thing: unknown): thing is File {
    return this.kindOfTest("File")(thing);
  }

  public static isBlob(thing: unknown): thing is Blob {
    return this.kindOfTest("Blob")(thing);
  }

  public static isFileList(thing: unknown): thing is File[] {
    return this.kindOfTest("FileList")(thing);
  }

  public static isFormData(thing: unknown): thing is FormData {
    return thing instanceof FormData;
  }

  public static isURLSearchParams(thing: unknown): thing is URLSearchParams {
    return thing instanceof URLSearchParams;
  }

  public static isSet(thing: unknown): thing is Set<any> {
    return this.kindOfTest("Set")(thing);
  }

  public static isHtypError(error: Error): error is HtypError {
    return "_brand" in error && error._brand === "HtypError";
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
}
