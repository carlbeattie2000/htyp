import ConvertUtils from "./covert";
import MathUtils from "./math";
import ObjectUtils from "./objects";
import TypeUtils from "./typeOf";

export default class Utils {
  public static object = ObjectUtils;

  public static type = TypeUtils;

  public static to = ConvertUtils;

  public static math = MathUtils;

  public static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
