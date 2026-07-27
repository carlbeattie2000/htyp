export default class JSONUtils {
  public static fromFormData(data: FormData): Record<string, string> {
    const json: Record<string, string> = {};

    data.forEach((value, key) => {
      json[key] = value.toString();
    });

    return json;
  }
}
