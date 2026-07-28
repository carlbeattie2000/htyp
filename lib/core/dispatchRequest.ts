import HtypHeaders from "./headers";

import type HtypConfig from "./config";
import type { AcceptedResponseTransformerTypes } from "../types/config";
import type { InternalHtypResponse } from "../types/response";

export default async function dispatchRequest<D, P extends object>(
  config: HtypConfig<D, P>,
): Promise<InternalHtypResponse> {
  let abortSignal: AbortSignal | undefined;

  if (config.signal) {
    abortSignal = config.signal;
  } else if (config.timeout > 0) {
    abortSignal = AbortSignal.timeout(config.timeout);
  }

  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers.toHeaders(),
    body: config._data,
    credentials: config.credentials,
    mode: config.mode,
    cache: config.cache,
    redirect: config.redirect,
    keepalive: config.keepalive,
    priority: config.priority,
    referrer: config.referrer,
    referrerPolicy: config.referrerPolicy,
    signal: abortSignal,
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
