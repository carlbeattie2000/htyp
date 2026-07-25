import type { HtypRequestConfig } from "./config";
import type {
  RequestInterceptorFns,
  ResponseInterceptorFns,
} from "./interceptors";
import type { HtypResponse } from "./response";
import type Interceptor from "../core/interceptors";

type RequestFn = <T = any, D = any, P extends object = object, E = any>(
  input: string | HtypRequestConfig<D, P>,
  config?: HtypRequestConfig<D, P>,
) => Promise<HtypResponse<D, P, T, E>>;

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
