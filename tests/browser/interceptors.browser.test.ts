import { afterEach, beforeEach, describe, expect, it } from "vitest";

import htyp from "../../lib/htyp";
import { MockFetch } from "../mocks/fetch.mock";

import type { FetchCapture } from "../mocks/fetch.mock";

let orignalFetch: typeof fetch;
let capturedFetch: FetchCapture;

describe("interceptors", () => {
  beforeEach(() => {
    capturedFetch = {};
    orignalFetch = window.fetch;
    window.fetch = MockFetch.fetch(capturedFetch) as typeof fetch;
    MockFetch.respondWith();
  });

  afterEach(() => {
    window.fetch = orignalFetch;
  });

  it("should intercept request", async () => {
    const instance = htyp.create();

    instance.interceptors.request.use((config) => {
      config.url = "/foo";

      return config;
    });

    const response = await instance.request({
      method: "get",
    });

    expect(response.config.url).toBe("/foo");
  });

  it("allows async function as request interceptor", async () => {
    const instance = htyp.create();

    instance.interceptors.request.use(async (config) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          config.url = "/foo";
          resolve(null);
        }, 1000);
      });
      return config;
    });

    const response = await instance.request({
      method: "get",
    });

    expect(response.config.url).toBe("/foo");
  });

  it("allows async and sync function as request interceptor", async () => {
    const instance = htyp.create();

    instance.interceptors.request.use(async (config) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          config.headers.set("test-01", "test-01");
          resolve(null);
        }, 1000);
      });
      return config;
    });

    instance.interceptors.request.use((config) => {
      config.headers.set("test-02", "test-02");
      return config;
    });

    const response = await instance.request("/foo");

    expect(response.config.url).toBe("/foo");
    expect(response.config.headers.get("test-01")).toBe("test-01");
    expect(response.config.headers.get("test-02")).toBe("test-02");
  });

  it("removes a request interceptor", async () => {
    const instance = htyp.create();

    instance.interceptors.request.use((config) => {
      config.url = "/bar";
      return config;
    });

    const setUrlToFooInterceptor = instance.interceptors.request.use(
      (config) => {
        config.url = "/foo";
        return config;
      },
    );

    instance.interceptors.request.eject(setUrlToFooInterceptor);

    const response = await instance.request({
      method: "get",
    });

    expect(response.config.url).toBe("/bar");
  });

  it("clears all request interceptors", async () => {
    const instance = htyp.create();

    instance.interceptors.request.use((config) => {
      config.url = "/bar";
      return config;
    });

    instance.interceptors.request.use((config) => {
      config.url = "/foo";
      return config;
    });

    instance.interceptors.request.clear();

    const response = await instance.request("/users");

    expect(response.config.url).toBe("/users");
  });

  it("executes request interceptors in FIFO order", async () => {
    const instance = htyp.create();
    let sequence = "";

    instance.interceptors.request.use((config) => {
      sequence += "1";
      return config;
    });

    instance.interceptors.request.use((config) => {
      sequence += "2";
      return config;
    });

    instance.interceptors.request.use((config) => {
      sequence += "3";
      return config;
    });

    await instance.request("/foo");

    expect(sequence).toBe("123");
  });

  it("should intercept response", async () => {
    const instance = htyp.create();

    instance.interceptors.response.use((response) => {
      response.data = "intercepted";
      return response;
    });

    const response = await instance.request("/foo");

    expect(response.data).toBe("intercepted");
  });

  it("should intercept response asynchronously", async () => {
    const instance = htyp.create();

    instance.interceptors.response.use(async (response) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          response.data = "intercepted";
          resolve(null);
        }, 1000);
      });
      return response;
    });

    const response = await instance.request("/foo");

    expect(response.data).toBe("intercepted");
  });

  it("should intercept response asynchronously and synchronously", async () => {
    const instance = htyp.create();

    instance.interceptors.response.use(async (response) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          response.data = "intercepted asynchronously";
          resolve(null);
        }, 1000);
      });
      return response;
    });

    instance.interceptors.response.use((response) => {
      response.data += " and synchronously";
      return response;
    });

    const response = await instance.request("/foo");

    expect(response.data).toBe("intercepted asynchronously and synchronously");
  });

  it("should remove a response interceptor", async () => {
    const instance = htyp.create();

    const interceptor = instance.interceptors.response.use(async (response) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          response.data = "intercepted asynchronously";
          resolve(null);
        }, 1000);
      });
      return response;
    });

    instance.interceptors.response.use((response) => {
      response.data = "intercepted synchronously";
      return response;
    });

    instance.interceptors.response.eject(interceptor);

    const response = await instance.request("/foo");

    expect(response.data).toBe("intercepted synchronously");
  });

  it("should clear all response interceptors", async () => {
    const instance = htyp.create();

    instance.interceptors.response.use(async (response) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          response.data = "intercepted asynchronously";
          resolve(null);
        }, 1000);
      });
      return response;
    });

    instance.interceptors.response.use((response) => {
      response.data = "intercepted synchronously";
      return response;
    });

    instance.interceptors.response.clear();

    const response = await instance.request("/foo");

    expect(response.data).toBe(null);
  });

  it("should execute response interceptors in FIFO order", async () => {
    const instance = htyp.create();
    let sequence = "";

    instance.interceptors.response.use((response) => {
      sequence += "1";
      return response;
    });

    instance.interceptors.response.use((response) => {
      sequence += "2";
      return response;
    });

    instance.interceptors.response.use((response) => {
      sequence += "3";
      return response;
    });

    await instance.request("/foo");

    expect(sequence).toBe("123");
  });
});
