import HtypConfig from "./config";
import HtypHeaders from "./headers";
import { defaultRetryDelayPolicy, defaultRetryPolicy } from "./retries";
import {
  defaultTransformRequest,
  defaultTransformResponse,
} from "./transforms";

import type { InternalHtypRequestConfig } from "../types/config";

export function createDefaultInternalConfig(): InternalHtypRequestConfig {
  return {
    baseUrl: "",
    url: "",
    method: "get",
    allowAbsoluteUrls: false,
    data: undefined,
    transformRequest: [defaultTransformRequest],
    transformResponse: [defaultTransformResponse],
    responseValidator: undefined,
    transitional: {
      silentJSONParsing: false,
      forcedJSONParsing: false,
    },
    headers: new HtypHeaders({
      "content-type": "application/json",
    }),
    responseType: "json",
    timeout: 15_000,
    retry: false,
    retryPolicy: {
      condition: defaultRetryPolicy,
      delay: defaultRetryDelayPolicy,
      max: 1,
      _algorithm: {
        type: "LINEAR_BACKOFF",
        delayByMs: 100,
        increaseByMs: 150,
        maxDelayMs: 30_000,
      },
      _count: 0,
    },
    httpVersion: 2,
    _retry: false,
    _retryCount: 0,
    _data: undefined,
  };
}

export default function createDefaultConfig(): HtypConfig {
  return new HtypConfig(createDefaultInternalConfig());
}
