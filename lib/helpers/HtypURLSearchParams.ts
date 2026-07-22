import toFormData from "./toFormData";

import type { ToFormDataOptions } from "../types/helpers/toFormData.types";

function encode(str: string): string {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
  };
  return encodeURIComponent(str).replace(
    /[!'()~]|%20/g,
    (match) => charMap[match as keyof typeof charMap],
  );
}

export default class HtypURLSearchParams<P extends object> {
  private pairs: [string, string][];

  constructor(params: P, options?: ToFormDataOptions) {
    this.pairs = [];

    toFormData(params, this as unknown as FormData, options);
  }

  public append(name: string, value: string): void {
    this.pairs.push([name, value]);
  }

  public toString(
    encoder: (
      value: string,
      defaultEncoder: (value: string) => string,
    ) => string = encode,
  ): string {
    return this.pairs
      .map(
        (pair) =>
          `${encoder.call(this, pair[0], encode)}=${encoder.call(this, pair[1], encode)}`,
        "",
      )
      .join("&");
  }
}
