export interface FetchCapture {
  url?: string;
  method?: string;
  body?: unknown;
  headers?: Headers;
}

export interface RespondWithInit extends ResponseInit {
  body?: BodyInit | null;
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
      capture.headers = new Headers(init?.headers);

      return new Response(this._respondWith.body, this._respondWith);
    };
  }
}
