import dispatchRequest from "./dispatchRequest";
import Interceptor from "./interceptors";
import { requestShouldRetry } from "./retries";
import { transformResponseData } from "./transforms";
import buildRequestConfig from "../helpers/buildRequestConfig";
import resolveConfig from "../helpers/resolveConfig";
import Utils from "../utils";

import type { Method } from "../types";
import type HtypConfig from "./config";
import type {
  AcceptedResponseTransformerTypes,
  HtypRequestConfig,
} from "../types/config";
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

    let dispatchedRequestResponse = await dispatchRequest(resolvedConfig);

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

    for (const interceptor of this.interceptors.response.interceptors) {
      let interceptorResult = interceptor(dispatchedRequestResponse);

      if (Utils.type.isThenable(interceptorResult)) {
        interceptorResult = await interceptorResult;
      }

      dispatchedRequestResponse = interceptorResult;
    }

    let response: HtypResponse<D, P, T, E> = {
      error: false,
      config: requestConfig,
      status: dispatchedRequestResponse.status,
      statusText: dispatchedRequestResponse.statusText,
      headers: dispatchedRequestResponse.headers,
      data: transformResponseData.call<
        HtypConfig,
        [AcceptedResponseTransformerTypes],
        T | null
      >(resolvedConfig, dispatchedRequestResponse.data),
      response: dispatchedRequestResponse.raw,
      validated: false,
    };

    const statusValidated = resolvedConfig.validateStatus(response.status);

    if (
      !statusValidated &&
      resolvedConfig.transitional.errorHandling === "default"
    ) {
      return {
        ...response,
        error: true,
        data: response.data as E,
      };
    }

    if (resolvedConfig.responseValidator) {
      const clonedData = Utils.object.deepClone(response.data);
      const { responseValidator } = resolvedConfig;

      responseValidator.call(null, clonedData);

      response = {
        ...response,
        data: response.data as T,
        validated: true,
      };
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
