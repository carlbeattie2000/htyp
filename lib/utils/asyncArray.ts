type AsyncReduceCallback<T, ACC> = (
  acc: ACC,
  current: T,
  index: number,
) => Promise<ACC>;

type AsyncMapCallback<T> = (
  value: T,
  index: number,
  array: T[],
) => Promise<void>;

export default class AsyncArray {
  static async reduce<T = unknown, ACC = unknown>(
    array: T[],
    callback: AsyncReduceCallback<T, ACC>,
    initialValue: ACC,
  ): Promise<ACC>;
  static async reduce<T = unknown>(
    array: T[],
    callback: AsyncReduceCallback<T, T>,
    initialValue?: T,
  ): Promise<T>;
  static async reduce<ACC, T = unknown>(
    array: T[],
    callback: AsyncReduceCallback<T, ACC | T>,
    initialValue?: ACC,
  ): Promise<T | ACC> {
    const hasInitialValue = initialValue !== undefined;

    if (array.length === 0 && !hasInitialValue) {
      throw new TypeError(
        "TypeError: Async reduce of empty array with no initial value",
      );
    }

    let acc: T | ACC = hasInitialValue ? initialValue : (array[0] as T);
    const startIndex = hasInitialValue ? 0 : 1;

    for (let i = startIndex; i < array.length; i += 1) {
      const current = array[i] as T;
      // eslint-disable-next-line no-await-in-loop
      acc = await callback(acc, current, i);
    }

    return acc;
  }
}
