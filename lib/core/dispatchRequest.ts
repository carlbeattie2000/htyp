import HtypHeaders from "./headers";

import type { InternalHtypResponse } from "../types";
import type HtypConfig from "./config";

export default async function dispatchRequest<D, P extends object>(
  config: HtypConfig<D, P>,
): Promise<InternalHtypResponse> {
  const response = await fetch(config.url, {
    headers: config.headers.toHeaders(),
    body: config._data,
  });

  Object.assign(response, { headers: HtypHeaders.from(response.headers) });

  return response as InternalHtypResponse;
}
