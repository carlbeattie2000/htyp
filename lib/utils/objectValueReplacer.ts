import Utils from ".";

export default function objectValueReplacer<T extends object>(
  obj: T,
  keys: string[],
  replaceWith: string | undefined,
): T {
  const clonedObj = Utils.Object.deepClone(obj);
  const lowercaseKeys = keys.map((key) => key.toString().toLowerCase());

  Object.entries(clonedObj).forEach(([key]) => {
    const keyAsLowercase = key.toLowerCase();

    if (lowercaseKeys.includes(keyAsLowercase)) {
      Object.defineProperty(clonedObj, keyAsLowercase, {
        value: replaceWith,
      });
    } else if (Utils.isObject(clonedObj[keyAsLowercase as keyof T])) {
      Object.defineProperty(clonedObj, keyAsLowercase, {
        value: objectValueReplacer<any>(
          clonedObj[keyAsLowercase as keyof T],
          keys,
          replaceWith,
        ),
      });
    }
  });

  return clonedObj;
}
