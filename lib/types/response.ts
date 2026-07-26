import type { AcceptedResponseTransformerTypes } from "./config";
import type HtypConfig from "../core/config";
import type HtypHeaders from "../core/headers";

export interface InternalHtypResponse {
  status: number;
  statusText: string;
  headers: HtypHeaders;
  data: AcceptedResponseTransformerTypes;
  raw: Response;
}

interface BaseHtypResponse<D = any, P extends object = object> {
  status: number;
  statusText: string;
  headers: HtypHeaders;
  config: HtypConfig<D, P>;
  response: Response;
}

export type UnvalidatedResponse<
  D = any,
  P extends object = object,
  T = any,
> = BaseHtypResponse<D, P> & { error: null; validated: false; data: T | null };

export type ValidatedResponse<
  D = any,
  P extends object = object,
  T = any,
> = BaseHtypResponse<D, P> & { error: null; validated: true; data: T };

export type ErrorResponse<
  D = any,
  P extends object = object,
  E = any,
> = BaseHtypResponse<D, P> & { error: E; validated: false; data: null };

export type HtypResponse<D = any, P extends object = object, T = any, E = any> =
  | UnvalidatedResponse<D, P, T>
  | ValidatedResponse<D, P, T>
  | ErrorResponse<D, P, E>;
