import Utils from "../utils";

import type HtypConfig from "./config";
import type {
  AcceptedResponseTransformerTypes,
  RequestTransformFinalResult,
} from "./config/config.type";
import type HtypHeaders from "./headers";

export function defaultTransformRequest<T>(
  data: T,
  headers: HtypHeaders,
): RequestTransformFinalResult {
  const contentType = headers.getContentType();
  const hasJsonContentType = contentType.includes("application/json");
  const isObjectPayload = Utils.isObject(data);

  if (
    Utils.isArrayBuffer(data) ||
    Utils.isFile(data) ||
    Utils.isBlob(data) ||
    Utils.isReadableStream(data)
  ) {
    return data;
  }

  if (hasJsonContentType || isObjectPayload) {
    headers.set("content-type", "application/json");
    return JSON.stringify(data);
  }

  if (typeof data === "string") {
    return data;
  }

  throw new Error("Unable to transform data into valid request body");
}

export function transformRequestData<T>(
  init: HtypConfig<T>,
): RequestTransformFinalResult {
  const { headers, transformRequest } = init;
  let data: T | RequestTransformFinalResult | undefined = init.data;

  if (data === undefined || data === null) {
    return null;
  }

  for (const transformFn of transformRequest) {
    data = transformFn(data as T, headers);
  }

  return data as RequestTransformFinalResult;
}

export function defaultTransformResponse(
  data: AcceptedResponseTransformerTypes,
): AcceptedResponseTransformerTypes {
  if (Utils.isReadableStream(data)) {
  }
}
