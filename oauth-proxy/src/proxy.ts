export function proxy(endpoint: string) {
  return (request: Request) => {
    const { pathname, search } = new URL(request.url);
    const url = new URL("." + pathname, endpoint);
    url.search = search;

    console.log(request.url, " -> ", url.href);
    return fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });
  };
}
