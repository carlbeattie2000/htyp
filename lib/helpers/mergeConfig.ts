import type HtypConfig from "../core/config";
import type { HtypRequestConfig } from "../types/config";

export default function mergeConfigs<D = any, P extends object = object>(
  defaultConfig: HtypConfig,
  instanceConfig: HtypConfig,
  requestConfig: HtypRequestConfig<D, P>,
): HtypConfig<D, P> {
  return defaultConfig.merge<D, P>(instanceConfig, requestConfig);
}
