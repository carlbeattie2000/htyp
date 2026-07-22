import HtypConfig from "./config";
import { requestShouldRetry } from "./retries";
import buildRequestConfig from "../helpers/buildRequestConfig";

import type { HtypResponse } from "../types";
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

    const adapterResponse = await requestConfig._adapter<T, D, P>(
      requestConfig,
    );

    if (requestShouldRetry(requestConfig, adapterResponse)) {
      requestConfig._retry = true;

      const updatedDelayPolicy = await requestConfig.retryPolicy.delay(
        adapterResponse.status,
        adapterResponse.headers,
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
      status: adapterResponse.status,
      statusText: adapterResponse.statusText,
      headers: adapterResponse.headers,
      data: null as T,
    };
  }
}
