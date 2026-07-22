import Utils from "../../utils";
import { assertIsObject } from "../../utils/assertions";
import Adapters from "../adapter";
import HtypHeaders from "../headers";
import { defaultRetryDelayPolicy, defaultRetryPolicy } from "../retries";

import type {
  RequestTransformFinalResult,
  RequestTransforms,
  TransformRequestFinalFn,
  TransformResponseFn,
} from "./config.type";
import type {
  HttpVersion,
  Method,
  ResponseType,
  StringLiteralOrString,
} from "../../types";
import type { Adapter } from "../../types/adapters";
import type {
  HtypRequestConfig,
  InternalHtypRequestConfig,
} from "../../types/config";
import type { RetryPolicy } from "../../types/retry";

const defaultTransformRequest: TransformRequestFinalFn<any> = (data) =>
  JSON.stringify(data);

export default class HtypConfig<
  D = any,
  P extends object = object,
> implements InternalHtypRequestConfig<D, P> {
  public baseUrl: string;

  public url: string;

  public method: StringLiteralOrString<Method>;

  public allowAbsoluteUrls: boolean;

  public data?: D;

  public params?: P;

  public transformRequest: RequestTransforms<D>;

  public transformResponse: TransformResponseFn | TransformResponseFn[];

  public headers: HtypHeaders;

  public responseType: ResponseType;

  public timeout: number;

  public retry: boolean;

  public retryPolicy: RetryPolicy;

  public httpVersion: HttpVersion;

  public redact?: string[] | undefined;

  public _retry: boolean;

  public _retryCount: number;

  public _adapter: Adapter;

  public _data?: RequestTransformFinalResult | undefined;

  public static get createDefaultsObj(): InternalHtypRequestConfig {
    return {
      baseUrl: "",
      url: "",
      method: "get",
      allowAbsoluteUrls: false,
      data: undefined,
      transformRequest: [defaultTransformRequest],
      transformResponse: (data) => data,
      headers: new HtypHeaders(),
      responseType: "json",
      timeout: 15_000,
      retry: false,
      retryPolicy: {
        condition: defaultRetryPolicy,
        delay: defaultRetryDelayPolicy,
        max: 1,
        _algorithm: {
          type: "LINEAR_BACKOFF",
          delayByMs: 100,
          increaseByMs: 150,
          maxDelayMs: 30_000,
        },
        _count: 0,
      },
      httpVersion: 2,
      _retry: false,
      _retryCount: 0,
      _adapter: Adapters.fetch,
      _data: undefined,
    };
  }

  public static get createDefaults(): HtypConfig {
    return new HtypConfig(this.createDefaultsObj);
  }

  public static get defaults(): HtypConfig {
    return this.createDefaults;
  }

  constructor(config: InternalHtypRequestConfig<D, P>) {
    this.baseUrl = config.baseUrl;

    this.url = config.url;

    this.method = config.method.toLowerCase();

    this.allowAbsoluteUrls = config.allowAbsoluteUrls;

    this.data = config.data;

    this.transformRequest = config.transformRequest;

    this.transformResponse = config.transformResponse;

    this.headers = HtypHeaders.from(config.headers);

    this.responseType = config.responseType;

    this.timeout = config.timeout;

    this.retry = config.retry;

    this.retryPolicy = config.retryPolicy;

    this.httpVersion = config.httpVersion;

    this._retry = config._retry;

    this._retryCount = config._retryCount;

    this._adapter = config._adapter;

    this._data = config._data;
  }

  public toObject(): InternalHtypRequestConfig<D, P> {
    return {
      baseUrl: this.baseUrl,
      url: this.url,
      method: this.method,
      allowAbsoluteUrls: this.allowAbsoluteUrls,
      data: this.data,
      transformRequest: this.transformRequest,
      transformResponse: this.transformResponse,
      headers:
        this.headers instanceof HtypHeaders
          ? this.headers.clone()
          : structuredClone(this.headers),
      responseType: this.responseType,
      timeout: this.timeout,
      retry: this.retry,
      retryPolicy: this.retryPolicy,
      httpVersion: this.httpVersion,
      _retry: this._retry,
      _retryCount: this._retryCount,
      _adapter: this._adapter,
      _data: this._data,
    };
  }

  public merge<RD = any, RP extends object = object>(
    ...targets: (HtypRequestConfig | InternalHtypRequestConfig | HtypConfig)[]
  ): HtypConfig<RD, RP> {
    return HtypConfig.merge<RD, RP>(this, ...targets);
  }

  private static stripUndefinedValues<D = any, P extends object = object>(
    config: HtypRequestConfig<D, P>,
  ): Partial<HtypRequestConfig<D, P>> {
    return Utils.Object.removeUndefinedProperties(
      Utils.Object.deepClone(config),
      ["data", "_data"],
    );
  }

  private static normalizeConfig<D = any, P extends object = object>(
    config: HtypRequestConfig<D, P>,
  ): HtypRequestConfig<D, P> {
    if (config.method) {
      config.method = config.method.toLowerCase();
    }

    return config;
  }

  public static merge<D = any, P extends object = object>(
    first: HtypConfig | InternalHtypRequestConfig,
    ...targets: (HtypRequestConfig | InternalHtypRequestConfig | HtypConfig)[]
  ): HtypConfig<D, P> {
    const mainConfig = HtypConfig.from(first);

    const combinedConfigs = targets.reduce<InternalHtypRequestConfig>(
      (acc, current) => {
        if (current instanceof HtypConfig) {
          return { ...acc, ...current.toObject() };
        }

        return {
          ...acc,
          ...this.normalizeConfig(this.stripUndefinedValues(current)),
        };
      },
      mainConfig.toObject(),
    );

    assertIsObject<InternalHtypRequestConfig<D, P>>(
      combinedConfigs,
      this.createDefaultsObj,
      ["data", "_data"],
    );

    return new HtypConfig<D, P>(combinedConfigs);
  }

  public static from<D = any, P extends object = object>(
    config: HtypConfig<D, P> | InternalHtypRequestConfig<D, P>,
  ): HtypConfig<D, P> {
    if (config instanceof HtypConfig) {
      return new HtypConfig(config);
    }

    return new HtypConfig(config);
  }

  public clone(): HtypConfig<D, P> {
    return HtypConfig.clone(this);
  }

  public static clone<D = any, P extends object = object>(
    config: HtypConfig<D, P>,
  ): HtypConfig<D, P> {
    return Utils.Object.deepClone(config);
  }
}
