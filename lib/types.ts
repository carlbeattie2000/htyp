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
