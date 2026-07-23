import type {
  RequestTransformFinalResult,
  RequestTransforms,
  ResponseValidatorFn,
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

export interface Transitionals {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
}

export interface HtypRequestConfig<D = any, P extends object = object> {
  baseUrl?: string;

  url?: string;

  method?: StringLiteralOrString<Method>;

  allowAbsoluteUrls?: boolean;

  data?: D;

  params?: P;

  transformRequest?: RequestTransforms<D>;

  transformResponse?: TransformResponseFn[];

  responseValidator?: ResponseValidatorFn<unknown>;

  transitional?: Transitionals;

  headers?: RawHtypHeaders | HtypHeaders;

  responseType?: ResponseType;

  timeout?: number;

  retry?: boolean;

  retryPolicy?: RetryPolicy;

  httpVersion?: HttpVersion;

  redactKeys?: string[];

  _retry?: boolean;

  _retryCount?: number;

  _data?: RequestTransformFinalResult;
}

export type InternalHtypRequestConfig<
  D = any,
  P extends object = object,
> = Omit<
  Required<HtypRequestConfig<D, P>>,
  "data" | "params" | "redactKeys" | "_data" | "responseValidator"
> &
  Pick<
    HtypRequestConfig<D, P>,
    "data" | "params" | "redactKeys" | "_data" | "responseValidator"
  >;
