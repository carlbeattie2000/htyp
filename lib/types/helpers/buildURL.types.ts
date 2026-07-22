import type { ToFormDataOptions } from "./toFormData.types";

export type ParamsEncoderFn = (value: string) => string;

export type BuildURLOptions = {
  encoder?: ParamsEncoderFn;
} & ToFormDataOptions;
