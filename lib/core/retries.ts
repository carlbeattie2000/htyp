import { RetryDelayAlgorithm } from "../types/retry";
import Utils from "../utils";
import HtypHeaders from "./headers";

import type HtypConfig from "./config";
import type {
  InternalHtypResponse,
  Method,
  StringLiteralOrString,
} from "../types";
import type {
  DecorrelatedJitterPolicy,
  ExponentialBackoffPlusEqualJitterPolicy,
  ExponentialBackoffPlusFullJitterPolicy,
  ExponentialBackoffPolicy,
  FibonacciBackoffPolicy,
  LinearBackoffPolicy,
  RetryDelayPolicy,
} from "../types/retry";

const RETRY_ON_STATUS = [429, 408, 500, 502, 503, 504];
const SKIP_RETRY_ON_METHODS: StringLiteralOrString<Method>[] = ["post", "POST"];

const delay = async (ms: number) => Utils.wait(ms);

export function defaultRetryPolicy(
  status: number,
  method: StringLiteralOrString<Method>,
): boolean {
  return (
    RETRY_ON_STATUS.includes(status) && !SKIP_RETRY_ON_METHODS.includes(method)
  );
}

async function linearBackoffDelay(
  policy: LinearBackoffPolicy,
): Promise<LinearBackoffPolicy> {
  await delay(policy.delayByMs);

  return {
    ...policy,
    delayByMs: Math.max(
      policy.maxDelayMs,
      policy.delayByMs + policy.increaseByMs,
    ),
  };
}

async function exponentialBackoffDelay(
  policy: ExponentialBackoffPolicy,
): Promise<ExponentialBackoffPolicy> {
  await delay(policy.delayByMs);

  policy.delayByMs = Math.max(
    policy.maxDelayMs,
    policy.delayByMs * policy.multiplyBy,
  );

  return policy;
}

async function exponentialBackoffFullJitterDelay(
  policy: ExponentialBackoffPlusFullJitterPolicy,
): Promise<ExponentialBackoffPlusFullJitterPolicy> {
  const delayByMs = Math.random() * policy.delayByMs;

  await delay(delayByMs);

  policy.delayByMs = Math.max(
    policy.maxDelayMs,
    policy.delayByMs * policy.multiplyBy,
  );

  return policy;
}

async function exponentialBackoffEqualJitterDelay(
  policy: ExponentialBackoffPlusEqualJitterPolicy,
): Promise<ExponentialBackoffPlusEqualJitterPolicy> {
  const delayByMs =
    policy.delayByMs / 2 + (Math.random() * policy.delayByMs) / 2;

  await delay(delayByMs);

  policy.delayByMs = Math.max(
    policy.maxDelayMs,
    policy.delayByMs * policy.multiplyBy,
  );

  return policy;
}

async function decorrelatedJitterDelay(
  policy: DecorrelatedJitterPolicy,
): Promise<DecorrelatedJitterPolicy> {
  const delayByMs = Math.max(
    policy.maxDelayMs,
    Utils.random(
      policy.delayByMs,
      (policy.previousDelayByMs ?? policy.delayByMs) * policy.multiplyBy,
    ),
  );

  await delay(delayByMs);

  policy.previousDelayByMs = delayByMs;

  return policy;
}

async function FibonacciBackoffDelay(policy: FibonacciBackoffPolicy) {
  const delayByMs = Math.max(
    policy.maxDelayMs,
    Utils.Fibonacci(policy.retryCount === 0 ? 1 : policy.retryCount) *
      policy.delayByMs,
  );

  await delay(delayByMs);

  policy.retryCount = policy.retryCount === 0 ? 2 : policy.retryCount + 1;

  return policy;
}

export async function defaultRetryDelayPolicy(
  _: number,
  __: HtypHeaders,
  policy?: RetryDelayPolicy,
): Promise<RetryDelayPolicy | null> {
  if (policy === "none" || policy === undefined) {
    return null;
  }

  switch (policy.type) {
    case RetryDelayAlgorithm.FIXED:
    case "fixed":
      await delay(policy.delayByMs);
      return policy;
    case RetryDelayAlgorithm.LINEAR_BACKOFF:
    case "linear_backoff":
      return linearBackoffDelay(policy);
    case RetryDelayAlgorithm.EXPONENTIAL_BACKOFF:
    case "exponential_backoff":
      return exponentialBackoffDelay(policy);
    case RetryDelayAlgorithm.EXPONENTIAL_BACKOFF_FULL_JITTER:
    case "exponential_backoff_full_jitter":
      return exponentialBackoffFullJitterDelay(policy);
    case RetryDelayAlgorithm.EXPONENTIAL_BACKOFF_EQUAL_JITTER:
    case "exponential_backoff_equal_jitter":
      return exponentialBackoffEqualJitterDelay(policy);
    case RetryDelayAlgorithm.DECORRELATED_JITTER:
    case "decorrelated_jitter":
      return decorrelatedJitterDelay(policy);
    case RetryDelayAlgorithm.FIBONACCI_BACKOFF:
    case "fibonacci_backoff":
      return FibonacciBackoffDelay(policy);
    default:
      return policy;
  }
}

export function requestShouldRetry(
  config: HtypConfig,
  response: InternalHtypResponse,
): boolean {
  const configAllowsRetry =
    config.retry &&
    config.retryPolicy &&
    config._retryCount < config.retryPolicy.max;

  const policyAllowRetry = config.retryPolicy.condition(
    response.status,
    config.method,
    HtypHeaders.from(response.headers),
  );

  return configAllowsRetry && policyAllowRetry;
}
