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
}
