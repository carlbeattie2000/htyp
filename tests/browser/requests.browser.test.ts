import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HtypError from "../../lib/core/HtypError";
import toFormData from "../../lib/helpers/toFormData";
import htyp from "../../lib/htyp";
import { MockFetch } from "../mocks/fetch.mock";

import type { FetchCapture } from "../mocks/fetch.mock";

let orignalFetch: typeof fetch;
let capturedFetch: FetchCapture;

describe("requests", () => {
  beforeEach(() => {
    capturedFetch = {};
    orignalFetch = window.fetch;
    window.fetch = MockFetch.fetch(capturedFetch) as typeof fetch;
    MockFetch.respondWith();
  });

  afterEach(() => {
    window.fetch = orignalFetch;
  });

  it("should treat single string arg as url", async () => {
    await htyp.request("/foo");

    expect(capturedFetch.url).toBe("/foo");
    expect(capturedFetch.method).toBe("get");
  });

  it("should treat method value as lowercase string", async () => {
    const response = await htyp.request("/bar", {
      method: "POST",
    });

    expect(response).toBeDefined();
    expect(response.config.method).toBe("post");
  });

  it("should allow string arg as url, and config arg", async () => {
    const response = await htyp.request("/bar", {
      method: "POST",
    });

    expect(response).toBeDefined();
    expect(response.config.url).toBe("/bar");
    expect(response.config.method).toBe("post");
  });

  it("should allow data", async () => {
    const response = await htyp.request("/bar", {
      method: "POST",
      data: { foo: "bar" },
    });

    expect(response).toBeDefined();
    expect(response.config._data).toEqual(JSON.stringify({ foo: "bar" }));
  });

  it("should make an http request", async () => {
    await htyp.request("/bar");

    expect(capturedFetch.url).toBe("/bar");
  });

  it("should retry on network errors when enabled on config", async () => {
    const htypInstance = htyp.create({
      retry: true,
    });

    MockFetch.respondWith({
      status: 429,
    });

    const response = await htypInstance.request("/bar");

    expect(response.status).toBe(429);
    expect(response.config._retry).toBeTruthy();
    expect(response.config._retryCount).toBe(1);
  });

  it("should not retry on successful responses", async () => {
    const htypInstance = htyp.create({
      retry: true,
    });

    const response = await htypInstance.request("/bar");

    expect(response.status).toBe(200);
    expect(response.config._retry).toBeFalsy();
    expect(response.config._retryCount).toBe(0);
  });

  it("should not retry on network errors when disabled on config", async () => {
    const htypInstance = htyp.create({
      retry: false,
    });

    MockFetch.respondWith({
      status: 429,
    });

    const response = await htypInstance.request("/bar");

    expect(response.status).toBe(429);
    expect(response.config._retry).toBeFalsy();
    expect(response.config._retryCount).toBe(0);
  });

  it("rejects malformed HTTP URLs before sending fetch request", async () => {
    const openSpy = vi.spyOn(window, "fetch");

    const reason = await htyp
      .request("\u0000https:example.com/users", {
        headers: { "X-Test": "yes" },
      })
      .catch((err) => err as Error);

    expect(openSpy).not.toHaveBeenCalled();
    expect(reason).toBeInstanceOf(HtypError);
    if (reason instanceof HtypError) {
      expect(reason.code).toBe(HtypError.ERR_INVALID_URL);
      expect(reason.message).toBe(
        'Invalid URL "https:example.com/users": missing "//" after protocol',
      );
      expect(reason.config).toBeDefined();
      if (reason.config) {
        expect(reason.config.url).toBe("\u0000https:example.com/users");
        expect(reason.config.headers.get("X-Test")).toBe("yes");
      }
    }
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("should make cross domain http request", async () => {
    MockFetch.respondWith({
      status: 200,
      statusText: "OK",
      body: '{"foo": "bar"}',
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await htyp.request("www.someurl.com/foo", {
      method: "post",
    });

    expect(response.data.foo).toBe("bar");
    expect(response.status).toBe(200);
    expect(response.statusText).toBe("OK");
    expect(response.headers.getContentType()).toBe("application/json");
  });

  it("should supply correct response", async () => {
    MockFetch.respondWith({
      status: 200,
      statusText: "OK",
      body: '{"foo": "bar"}',
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await htyp.request<{ foo: string }>("/foo", {
      method: "post",
    });

    expect(response.data?.foo).toBe("bar");
    expect(response.status).toBe(200);
    expect(response.statusText).toBe("OK");
    expect(response.headers.getContentType()).toBe("application/json");
  });

  it("should default Content-Type to application/json", async () => {
    const response = await htyp.request("/foo");

    expect(response.config.headers.getContentType()).toBe("application/json");
  });

  it("should not modify the config url with relative baseURL", async () => {
    MockFetch.respondWith({
      status: 404,
      statusText: "NOT FOUND",
      body: "Resource not found",
    });

    const response = await htyp.request("/foo", {
      baseUrl: "/api",
      responseType: "text",
    });

    expect(response.config.baseUrl).toBe("/api");
    expect(response.config.url).toBe("/foo");
  });

  it("should allow overriding Content-Type header case-insensitive", async () => {
    const contentType = "application/htyp.typescript+json";
    const response = await htyp.request("/foo", {
      method: "post",
      data: { prop: "value" },
      headers: {
        "Content-Type": contentType,
      },
    });

    expect(response.config.headers.getContentType()).toBe(contentType);
  });

  it("should correctly set content-type when request body is FormData", async () => {
    const obj = {
      foo: "bar",
    };

    const response = await htyp.request("/foo", {
      method: "post",
      data: toFormData(obj),
    });

    expect(response.config.headers.has("content-type")).toBe(false);

    expect(
      capturedFetch.request?.headers
        .get("content-type")
        ?.includes("multipart/form-data"),
    ).toBeTruthy();
  });
});
