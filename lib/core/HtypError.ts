import TypeUtils from "../utils/typeOf";

import type HtypConfig from "./config";
import type { EnumOrString, HtypResponse } from "../types";
import type { InternalHtypRequestConfig } from "../types/config";

enum HtypErrorCodes {
  ERR_INVALID_URL = "ERR_INVALID_URL",
  ERR_HTYP = "ERR_HTYP",
  ERR_STRING_NOT_JSON = "ERR_STRING_NOT_JSON",
  ERR_INSTANCE_MISSING_CLONE = "ERR_INSTANCE_MISSING_CLONE",
}

interface HtypErrorJson {
  message: string;
  name: string;
  config?: InternalHtypRequestConfig;
  code?: string;
  status?: number;
}

export default class HtypError<
  T = unknown,
  D = any,
  P extends object = object,
> extends Error {
  public readonly _brand = "HtypError";

  public code?: EnumOrString<HtypErrorCodes>;

  public config?: HtypConfig<D, P>;

  public request?: unknown;

  public response?: HtypResponse<T, D, object, P>;

  public status?: number;

  public constructor(
    message: string,
    code?: EnumOrString<HtypErrorCodes>,
    config?: HtypConfig<D, P>,
    request?: unknown,
    response?: HtypResponse<T, D, object, P>,
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
    response?: HtypResponse<T, D, object, P>,
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
    const jsonPreparedConfig = this.config ? this.config.redact() : undefined;

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
}
