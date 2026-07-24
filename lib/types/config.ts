import type HtypConfig from "../core/config";
import type HtypHeaders from "../core/headers";
import type {
  HttpVersion,
  Method,
  ResponseType,
  StringLiteralOrString,
} from "../types";
import type { RawHtypHeaders } from "./htypHeaders";
import type { RetryPolicy } from "./retry";

export type TransformRequestFn<T> = (data: T, headers: HtypHeaders) => T;

export type RequestTransformFinalResult =
  string | ArrayBuffer | FormData | ReadableStream | Blob | null;

export type TransformRequestFinalFn<T> = (
  data: T,
  headers: HtypHeaders,
) => RequestTransformFinalResult;

export type RequestTransforms<T> = [
  ...TransformRequestFn<T>[],
  TransformRequestFinalFn<T>,
];

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type AcceptedResponseTransformerTypes =
  | ReadableStream<Uint8Array<ArrayBuffer>>
  | ArrayBuffer
  | Blob
  | Uint8Array
  | string
  | FormData
  | JsonValue
  | null;

export type TransformResponseFn = (
  this: HtypConfig,
  data: AcceptedResponseTransformerTypes,
) => AcceptedResponseTransformerTypes;

export type ResponseValidatorFn<T> = (data: T) => asserts data is T;

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

export type InternalHtypRequestConfigJSON<
  D = any,
  P extends object = object,
> = Pick<
  InternalHtypRequestConfig<D, P>,
  | "baseUrl"
  | "url"
  | "method"
  | "allowAbsoluteUrls"
  | "data"
  | "params"
  | "transitional"
  | "responseType"
  | "timeout"
  | "retry"
  | "retryPolicy"
  | "httpVersion"
  | "redactKeys"
  | "_retry"
  | "_retryCount"
  | "_data"
> & {
  headers: RawHtypHeaders;
};

export type AnyRequestConfig =
  | HtypConfig
  | InternalHtypRequestConfig
  | InternalHtypRequestConfigJSON
  | HtypRequestConfig;
