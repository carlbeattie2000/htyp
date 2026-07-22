import type { HtypResponse } from "../types";
import type { HtypRequestConfig } from "./config";
import type HtypConfig from "../core/config";

type RequestFn = <T = any, D = any, P extends object = object>(
  input: string | HtypRequestConfig<D, P>,
  config?: HtypRequestConfig<D, P>,
) => Promise<HtypResponse<T, D, object, P>>;

export interface HtypI {
  defaults: HtypConfig;

  create: (config?: HtypRequestConfig) => HtypI;

  request: RequestFn;
}
