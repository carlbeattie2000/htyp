import buildURL from "./buildURL";
import buildFullPath from "../core/buildFullPath";
import Utils from "../utils";

import type HtypConfig from "../core/config";

export default function resolveConfig<D = any, P extends object = object>(
  config: HtypConfig<D, P>,
): HtypConfig<D, P> {
  if (Utils.type.isFormData(config.data)) {
    config.headers.delete("content-type");
  }

  const newConfig = config.clone();

  newConfig.url = buildURL(
    buildFullPath(
      config.baseUrl,
      config.url,
      config.allowAbsoluteUrls,
      newConfig,
    ),
    newConfig.params,
  );

  return newConfig;
}
