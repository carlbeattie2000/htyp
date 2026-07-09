import { describe, expect, test } from "@jest/globals";

import AsyncArray from "../lib/utils/asyncArray";

async function mockAyncFunctionThatTakesSomeTime(
  input: number,
): Promise<number> {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(input);
    }, 100);
  });
}

describe("array async reduce", () => {
  test("sums [1, 2, 3, 4] to equal 10 using no initial value", async () => {
    const arr = [1, 2, 3, 4];
    const result = await AsyncArray.reduce(
      arr,
      async (acc, current) => acc + current,
    );

    expect(result).toBe(10);
  });

  test("sums [1, 2, 3, 4] using initial value of 5 to equal 15", async () => {
    const arr = [1, 2, 3, 4];
    const result = await AsyncArray.reduce(
      arr,
      async (acc, current) => acc + current,
      5,
    );

    expect(result).toBe(15);
  });

  test("sums [1, 2, 3, 4] using initial value of 5 to equal 15 with each sum going through async function that takes some time", async () => {
    const arr = [1, 2, 3, 4];
    const result = await AsyncArray.reduce(
      arr,
      async (acc, current) =>
        acc + (await mockAyncFunctionThatTakesSomeTime(current)),
      5,
    );

    expect(result).toBe(15);
  });

  test("array with single value returns the single value", async () => {
    const result = await AsyncArray.reduce(
      [1],
      async (acc, current) => acc + current,
    );

    expect(result).toBe(1);
  });

  test("empty array with initial value returns initial value", async () => {
    const result = await AsyncArray.reduce(
      [],
      async (acc, current) => acc + current,
      1,
    );

    expect(result).toBe(1);
  });

  test("array with single value with initial value returns array value + initial value", async () => {
    const result = await AsyncArray.reduce(
      [1],
      async (acc, current) => acc + current,
      1,
    );

    expect(result).toBe(2);
  });

  test("empty array with no initial value throws", async () => {
    const numbers: number[] = [];
    expect(
      AsyncArray.reduce(numbers, async (acc, current) => acc + current),
    ).rejects.toThrow();
  });
});
