import type HtypConfig from "../core/config";
import type HtypHeaders from "../core/headers";
import type HtypError from "../core/HtypError";

export type Adapter = <D = any, P extends object = object>(
  config: HtypConfig<D, P>,
) => Promise<AdapterResponse<D, P>>;

export interface AdapterResponse<D = any, P extends object = object> {
  status: number;
  statusText: string;
  headers: HtypHeaders;
  error?: HtypError;
  config: HtypConfig<D, P>;

  body: ReadableStream<Uint8Array<ArrayBuffer>> | null;
}
