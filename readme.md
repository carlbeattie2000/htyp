# htyp-fetch

Browser-only typed fetch wrapper with zero dependencies. The library is **WIP** and is being built for personal use. It will be maintained to the limit of my personal requirements. You will be much better of using `Axios` as that is actively maintained, and supports the three major adapters `fetch, http, xhr` and works in both the browser and node runtimes. I only support the browser with `fetch`.

### Installation
``` 
#pnpm
pnpm add htyp-fetch

#npm
npm install htyp-fetch

#yarn
yarn add htyp-fetch
```

### Basic usage
##### Request with URL as the only parameter
```ts
import htyp from "htyp-fetch"

await htyp.request("/foo");
```
##### Request with URL and config
```ts
import htyp from "htyp-fetch";

await htyp.request("/foo", {
	method: "post"
});
```

##### Request with config as the only parameter
```ts
import htyp from "htyp-fetch";

await htyp.request({
	url: "/foo",
	method: "post"
});
```
##### Request with body and instance example
```ts
import htyp from "htyp-fetch";

interface FindUserRequestBody {
  username: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface UserError {
  error: boolean;
  message: string;
}

async function findUser(username: string) {
  const res = await htyp.request<User, FindUserRequestBody, {}, UserError>(
    "/users/find",
    {
      method: "post",
      data: {
        username: username,
      },
      baseUrl: "https://some-site.com/",
    },
  );

  if (res.error) {
    console.log(res.data.message);
  } else {
    console.log(res.data.id, res.data.username, res.data.email);
  }
}

// Better yet, create an instance
const instance = htyp.create({
  baseUrl: "https://some-site.com/",
});

async function findUserWithInstance(username: string) {
  const res = await instance.request<User, FindUserRequestBody, {}, UserError>(
    "/users/find",
    {
      method: "post",
      data: {
        username: username,
      },
    },
  );

  if (res.error) {
    console.log(res.data.message);
  } else {
    console.log(res.data.id, res.data.username, res.data.email);
  }
}
```

###   Config

```ts
{
  baseUrl: '';
  
  url: '';
  
  method: 'get';

  allowAbsoluteUrls: false;
  
  data: {};
  
  params: {};

  transformRequest: [(data, headers) => data, (data, headers) => '' | (data, headers) => ''];

  transformResponse: [(data) => data];

  responseValidator: (responseData) => true | false;

  validateStatus: (status) => true | false;

  transitional: {
	  silentJSONParsing: false;
	  forcedJSONParsing: false;
	  errorHandling: "default";

  };
  
  credentials: '';

  mode: '';

  cache: '';

  redirect: '';
	
  keepalive: '';

  priority: '';

  referrer: '';

  referrerPolicy: '';

  headers: {
	  'content-type': 'application/json'
  };

  responseType: 'json';

  timeout: 15000;

  retry: false;

  retryPolicy: {
    condition: (status, method) => true | false;
    
    delay: (status, headers) => null;
    
    max: 1;
    
    _algorithm: {
      type: "LINEAR_BACKOFF";
      
      delayByMs: 100;
      
      increaseByMs: 150;
      
      maxDelayMs: 30_000;
    },
  };

  httpVersion: 2;

  redactKeys: [];
}

```
