import type HtypConfig from "../core/config";
import type { HtypResponse, InternalHtypResponse } from "../types/response";

export function buildErrorResponse<D, P extends object, T, E>(
  internalResponse: InternalHtypResponse,
  data: T | null,
  config: HtypConfig<D, P>,
): HtypResponse<D, P, T, E> {
  return {
    status: internalResponse.status,
    statusText: internalResponse.statusText,
    headers: internalResponse.headers,
    response: internalResponse.raw,
    config,
    data: null,
    error: data as E,
    validated: false,
  };
}

export function buildResponse<D, P extends object, T, E>(
  internalResponse: InternalHtypResponse,
  data: T | null,
  config: HtypConfig<D, P>,
): HtypResponse<D, P, T, E> {
  return {
    status: internalResponse.status,
    statusText: internalResponse.statusText,
    headers: internalResponse.headers,
    response: internalResponse.raw,
    config,
    data,
    error: null,
    validated: false,
  };
}

export function buildValidatedResponse<D, P extends object, T, E>(
  internalResponse: InternalHtypResponse,
  data: T,
  config: HtypConfig<D, P>,
): HtypResponse<D, P, T, E> {
  return {
    status: internalResponse.status,
    statusText: internalResponse.statusText,
    headers: internalResponse.headers,
    response: internalResponse.raw,
    config,
    data,
    error: null,
    validated: true,
  };
}
