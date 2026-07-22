import type HtypHeaders from "../core/headers";
import type { Method, StringLiteralOrString } from "../types";

export enum RetryDelayAlgorithm {
  FIXED = "FIXED",
  LINEAR_BACKOFF = "LINEAR_BACKOFF",
  EXPONENTIAL_BACKOFF = "EXPONENTIAL_BACKOFF",
  EXPONENTIAL_BACKOFF_FULL_JITTER = "EXPONENTIAL_BACKOFF_FULL_JITTER",
  EXPONENTIAL_BACKOFF_EQUAL_JITTER = "EXPONENTIAL_BACKOFF_EQUAL_JITTER",
  DECORRELATED_JITTER = "DECORRELATED_JITTER",
  FIBONACCI_BACKOFF = "FIBONACCI_BACKOFF",
  RETRY_AFTER_DRIVEN = "RETRY_AFTER_DRIVEN",
}

interface FixedPolicy {
  type: RetryDelayAlgorithm.FIXED | "FIXED" | Lowercase<"FIXED">;

  delayByMs: number;
}

export interface LinearBackoffPolicy {
  type:
    | RetryDelayAlgorithm.LINEAR_BACKOFF
    | "LINEAR_BACKOFF"
    | Lowercase<"LINEAR_BACKOFF">;

  delayByMs: number;

  increaseByMs: number;

  maxDelayMs: number;
}

export interface ExponentialBackoffPolicy {
  type:
    | RetryDelayAlgorithm.EXPONENTIAL_BACKOFF
    | "EXPONENTIAL_BACKOFF"
    | Lowercase<"EXPONENTIAL_BACKOFF">;

  delayByMs: number;

  multiplyBy: number;

  maxDelayMs: number;
}

export interface ExponentialBackoffPlusFullJitterPolicy {
  type:
    | RetryDelayAlgorithm.EXPONENTIAL_BACKOFF_FULL_JITTER
    | "EXPONENTIAL_BACKOFF_FULL_JITTER"
    | Lowercase<"EXPONENTIAL_BACKOFF_FULL_JITTER">;

  delayByMs: number;

  multiplyBy: number;

  maxDelayMs: number;
}

export interface ExponentialBackoffPlusEqualJitterPolicy {
  type:
    | RetryDelayAlgorithm.EXPONENTIAL_BACKOFF_EQUAL_JITTER
    | "EXPONENTIAL_BACKOFF_EQUAL_JITTER"
    | Lowercase<"EXPONENTIAL_BACKOFF_EQUAL_JITTER">;

  delayByMs: number;

  multiplyBy: number;

  maxDelayMs: number;
}

export interface DecorrelatedJitterPolicy {
  type:
    | RetryDelayAlgorithm.DECORRELATED_JITTER
    | "DECORRELATED_JITTER"
    | Lowercase<"DECORRELATED_JITTER">;

  delayByMs: number;

  previousDelayByMs?: number;

  multiplyBy: number;

  maxDelayMs: number;
}

export interface FibonacciBackoffPolicy {
  type:
    | RetryDelayAlgorithm.FIBONACCI_BACKOFF
    | "FIBONACCI_BACKOFF"
    | Lowercase<"FIBONACCI_BACKOFF">;

  delayByMs: number;

  maxDelayMs: number;

  retryCount: number;
}

export type RetryDelayPolicy =
  | FixedPolicy
  | LinearBackoffPolicy
  | ExponentialBackoffPolicy
  | ExponentialBackoffPlusFullJitterPolicy
  | ExponentialBackoffPlusEqualJitterPolicy
  | DecorrelatedJitterPolicy
  | FibonacciBackoffPolicy
  | "none";

export type RetryPolicyFunction = (
  status: number,
  method: StringLiteralOrString<Method>,
  headers: HtypHeaders,
) => boolean;

export type RetryDelayPolicyFunction = (
  status: number,
  headers: HtypHeaders,
  delayPolicy?: RetryDelayPolicy,
) => Promise<RetryDelayPolicy | null>;

export interface RetryPolicy {
  condition: RetryPolicyFunction;

  delay: RetryDelayPolicyFunction;

  max: number;

  _algorithm?: RetryDelayPolicy;

  _count: number;
}
