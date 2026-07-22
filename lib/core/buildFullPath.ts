import HtypError from "./HtypError";
import combineURLs from "../helpers/combineURLs";
import isAbsoluteURL from "../helpers/isAbsoluteURL";

import type HtypConfig from "./config";

const malformedHttpProtocol = /^https?:(?!\/\/)/i;
const httpProtocolControlCharacters = /[\t\n\r]/g;

function stripLeadingC0ControlOrSpace(url: string): string {
  let i = 0;
  while (i < url.length && url.charCodeAt(i) <= 0x20) {
    i += 1;
  }
  return url.slice(i);
}

function normalizeURLForProtocolCheck(url: string): string {
  return stripLeadingC0ControlOrSpace(url).replace(
    httpProtocolControlCharacters,
    "",
  );
}

function redactFragment(fragment: string): string {
  if (!fragment) {
    return fragment;
  }

  return fragment.replace(
    /(^|&)([^=&]*=)?[^&]+/g,
    (_, separator, parameterName = "") =>
      `${separator}${parameterName}REDACTED`,
  );
}

function redactSensitiveURLParts(url: string) {
  const redactedURL = url.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1REDACTED@`);
  const fragmentIndex = redactedURL.indexOf("#");
  const urlWithoutFragment =
    fragmentIndex === -1 ? redactedURL : redactedURL.slice(0, fragmentIndex);
  const redactedURLWithoutFragment = urlWithoutFragment.replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1REDACTED`,
  );

  if (fragmentIndex === -1) {
    return redactedURLWithoutFragment;
  }

  return `${redactedURLWithoutFragment}#${redactFragment(redactedURL.slice(fragmentIndex + 1))}`;
}

function assertValidHttpProtocol(url: string, config: HtypConfig): void {
  const normalizedURL = normalizeURLForProtocolCheck(url);

  if (malformedHttpProtocol.test(normalizedURL)) {
    throw new HtypError(
      `Invalid URL ${JSON.stringify(redactSensitiveURLParts(normalizedURL))}: missing "//" after protocol`,
      HtypError.ERR_INVALID_URL,
      config,
    );
  }
}

export default function buildFullPath(
  baseURL: string,
  requestedURL: string,
  allowAbsoluteUrls: boolean,
  config: HtypConfig,
): string {
  assertValidHttpProtocol(requestedURL, config);

  const isRelativeUrl = !isAbsoluteURL(requestedURL);

  if (baseURL && (isRelativeUrl || !allowAbsoluteUrls)) {
    assertValidHttpProtocol(baseURL, config);

    return combineURLs(baseURL, requestedURL);
  }

  return requestedURL;
}
