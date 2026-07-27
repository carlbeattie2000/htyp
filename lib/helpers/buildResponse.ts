import { transformResponseData } from "../core/transforms";
import Utils from "../utils";

import type HtypConfig from "../core/config";
import type { AcceptedResponseTransformerTypes } from "../types/config";
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

export default function buildResponse<D, P extends object, T, E>(
  internalResponse: InternalHtypResponse,
  internalConfig: HtypConfig,
  config: HtypConfig<D, P>,
): HtypResponse<D, P, T, E> {
  const dataTransformed = transformResponseData.call<
    HtypConfig,
    [AcceptedResponseTransformerTypes],
    T | null
  >(internalConfig, internalResponse.data);

  const statusValidated = internalConfig.validateStatus(
    internalResponse.status,
  );

  if (
    !statusValidated &&
    internalConfig.transitional.errorHandling === "default"
  ) {
    return buildErrorResponse<D, P, T, E>(
      internalResponse,
      dataTransformed,
      config,
    );
  }

  if (internalConfig.responseValidator && dataTransformed !== null) {
    const clonedData = Utils.object.deepClone(dataTransformed);
    const { responseValidator } = internalConfig;

    responseValidator.call(null, clonedData);

    return buildValidatedResponse<D, P, T, E>(
      internalResponse,
      dataTransformed,
      config,
    );
  }

  return {
    status: internalResponse.status,
    statusText: internalResponse.statusText,
    headers: internalResponse.headers,
    response: internalResponse.raw,
    config,
    data: dataTransformed,
    error: null,
    validated: false,
  };
}
