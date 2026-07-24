export default class MathUtils {
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
