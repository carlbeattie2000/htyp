import TypeUtils from "./typeOf";

export default class ConvertUtils {
  public static array(thing: unknown): unknown[] | null {
    if (thing === null || thing === undefined) {
      return null;
    }
    if (TypeUtils.isArray(thing)) {
      return thing;
    }
    if (typeof thing === "object" && "length" in thing) {
      const { length } = thing;
      if (TypeUtils.isNumber(length)) {
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
}
