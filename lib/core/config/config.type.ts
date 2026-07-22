import type HtypHeaders from "../headers";

export type TransformRequestFn<T> = (data: T, headers: HtypHeaders) => T;

export type RequestTransformFinalResult =
  string | ArrayBuffer | FormData | ReadableStream | Blob | null;

export type TransformRequestFinalFn<T> = (
  data: T,
  headers: HtypHeaders,
) => RequestTransformFinalResult;

export type RequestTransforms<T> = [
  ...TransformRequestFn<T>[],
  TransformRequestFinalFn<T>,
];

export type AcceptedResponseTransformerTypes =
  | ReadableStream<Uint8Array<ArrayBuffer>>
  | ArrayBuffer
  | Blob
  | Uint8Array
  | string
  | FormData
  | object
  | null;

export type TransformResponseFn = (
  data: AcceptedResponseTransformerTypes,
) => AcceptedResponseTransformerTypes;
