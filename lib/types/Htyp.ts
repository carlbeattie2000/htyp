import type Interceptor from "../core/interceptors";
import type { HtypResponse } from "../types";
import type { HtypRequestConfig } from "./config";
import type {
  RequestInterceptorFns,
  ResponseInterceptorFns,
} from "./interceptors";

type RequestFn = <T = any, D = any, P extends object = object>(
  input: string | HtypRequestConfig<D, P>,
  config?: HtypRequestConfig<D, P>,
) => Promise<HtypResponse<T, D, object, P>>;

export interface HtypI {
  defaults?: HtypRequestConfig;

  interceptors: {
    request: Interceptor<RequestInterceptorFns>;
    response: Interceptor<ResponseInterceptorFns>;
  };

  create: (config?: HtypRequestConfig) => HtypI;

  request: RequestFn;

  get: RequestFn;

  post: RequestFn;

  put: RequestFn;

  patch: RequestFn;

  delete: RequestFn;

  head: RequestFn;
}
