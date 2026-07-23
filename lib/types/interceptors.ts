import type HtypConfig from "../core/config";
import type { HtypResponse } from "../types";

export type RequestInterceptorFnSync = (config: HtypConfig) => HtypConfig;
export type RequestInterceptorFnAsync = (
  config: HtypConfig,
) => Promise<HtypConfig>;
export type RequestInterceptorFns =
  RequestInterceptorFnSync | RequestInterceptorFnAsync;

export type ResponseInterceptorFnSync = (
  response: HtypResponse,
) => HtypResponse;
export type ResponseInterceptorFnAsync = (
  response: HtypResponse,
) => Promise<HtypResponse>;
export type ResponseInterceptorFns =
  ResponseInterceptorFnSync | ResponseInterceptorFnAsync;
