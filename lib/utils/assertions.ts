export function assertRequired<T extends object>(
  obj: T,
  keys?: (keyof T)[],
  skipKeys?: (keyof T)[],
): asserts obj is Required<T> {
  const keysValid = !keys ? true : keys.every((key) => key in obj);

  if (!keysValid) {
    throw new Error(`assertRequired: some keys are missing`);
  }

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined && !skipKeys?.includes(key as keyof T)) {
      throw new Error(`assertRequired: "${String(key)}" is undefined`);
    }
  }
}

export function assertIsObject<T extends object>(
  thing: object,
  obj: object,
  skipKeys?: (keyof T)[],
): asserts thing is T {
  const keysValid = Object.keys(obj).every((key) => key in thing);

  if (!keysValid) {
    throw new Error(`assertIsObject: some keys are missing`);
  }

  const typesValid = Object.keys(obj).every((key) => {
    if (!skipKeys?.includes(key as keyof T)) {
      const objKey = key as keyof typeof obj;
      const thingKey = key as keyof typeof thing;

      return typeof obj[objKey] === typeof thing[thingKey];
    }

    return true;
  });

  if (!typesValid) {
    throw new Error(`assertIsObject: properties type mismatch`);
  }
}

export function assertIsArray<T extends unknown[]>(
  thing: unknown,
  reference: T,
): asserts thing is T {
  if (!Array.isArray(thing)) {
    throw new Error("Expected an array");
  }

  if (thing.length !== reference.length) {
    throw new Error(
      `Array length mismatch: expected ${reference.length}, got ${thing.length}`,
    );
  }

  for (let i = 0; i < thing.length; i += 1) {
    const thingValue: unknown = thing[i];
    const referenceValue: unknown = reference[i];

    if (typeof thingValue !== typeof referenceValue) {
      throw new Error("Type mismatch");
    } else if (
      thingValue === null ||
      typeof thingValue !== "object" ||
      referenceValue === null ||
      typeof referenceValue !== "object"
    ) {
      if (thingValue !== referenceValue) {
        throw new Error("thingValue not equal referenceValue");
      }
    } else if (Array.isArray(thingValue) && Array.isArray(referenceValue)) {
      assertIsArray(thingValue, referenceValue);
    } else if (
      typeof thingValue === "object" &&
      typeof referenceValue === "object"
    ) {
      assertIsObject(thingValue, referenceValue);
    } else {
      throw new Error("Unable to check equality");
    }
  }
}
