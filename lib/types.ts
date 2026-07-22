import type HtypConfig from "./core/config";
import type HtypHeaders from "./core/headers";

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type StringLiteralOrString<Literals extends string> =
  Literals | (string & {});

export type EnumOrString<T> = T | (string & {});

type UppercaseMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
export type Method = (UppercaseMethod | Lowercase<UppercaseMethod>) & {};

export type ResponseType =
  "arraybuffer" | "document" | "json" | "text" | "stream" | "blob" | "formdata";

export type UppercaseResponseEncoding =
  | "ASCII"
  | "ANSI"
  | "BINARY"
  | "BASE64"
  | "BASE64URL"
  | "HEX"
  | "LATIN1"
  | "UCS-2"
  | "UCS2"
  | "UTF-8"
  | "UTF8"
  | "UTF16LE";

export type ResponseEncoding = (
  UppercaseResponseEncoding | Lowercase<UppercaseResponseEncoding>
) & {};

export type HttpVersion = 1 | 2;

export type InternalHtypResponse = Response & {
  headers: HtypHeaders;
};

export interface HtypResponse<T = any, D = any, H = object, P = any> {
  data: T;
  status: number;
  statusText: string;
  headers: H & HtypHeaders;
  config: HtypConfig<D, P>;
}

export type RequestFn = <T, B = any>(
  config: HtypConfig<B>,
) => Promise<HtypResponse<T | null, B>>;
