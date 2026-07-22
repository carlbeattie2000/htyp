import type { StringLiteralOrString } from "../types";
import type {
  HeaderNames,
  HtypHeaderValue,
  KnownHeaderValues,
  RawHtypHeaders,
} from "../types/htypHeaders";

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function isValidHeaderName(header: string): boolean {
  const hasInvalidChar = /\s|@|,|;|\/|\\|\(|\)|<|>|=|\?|\[|\]|\{|\}|"|;|:/.test(
    header,
  );

  return !hasInvalidChar;
}

export default class HtypHeaders {
  private store: Map<HeaderNames, HtypHeaderValue>;

  constructor(headers?: RawHtypHeaders) {
    this.store = new Map();

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }

  public set(
    key: "content-type" | "Content-Type",
    value: StringLiteralOrString<KnownHeaderValues["content-type"]>,
  ): HtypHeaders;
  public set(key: string, value: HtypHeaderValue): HtypHeaders;
  public set(key: HeaderNames, value: HtypHeaderValue): HtypHeaders {
    const headerName = normalizeHeader(key);
    if (!isValidHeaderName(headerName)) {
      throw new Error(`Invalid header name: "${headerName}"`);
    }
    this.store.set(headerName, value);
    return this;
  }

  public get(key: HeaderNames): HtypHeaderValue | undefined {
    const headerName = normalizeHeader(key);
    if (!isValidHeaderName(headerName)) {
      return undefined;
    }
    return this.store.get(headerName);
  }

  public has(key: HeaderNames): boolean {
    const headerName = normalizeHeader(key);
    if (!isValidHeaderName(headerName)) {
      return false;
    }
    return this.store.has(headerName);
  }

  public delete(key: HeaderNames): boolean {
    const headerName = normalizeHeader(key);
    if (this.has(headerName)) {
      this.store.delete(headerName);
      return true;
    }
    return false;
  }

  public clear(): boolean {
    if (this.store.size > 0) {
      this.store.clear();
      return true;
    }
    return false;
  }

  [Symbol.iterator](): Iterator<[HeaderNames, HtypHeaderValue]> {
    return this.store.entries();
  }

  public clone(): HtypHeaders {
    const newHtypHeaders = new HtypHeaders();

    this.store.forEach((value, key) => {
      if (Array.isArray(value)) {
        newHtypHeaders.set(key, [...value]);
      } else {
        newHtypHeaders.set(key, structuredClone(value));
      }
    });

    return newHtypHeaders;
  }

  public toJSON(
    arrayAsString?: boolean,
  ): Record<string, string | number | true | string[]> {
    const obj: Record<string, string | number | true | string[]> = {};

    this.store.forEach((value, key) => {
      if (value !== null && value !== false && value !== undefined) {
        obj[key] =
          arrayAsString && Array.isArray(value) ? value.join(", ") : value;
      }
    });

    return obj;
  }

  public toTuple(): [string, string][] {
    const final: [string, string][] = [];

    this.store.forEach((value, key) => {
      if (value !== null && value !== false && value !== undefined) {
        final.push([key, value.toString()]);
      }
    });

    return final;
  }

  public toString(): string {
    return Object.entries(this.toJSON())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  }

  public toHeaders(): Headers {
    return new Headers(this.toTuple());
  }

  public static from(
    headers: Headers | RawHtypHeaders | string | HtypHeaders,
  ): HtypHeaders {
    if (headers instanceof HtypHeaders) {
      return headers.clone();
    }

    if (typeof headers === "string") {
      const htypHeaders = new HtypHeaders();

      const lines = headers.split(/\r?\n/);

      lines.forEach((line) => {
        const isEmptyLine = line.trim() === "";
        const seperator = ":";

        if (!isEmptyLine) {
          const seperatorIndex = line.indexOf(seperator);

          if (seperatorIndex === -1) {
            throw new Error("Invalid key or header");
          }

          const key = line.slice(0, seperatorIndex);
          const value = line.slice(seperatorIndex + 1);

          htypHeaders.set(key, value);
        }
      });

      return htypHeaders;
    }

    if (headers instanceof Headers) {
      const htypHeaders = new HtypHeaders();
      headers.forEach((value, key) => {
        htypHeaders.set(key, value);
      });
      return htypHeaders;
    }

    const htypHeaders = new HtypHeaders();

    Object.entries(headers).forEach(([key, value]) => {
      htypHeaders.set(key, value);
    });

    return htypHeaders;
  }

  public concat(
    ...targets: (Headers | RawHtypHeaders | string | HtypHeaders)[]
  ): HtypHeaders {
    return HtypHeaders.concat(this, ...targets);
  }

  public static concat(
    first: Headers | RawHtypHeaders | string | HtypHeaders,
    ...targets: (Headers | RawHtypHeaders | string | HtypHeaders)[]
  ): HtypHeaders {
    const combinedHeaders = HtypHeaders.from(first);

    targets.forEach((target) => {
      HtypHeaders.from(target).store.forEach((value, key) => {
        combinedHeaders.set(key, value);
      });
    });

    return combinedHeaders;
  }

  public getContentType(): StringLiteralOrString<
    KnownHeaderValues["content-type"]
  > {
    const contentType = this.get("content-type");

    if (contentType) {
      return contentType as KnownHeaderValues["content-type"];
    }

    return "";
  }

  public setContentType(
    type?: StringLiteralOrString<KnownHeaderValues["content-type"]>,
  ): void {
    this.set("content-type", type);
  }
}
