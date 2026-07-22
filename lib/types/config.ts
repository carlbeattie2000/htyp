import type { Adapter } from "./adapters";
import type {
  RequestTransformFinalResult,
  RequestTransforms,
  TransformResponseFn,
} from "../core/config/config.type";
import type HtypHeaders from "../core/headers";
import type {
  HttpVersion,
  Method,
  ResponseType,
  StringLiteralOrString,
} from "../types";
import type { RawHtypHeaders } from "./htypHeaders";
import type { RetryPolicy } from "./retry";

export interface HtypRequestConfig<D = any, P extends object = object> {
  baseUrl?: string;

  url?: string;

  method?: StringLiteralOrString<Method>;

  allowAbsoluteUrls?: boolean;

  data?: D;

  params?: P;

  transformRequest?: RequestTransforms<D>;

  transformResponse?: TransformResponseFn | TransformResponseFn[];

  headers?: RawHtypHeaders | HtypHeaders;

  responseType?: ResponseType;

  timeout?: number;

  retry?: boolean;

  retryPolicy?: RetryPolicy;

  httpVersion?: HttpVersion;

  redact?: string[];

  _retry?: boolean;

  _retryCount?: number;

  _adapter?: Adapter;

  _data?: RequestTransformFinalResult;
}

export type InternalHtypRequestConfig<
  D = any,
  P extends object = object,
> = Omit<
  Required<HtypRequestConfig>,
  "data" | "params" | "redact" | "_data"
> & {
  data?: D;

  params?: P;

  redact?: string[];

  _data?: RequestTransformFinalResult;
};
