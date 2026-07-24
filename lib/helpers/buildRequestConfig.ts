import HtypConfig from "../core/config";
import createDefaultConfig from "../core/defaults";
import { transformRequestData } from "../core/transforms";

import type { HtypRequestConfig } from "../types/config";

export default function buildRequestConfig<D = any, P extends object = object>(
  input: string | HtypRequestConfig<D, P>,
  config?: HtypRequestConfig<D, P>,
  instanceConfig?: HtypRequestConfig,
): HtypConfig<D, P> {
  const defaultConfig = createDefaultConfig();
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

  const mergedConfig = HtypConfig.merge<D, P>(
    defaultConfig,
    instanceConfig ?? {},
    requestConfig,
  );

  mergedConfig._data = transformRequestData(mergedConfig);

  return mergedConfig;
}
