import dispatchRequest from "./dispatchRequest";
import Interceptor from "./interceptors";
import { requestShouldRetry } from "./retries";
import buildRequestConfig from "../helpers/buildRequestConfig";
import buildResponse from "../helpers/buildResponse";
import resolveConfig from "../helpers/resolveConfig";
import Utils from "../utils";

import type HtypConfig from "./config";
import type { Method } from "../types";
import type { HtypRequestConfig } from "../types/config";
import type { HtypI } from "../types/Htyp";
import type {
  RequestInterceptorFns,
  ResponseInterceptorFns,
} from "../types/interceptors";
import type { HtypResponse } from "../types/response";

export default class Htyp implements HtypI {
  public defaults?: HtypRequestConfig;

  public interceptors: {
    request: Interceptor<RequestInterceptorFns>;
    response: Interceptor<ResponseInterceptorFns>;
  };

  public constructor(config?: HtypRequestConfig) {
    this.defaults = config;

    this.interceptors = Interceptor.newRequestAndResponseInterceptors();
  }

  public create(config?: HtypRequestConfig): Htyp {
    return new Htyp(config);
  }

  public async request<T = any, D = any, P extends object = object, E = any>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<D, P, T, E>> {
    let requestConfig = buildRequestConfig(input, config, this.defaults);

    for (const interceptor of this.interceptors.request.interceptors) {
      let interceptorResult = interceptor(requestConfig);

      if (Utils.type.isThenable(interceptorResult)) {
        interceptorResult = await interceptorResult;
      }

      requestConfig = interceptorResult as HtypConfig<D, P>;
    }

    const resolvedConfig = resolveConfig(requestConfig);

    const dispatchedRequestResponse = await dispatchRequest(resolvedConfig);

    if (requestShouldRetry(resolvedConfig, dispatchedRequestResponse)) {
      resolvedConfig._retry = true;

      const updatedDelayPolicy = await resolvedConfig.retryPolicy.delay(
        dispatchedRequestResponse.status,
        dispatchedRequestResponse.headers,
        resolvedConfig.retryPolicy._algorithm,
      );

      if (updatedDelayPolicy) {
        resolvedConfig.retryPolicy._algorithm = updatedDelayPolicy;
      }

      resolvedConfig._retryCount += 1;

      return this.request(resolvedConfig);
    }

    let response = buildResponse<D, P, T, E>(
      dispatchedRequestResponse,
      resolvedConfig,
      requestConfig,
    );

    for (const interceptor of this.interceptors.response.interceptors) {
      let interceptorResult = interceptor(response);

      if (Utils.type.isThenable(interceptorResult)) {
        interceptorResult = await interceptorResult;
      }

      response = interceptorResult as HtypResponse<D, P, T, E>;
    }

    return response;
  }

  private createMethodRequest(method: Method) {
    return async <T = any, D = any, P extends object = object, E = any>(
      input: string | HtypRequestConfig<D, P>,
      config?: HtypRequestConfig<D, P>,
    ): Promise<HtypResponse<D, P, T, E>> => {
      if (typeof input !== "string") {
        input = {
          method,
          ...input,
        };
      } else {
        config = {
          method,
          ...config,
        };
      }

      return this.request<T, D, P, E>(input, config);
    };
  }

  public get = this.createMethodRequest("get");

  public post = this.createMethodRequest("post");

  public put = this.createMethodRequest("put");

  public patch = this.createMethodRequest("patch");

  public delete = this.createMethodRequest("delete");

  public head = this.createMethodRequest("head");
}
