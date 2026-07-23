import Utils from "../utils";

import type {
  RequestInterceptorFns,
  ResponseInterceptorFns,
} from "../types/interceptors";

export default class Interceptor<InterceptorFn> {
  private _interceptors: InterceptorFn[];

  public get interceptors(): InterceptorFn[] {
    return Utils.object.deepClone(this._interceptors);
  }

  constructor() {
    this._interceptors = [];
  }

  public use(interceptorFn: InterceptorFn): InterceptorFn {
    this._interceptors.push(interceptorFn);

    return interceptorFn;
  }

  public eject(interceptorFn: InterceptorFn): InterceptorFn {
    this._interceptors = this._interceptors.filter(
      (fn) => fn !== interceptorFn,
    );

    return interceptorFn;
  }

  public clear(): void {
    this._interceptors = [];
  }

  public static newRequestInterceptors(): Interceptor<RequestInterceptorFns> {
    return new Interceptor<RequestInterceptorFns>();
  }

  public static newResponseInterceptors(): Interceptor<ResponseInterceptorFns> {
    return new Interceptor<ResponseInterceptorFns>();
  }

  public static newRequestAndResponseInterceptors(): {
    request: Interceptor<RequestInterceptorFns>;
    response: Interceptor<ResponseInterceptorFns>;
  } {
    return {
      request: this.newRequestInterceptors(),
      response: this.newResponseInterceptors(),
    };
  }
}
