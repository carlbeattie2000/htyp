import Utils from "../utils";
import HtypHeaders from "./headers";
import HtypError from "./HtypError";

import type {
  HttpVersion,
  Method,
  ResponseType,
  StringLiteralOrString,
} from "../types";
import type {
  AnyRequestConfig,
  InternalHtypRequestConfig,
  InternalHtypRequestConfigJSON,
  RequestTransformFinalResult,
  RequestTransforms,
  ResponseValidatorFn,
  TransformResponseFn,
  Transitionals,
} from "../types/config";
import type { RetryPolicy } from "../types/retry";

export default class HtypConfig<
  D = any,
  P extends object = object,
> implements InternalHtypRequestConfig<D, P> {
  public baseUrl: string;

  public url: string;

  public method: StringLiteralOrString<Method>;

  public allowAbsoluteUrls: boolean;

  public data?: D | undefined;

  public params?: P | undefined;

  public transformRequest: RequestTransforms<D>;

  public transformResponse: TransformResponseFn[];

  public responseValidator?: ResponseValidatorFn<unknown> | undefined;

  public transitional: Transitionals;

  public headers: HtypHeaders;

  public responseType: ResponseType;

  public timeout: number;

  public retry: boolean;

  public retryPolicy: RetryPolicy;

  public httpVersion: HttpVersion;

  public redactKeys?: string[] | undefined;

  public _retry: boolean;

  public _retryCount: number;

  public _data?: RequestTransformFinalResult | undefined;

  constructor(internalConfig: InternalHtypRequestConfig) {
    this.baseUrl = internalConfig.baseUrl;

    this.url = internalConfig.url;

    this.method = internalConfig.method.toLowerCase();

    this.allowAbsoluteUrls = internalConfig.allowAbsoluteUrls;

    this.data = internalConfig.data;

    this.transformRequest = internalConfig.transformRequest;

    this.transformResponse = internalConfig.transformResponse;

    this.responseValidator = internalConfig.responseValidator;

    this.transitional = internalConfig.transitional;

    if (internalConfig.headers instanceof HtypHeaders) {
      this.headers = internalConfig.headers;
    } else {
      this.headers = HtypHeaders.from(internalConfig.headers);
    }

    this.responseType = internalConfig.responseType;

    this.timeout = internalConfig.timeout;

    this.retry = internalConfig.retry;

    this.retryPolicy = internalConfig.retryPolicy;

    this.httpVersion = internalConfig.httpVersion;

    this._retry = internalConfig._retry;

    this._retryCount = internalConfig._retryCount;

    this._data = internalConfig._data;
  }

  public toObject(): InternalHtypRequestConfig {
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return { ...this };
  }

  public toJSON(redacted?: boolean): InternalHtypRequestConfigJSON {
    const config: InternalHtypRequestConfigJSON = {
      baseUrl: this.baseUrl,
      url: this.url,
      method: this.method,
      allowAbsoluteUrls: this.allowAbsoluteUrls,
      data: this.data,
      transitional: this.transitional,
      headers: this.headers.toJSON(),
      responseType: this.responseType,
      timeout: this.timeout,
      retry: this.retry,
      retryPolicy: this.retryPolicy,
      httpVersion: this.httpVersion,
      _retry: this._retry,
      _retryCount: this._retryCount,
      _data: this._data,
    };

    if (redacted && config.redactKeys && config.redactKeys.length > 0) {
      return Utils.object.valueReplacer(config, config.redactKeys, "redacted");
    }

    return config;
  }

  public clone(): HtypConfig<D, P> {
    return HtypConfig.clone(this);
  }

  public static clone<D, P extends object>(
    config: HtypConfig<D, P>,
  ): HtypConfig<D, P> {
    const clonedConfig = Utils.object.deepClone(config.toJSON());

    return new HtypConfig<D, P>({
      ...clonedConfig,
      headers: HtypHeaders.from(clonedConfig.headers),
      transformRequest: config.transformRequest,
      transformResponse: config.transformResponse,
      responseValidator: config.responseValidator,
    });
  }

  public merge(...targets: AnyRequestConfig[]): HtypConfig<D, P> {
    return HtypConfig.merge(this, ...targets);
  }

  public static merge<D = any, P extends object = object>(
    base: HtypConfig,
    ...targets: AnyRequestConfig[]
  ): HtypConfig<D, P> {
    if (!(base instanceof HtypConfig)) {
      throw new HtypError(
        "base must be instanceof HtypConfig",
        HtypError.ERR_HTYP,
      );
    }

    const mergedConfig = Utils.object.merge<InternalHtypRequestConfig>(
      base.toObject(),
      ...targets,
    );

    return new HtypConfig<D, P>(mergedConfig);
  }
}
