import HtypHeaders from "./headers";

import type { InternalHtypResponse } from "../types";
import type HtypConfig from "./config";
import type { AcceptedResponseTransformerTypes } from "./config/config.type";

export default async function dispatchRequest<D, P extends object>(
  config: HtypConfig<D, P>,
): Promise<InternalHtypResponse> {
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers.toHeaders(),
    body: config._data,
  });

  let data: AcceptedResponseTransformerTypes = null;

  if (response.body !== null) {
    switch (config.responseType) {
      case "arraybuffer":
        data = await response.arrayBuffer();
        break;
      case "document":
      case "json":
      case "text":
        data = await response.text();
        break;
      case "blob":
        data = await response.blob();
        break;
      case "formdata":
        data = await response.formData();
        break;
      case "stream":
      default:
        data = response.body;
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: HtypHeaders.from(response.headers),
    data,
    raw: response,
  };
}
