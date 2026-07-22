import { describe, expect, it } from "vitest";

import buildURL from "../../../lib/helpers/buildURL";

describe("helpers::buildURL", () => {
  it("should support no params", () => {
    expect(buildURL("/foo")).toEqual("/foo");
  });

  it("should support params", () => {
    expect(
      buildURL("/foo", {
        foo: "bar",
        bar: undefined,
        foobar: null,
      }),
    ).toEqual("/foo?foo=bar");
  });

  it("should support params with undefined url", () => {
    expect(buildURL(undefined, { foo: "bar" })).toEqual("?foo=bar");
  });

  it("should support object params", () => {
    expect(
      buildURL("/foo", {
        foo: {
          bar: "baz",
        },
      }),
    ).toEqual("/foo?foo%5Bbar%5D=baz");
  });

  it("should support date params", () => {
    const date = new Date();

    expect(
      buildURL("/foo", {
        date,
      }),
    ).toEqual(`/foo?date=${date.toISOString()}`);
  });

  it("should support array params with encode", () => {
    expect(
      buildURL("/foo", {
        foo: ["bar", "baz"],
      }),
    ).toEqual("/foo?foo%5B%5D=bar&foo%5B%5D=baz");
  });

  it("should support existing params", () => {
    expect(
      buildURL("/foo?foo=bar", {
        bar: "baz",
      }),
    ).toEqual("/foo?foo=bar&bar=baz");
  });

  it('should support "length" parameter', () => {
    expect(
      buildURL("/foo", {
        query: "bar",
        start: 0,
        length: 5,
      }),
    ).toEqual("/foo?query=bar&start=0&length=5");
  });

  it("should correct discard url hash mark", () => {
    expect(
      buildURL("/foo?foo=bar#hash", {
        query: "baz",
      }),
    ).toEqual("/foo?foo=bar&query=baz");
  });

  it("should support URLSearchParams", () => {
    expect(buildURL("/foo", new URLSearchParams("bar=baz"))).toEqual(
      "/foo?bar=baz",
    );
  });

  it("should support special char params", () => {
    expect(
      buildURL("/foo", {
        foo: ":$, ",
      }),
    ).toEqual("/foo?foo=:$,+");
  });

  it("should discard functions", () => {
    expect(
      buildURL("/foo", {
        foo: "bar",
        bar: () => "foo",
      }),
    ).toEqual("/foo?foo=bar");
  });

  it("should support nested params", () => {
    expect(
      buildURL("/foo", {
        foo: {
          bar: "foo",
          foo: {
            bar: "foo",
          },
        },
      }),
    ).toEqual("/foo?foo%5Bbar%5D=foo&foo%5Bfoo%5D%5Bbar%5D=foo");
  });

  it("should support matrix", () => {
    expect(
      buildURL("/foo", {
        foo: [["foo"], ["bar"]],
      }),
    ).toEqual("/foo?foo%5B0%5D%5B0%5D=foo&foo%5B1%5D%5B0%5D=bar");
  });
});
