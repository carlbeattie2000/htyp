import Utils from "../utils";
import HtypError from "./HtypError";

import type HtypConfig from "./config";
import type {
  AcceptedResponseTransformerTypes,
  JsonValue,
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
    Utils.isReadableStream(data) ||
    Utils.isFormData(data)
  ) {
    return data;
  }

  if (hasJsonContentType || isObjectPayload) {
    headers.setContentType("application/json", false);
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
  this: HtypConfig,
  data: AcceptedResponseTransformerTypes,
): AcceptedResponseTransformerTypes {
  if (Utils.isReadableStream(data)) {
    return data;
  }

  const JSONRequested =
    this.responseType === "json" || this.transitional.forcedJSONParsing;

  if (Utils.isString(data) && JSONRequested) {
    try {
      return JSON.parse(data) as JsonValue;
    } catch (err: unknown) {
      if (this.transitional.silentJSONParsing) {
        return null;
      }

      const error = err as Error;

      if (error.name === "SyntaxError") {
        throw HtypError.from(error, HtypError.ERR_STRING_NOT_JSON);
      }

      throw err;
    }
  }

  return data;
}

export function transformResponseData<T>(
  this: HtypConfig,
  data: AcceptedResponseTransformerTypes,
): T | null {
  if (data === null) {
    return data;
  }

  this.transformResponse.forEach((transformResponseFn) => {
    data = transformResponseFn.call(this, data);
  });

  return data === null ? data : (data as T);
}
