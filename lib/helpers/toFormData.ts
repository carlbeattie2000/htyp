import Utils from "../utils";

import type { ToFormDataOptions } from "../types/helpers/toFormData.types";

function isVisitable(thing: unknown): boolean {
  return Utils.type.isPlainObject(thing) || Utils.type.isArray(thing);
}

function removeBrackets(key: string): string {
  return key.endsWith("[]") ? key.slice(0, -2) : key;
}

function renderKey(
  path: string[] | undefined,
  key: string,
  dots?: boolean,
): string {
  if (!path) return key;
  return path
    .concat(key)
    .map((token, i) => {
      token = removeBrackets(token);

      return !dots && i ? `[${token}]` : token;
    })
    .join(dots ? "." : "");
}

function shouldSkipValue(value: unknown): boolean {
  if (typeof value === "function") return true;
  if (typeof value === "symbol") return true;
  if (typeof value === "undefined" || value === undefined) return true;
  if (value === null) return true;
  return false;
}

function normalizeValue(value: unknown): string {
  if (Utils.type.isDate(value)) {
    return value.toISOString();
  }

  return String(value);
}

function defaultVisitorFn(
  this: FormData,
  key: string,
  value: unknown,
  path: string[] | undefined,
  options?: Omit<ToFormDataOptions, "visitor">,
): boolean {
  const indexes = options?.indexes;
  const dots = options?.dots;

  if (shouldSkipValue(value)) {
    return false;
  }

  const hasNoPath = !path;
  const isFlatArrayOrHinted =
    (Utils.type.isArray(value) && Utils.type.isFlatArray(value)) ||
    key.endsWith("[]");

  if (hasNoPath && isFlatArrayOrHinted) {
    const arr = Utils.to.array(value);
    if (arr) {
      key = removeBrackets(key);

      arr.forEach((el, index) => {
        if (el !== undefined && el !== null) {
          if (indexes) {
            this.append(
              renderKey([key], String(index), dots),
              normalizeValue(el),
            );
          } else if (indexes === null) {
            this.append(key, normalizeValue(el));
          } else {
            this.append(`${key}[]`, normalizeValue(el));
          }
        }
      });
      return false;
    }
  }

  if (isVisitable(value)) {
    return true;
  }

  this.append(renderKey(path, key, dots), normalizeValue(value));
  return false;
}

export default function toFormData<T extends object>(
  obj: T,
  formData?: FormData | null,
  options?: ToFormDataOptions,
): FormData {
  if (!Utils.type.isObject(obj)) {
    throw new TypeError("Target should be an object.");
  }

  formData = formData ?? new FormData();

  const visitorFn = options?.visitor ?? defaultVisitorFn;

  Utils.object.iterateObject(obj, (key, value, path) =>
    visitorFn.call(formData, key, value, path, options),
  );

  return formData;
}
