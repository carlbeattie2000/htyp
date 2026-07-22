import mergeConfigs from "./mergeConfig";
import HtypConfig from "../core/config";
import { transformRequestData } from "../core/transforms";

import type { HtypRequestConfig } from "../types/config";

export default function buildRequestConfig<D = any, P extends object = object>(
  instanceConfig: HtypConfig,
  input: string | HtypRequestConfig<D, P>,
  config?: HtypRequestConfig<D, P>,
): HtypConfig<D, P> {
  let requestConfig: HtypRequestConfig<D, P> = {};

  const inputIsString = typeof input === "string";

  if (inputIsString) {
    requestConfig = {
      url: input,
      ...config,
    };
  } else {
    requestConfig = {
      ...input,
      ...config,
    };
  }

  const mergedConfig = mergeConfigs(
    HtypConfig.defaults,
    instanceConfig,
    requestConfig,
  );

  mergedConfig._data = transformRequestData(mergedConfig);

  return mergedConfig;
}
