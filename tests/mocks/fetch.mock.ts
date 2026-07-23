export interface FetchCapture {
  url?: string;
  method?: string;
  body?: unknown;
  headers?: Headers;
  request?: Request;
}

export interface RespondWithInit extends ResponseInit {
  body?: string | null;
}

function stringToReadableStream(
  str: string,
): ReadableStream<Uint8Array<ArrayBuffer>> {
  const bytes = new TextEncoder().encode(str);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export class MockFetch {
  public static _respondWith: RespondWithInit;

  public static respondWith(init?: RespondWithInit): void {
    if (!init) {
      this._respondWith = {
        status: 200,
        statusText: "OK",
      };
    } else {
      this._respondWith = init;
    }
  }

  public static fetch(capture: FetchCapture) {
    return async (url: string, init?: RequestInit): Promise<Response> => {
      capture.url = url;
      capture.method = init?.method ?? "GET";
      capture.body = init?.body;

      let stream: ReadableStream<Uint8Array<ArrayBuffer>> | null = null;

      if (
        this._respondWith.body !== null &&
        this._respondWith.body !== undefined
      ) {
        stream = stringToReadableStream(this._respondWith.body);
      }

      capture.request = new Request(url, init);
      capture.headers = new Headers(capture.request.headers);

      return new Response(stream, this._respondWith);
    };
  }
}
