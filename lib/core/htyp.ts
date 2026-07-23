import HtypConfig from "./config";
import dispatchRequest from "./dispatchRequest";
import Interceptor from "./interceptors";
import { requestShouldRetry } from "./retries";
import { transformResponseData } from "./transforms";
import buildRequestConfig from "../helpers/buildRequestConfig";
import resolveConfig from "../helpers/resolveConfig";
import Utils from "../utils";

import type { HtypResponse } from "../types";
import type { AcceptedResponseTransformerTypes } from "./config/config.type";
import type { HtypRequestConfig } from "../types/config";
import type { HtypI } from "../types/Htyp";
import type {
  RequestInterceptorFns,
  ResponseInterceptorFns,
} from "../types/interceptors";

export default class Htyp implements HtypI {
  public defaults: HtypConfig;

  public interceptors: {
    request: Interceptor<RequestInterceptorFns>;
    response: Interceptor<ResponseInterceptorFns>;
  };

  public constructor(config?: HtypRequestConfig) {
    if (config) {
      this.defaults = HtypConfig.merge(HtypConfig.defaults, config);
    } else {
      this.defaults = HtypConfig.createDefaults;
    }

    this.interceptors = Interceptor.newRequestAndResponseInterceptors();
  }

  public create(config?: HtypRequestConfig): Htyp {
    return new Htyp(config);
  }

  public async request<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    let requestConfig = buildRequestConfig(this.defaults, input, config);

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

    let response: HtypResponse<T, D, object, P> = {
      config: requestConfig,
      status: dispatchedRequestResponse.status,
      statusText: dispatchedRequestResponse.statusText,
      headers: dispatchedRequestResponse.headers,
      data: transformResponseData.call<
        HtypConfig,
        [AcceptedResponseTransformerTypes],
        T | null
      >(resolvedConfig, dispatchedRequestResponse.data),
    };

    for (const interceptor of this.interceptors.response.interceptors) {
      let interceptorResult = interceptor(response);

      if (Utils.type.isThenable(interceptorResult)) {
        interceptorResult = await interceptorResult;
      }

      response = interceptorResult as HtypResponse<T, D, object, P>;
    }

    return response;
  }

  public async get<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    return this.request(input, config);
  }

  public async post<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    if (typeof input !== "string") {
      input = {
        method: "post",
        ...input,
      };
    } else {
      config = {
        method: "post",
        ...config,
      };
    }

    debugger;

    return this.request(input, config);
  }

  public async put<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    if (typeof input !== "string") {
      input = {
        method: "put",
        ...input,
      };
    } else {
      config = {
        method: "put",
        ...config,
      };
    }

    return this.request(input, config);
  }

  public async patch<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    if (typeof input !== "string") {
      input = {
        method: "patch",
        ...input,
      };
    } else {
      config = {
        method: "patch",
        ...config,
      };
    }

    return this.request(input, config);
  }

  public async delete<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    if (typeof input !== "string") {
      input = {
        method: "delete",
        ...input,
      };
    } else {
      config = {
        method: "delete",
        ...config,
      };
    }

    return this.request(input, config);
  }

  public async head<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    if (typeof input !== "string") {
      input = {
        method: "head",
        ...input,
      };
    } else {
      config = {
        method: "head",
        ...config,
      };
    }

    return this.request(input, config);
  }
}
