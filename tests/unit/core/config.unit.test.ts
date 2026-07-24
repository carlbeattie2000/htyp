import { describe, expect, it } from "vitest";

import HtypConfig from "../../../lib/core/config";
import createDefaultConfig, {
  createDefaultInternalConfig,
} from "../../../lib/core/defaults";
import HtypHeaders from "../../../lib/core/headers";

import type { HtypRequestConfig } from "../../../lib/types/config";

describe("core::config", () => {
  it("should be HtypConfig", () => {
    const config = new HtypConfig(createDefaultInternalConfig());

    expect(config).toBeInstanceOf(HtypConfig);
  });

  it("should clone HtypConfig", () => {
    const config = createDefaultConfig();
    const clonedConfig = config.clone();

    expect(clonedConfig).toBeInstanceOf(HtypConfig);
    expect(clonedConfig).not.toBe(config);
  });

  it("should clone headers instance when cloning config", () => {
    const config = createDefaultConfig();
    const clonedConfig = config.clone();

    expect(clonedConfig.headers).toBeInstanceOf(HtypHeaders);
    expect(clonedConfig).not.toBe(config.headers);
  });

  it("should convert to JSON object with no methods attached", () => {
    const config = createDefaultConfig();
    const configJSON = config.toJSON();

    const configJSONValues = Object.entries(configJSON);
    const configJSONHasMethod = configJSONValues.some(
      (value) => typeof value === "function",
    );

    expect(configJSONHasMethod).toBeFalsy();
  });

  it("should serialize headers when coverting to JSON", () => {
    const config = createDefaultConfig();
    const configJSON = config.toJSON();

    expect(configJSON.headers).not.toBeInstanceOf(HtypHeaders);
    expect(configJSON.headers).not.toBeInstanceOf(Headers);
  });

  it("should combine a complete config with a partial one", () => {
    const config = createDefaultConfig();
    const partialConfig: HtypRequestConfig = {
      method: "post",
    };

    const combinedConfigs = config.merge(partialConfig);

    expect(combinedConfigs).toBeInstanceOf(HtypConfig);
  });

  it("should overwrite base config values", () => {
    const config = createDefaultConfig();
    const partialConfig: HtypRequestConfig = {
      method: "post",
    };

    const combinedConfigs = config.merge(partialConfig);

    expect(config.method).toEqual("get");
    expect(combinedConfigs.method).toEqual("post");
  });

  it("should throw when merging and base config is not instance of HtypConfig", () => {
    const base: HtypRequestConfig = {
      url: "/foo",
    };
    const partialConfig: HtypRequestConfig = {
      method: "post",
    };

    expect(() => HtypConfig.merge(base, partialConfig)).toThrow();
  });

  it("should merge functions on the config", () => {
    const config = createDefaultConfig();
    const partialConfig: HtypRequestConfig = {
      method: "post",
    };

    const combined = config.merge(partialConfig);

    expect(combined.transformRequest).toHaveLength(1);
    expect(typeof combined.transformRequest[0]).toEqual("function");
  });
});
