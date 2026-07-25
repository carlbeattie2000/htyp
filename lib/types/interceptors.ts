import type { InternalHtypResponse } from "./response";
import type HtypConfig from "../core/config";

export type RequestInterceptorFnSync = (config: HtypConfig) => HtypConfig;
export type RequestInterceptorFnAsync = (
  config: HtypConfig,
) => Promise<HtypConfig>;
export type RequestInterceptorFns =
  RequestInterceptorFnSync | RequestInterceptorFnAsync;

export type ResponseInterceptorFnSync = (
  response: InternalHtypResponse,
) => InternalHtypResponse;
export type ResponseInterceptorFnAsync = (
  response: InternalHtypResponse,
) => Promise<InternalHtypResponse>;
export type ResponseInterceptorFns =
  ResponseInterceptorFnSync | ResponseInterceptorFnAsync;
