import Utils from "../utils";
import HtypURLSearchParams from "./HtypURLSearchParams";

import type { BuildURLOptions } from "../types/helpers/buildURL.types";

function encode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+");
}

export default function buildURL<P extends object>(
  url?: string,
  params?: P | URLSearchParams,
  options?: BuildURLOptions,
): string {
  url ??= "";

  if (!params) {
    return url;
  }

  const encoder = options?.encoder ?? encode;

  const serializedParams = Utils.isURLSearchParams(params)
    ? params.toString()
    : new HtypURLSearchParams(params, options).toString(encoder);

  const hashMarkIndex = url.indexOf("#");

  if (hashMarkIndex !== -1) {
    url = url.slice(0, hashMarkIndex);
  }

  const hasExistingQuery = url.indexOf("?");

  if (hasExistingQuery !== -1) {
    url += `&${serializedParams}`;
  } else {
    url += `?${serializedParams}`;
  }

  return url;
}
