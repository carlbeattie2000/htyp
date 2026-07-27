import TypeUtils from "../utils/typeOf";

import type HtypConfig from "./config";
import type { EnumOrString } from "../types";
import type { InternalHtypRequestConfigJSON } from "../types/config";
import type { HtypResponse } from "../types/response";

enum HtypErrorCodes {
  ERR_INVALID_URL = "ERR_INVALID_URL",
  ERR_HTYP = "ERR_HTYP",
  ERR_STRING_NOT_JSON = "ERR_STRING_NOT_JSON",
  ERR_INSTANCE_MISSING_CLONE = "ERR_INSTANCE_MISSING_CLONE",
  ERR_INVALID_REQUEST_BODY = "ERR_INVALID_REQUEST_BODY",
}

interface HtypErrorJson {
  message: string;
  name: string;
  config?: InternalHtypRequestConfigJSON;
  code?: string;
  status?: number;
}

export default class HtypError<
  T = unknown,
  D = any,
  P extends object = object,
  E = any,
> extends Error {
  public readonly _brand = "HtypError";

  public code?: EnumOrString<HtypErrorCodes>;

  public config?: HtypConfig<D, P>;

  public request?: unknown;

  public response?: HtypResponse<D, P, T, E>;

  public status?: number;

  public constructor(
    message: string,
    code?: EnumOrString<HtypErrorCodes>,
    config?: HtypConfig<D, P>,
    request?: unknown,
    response?: HtypResponse<D, P, T, E>,
  ) {
    super(message);

    this.name = "HtypError";

    this.code = code;

    this.config = config;

    this.request = request;

    if (this.response) {
      this.response = response;

      this.status = response?.status;
    }
  }

  public static from<T = any, D = any, P extends object = object>(
    error: Error,
    code?: EnumOrString<HtypErrorCodes>,
    config?: HtypConfig<D, P>,
    request?: unknown,
    response?: HtypResponse<D, P, T>,
  ): HtypError<T, D, P> {
    if (TypeUtils.isHtypError(error)) {
      return new HtypError(
        error.message,
        code ?? error.code,
        config,
        request,
        response,
      );
    }

    return new HtypError(
      error.message,
      code ?? HtypErrorCodes.ERR_HTYP,
      config,
      request,
      response,
    );
  }

  public toJSON(): HtypErrorJson {
    const jsonPreparedConfig = this.config
      ? this.config.toJSON(true)
      : undefined;

    return {
      message: this.message,
      name: this.name,
      config: jsonPreparedConfig,
      code: this.code,
      status: this.status,
    };
  }

  public static readonly ERR_HTYP: HtypErrorCodes = HtypErrorCodes.ERR_HTYP;

  public static readonly ERR_INVALID_URL: HtypErrorCodes =
    HtypErrorCodes.ERR_INVALID_URL;

  public static readonly ERR_STRING_NOT_JSON: HtypErrorCodes =
    HtypErrorCodes.ERR_STRING_NOT_JSON;

  public static readonly ERR_INSTANCE_MISSING_CLONE: HtypErrorCodes =
    HtypErrorCodes.ERR_INSTANCE_MISSING_CLONE;

  public static readonly ERR_INVALID_REQUEST_BODY: HtypErrorCodes =
    HtypErrorCodes.ERR_INVALID_REQUEST_BODY;
}
