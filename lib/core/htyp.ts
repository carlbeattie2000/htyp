import HtypConfig from "./config";
import dispatchRequest from "./dispatchRequest";
import { requestShouldRetry } from "./retries";
import { transformResponseData } from "./transforms";
import buildRequestConfig from "../helpers/buildRequestConfig";

import type { HtypResponse } from "../types";
import type { AcceptedResponseTransformerTypes } from "./config/config.type";
import type { HtypRequestConfig } from "../types/config";
import type { HtypI } from "../types/Htyp";

export default class Htyp implements HtypI {
  public defaults: HtypConfig;

  public constructor(config?: HtypRequestConfig) {
    if (config) {
      this.defaults = HtypConfig.merge(HtypConfig.defaults, config);
    } else {
      this.defaults = HtypConfig.createDefaults;
    }
  }

  public create(config?: HtypRequestConfig): Htyp {
    return new Htyp(config);
  }

  public async request<T = any, D = any, P extends object = object>(
    input: string | HtypRequestConfig<D, P>,
    config?: HtypRequestConfig<D, P>,
  ): Promise<HtypResponse<T, D, object, P>> {
    const requestConfig = buildRequestConfig(this.defaults, input, config);

    const response = await dispatchRequest(requestConfig);

    if (requestShouldRetry(requestConfig, response)) {
      requestConfig._retry = true;

      const updatedDelayPolicy = await requestConfig.retryPolicy.delay(
        response.status,
        response.headers,
        requestConfig.retryPolicy._algorithm,
      );

      if (updatedDelayPolicy) {
        requestConfig.retryPolicy._algorithm = updatedDelayPolicy;
      }

      requestConfig._retryCount += 1;

      return this.request(requestConfig);
    }

    return {
      config: requestConfig,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: transformResponseData.call<
        HtypConfig,
        [AcceptedResponseTransformerTypes],
        T | null
      >(requestConfig, response.data),
    };
  }
}
