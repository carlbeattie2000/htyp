import buildURL from "./buildURL";
import buildFullPath from "../core/buildFullPath";
import Utils from "../utils";

import type HtypConfig from "../core/config";

export default function resolveConfig<D = any, P extends object = object>(
  config: HtypConfig<D, P>,
): HtypConfig<D, P> {
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

  if (Utils.isFormData(config.data)) {
    config.headers.setContentType(undefined);
  }

  return newConfig;
}
