import HtypHeaders from "./headers";

import type HtypConfig from "./config";
import type { AdapterResponse } from "../types/adapters";

export default class Adapters {
  public static async fetch<D = any, P extends object = object>(
    config: HtypConfig<D, P>,
  ): Promise<AdapterResponse<D, P>> {
    const response = await fetch(config.url, {
      headers: config.headers.toHeaders(),
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: HtypHeaders.from(response.headers),
      data: response.body,
      config,
    };
  }
}
